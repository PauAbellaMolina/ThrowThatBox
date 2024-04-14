import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as mod from 'https://deno.land/std@0.222.1/encoding/base64.ts'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SB_URL = Deno.env.get('SB_URL')
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY')

const handler = async (_request: Request): Promise<Response> => {
  const supabase = createClient(
    SB_URL ?? '',
    SB_SERVICE_ROLE_KEY ?? '',
    { global: { headers: { Authorization: _request.headers.get('Authorization') ?? '' } } }
  )

  const now = new Date().toISOString()

  const { data, error } = await supabase
      .from('reminders')
      .select(`id, user_id, description, location, img_url, created_at`)
      .eq('date', now)

  if (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } else if (!data || data.length === 0) {
    return new Response(JSON.stringify('No reminders to send'), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  data?.forEach(async (reminder) => {
    const { data: userData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', reminder.user_id)
      .single()

    if (usersError || !userData?.email) {
      return new Response(JSON.stringify(usersError), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const { data: imgData } = await supabase.storage.from('reminder_imgs').createSignedUrl(userData.id+'/'+reminder.img_url, 10)
    let base64;
    let contentType;
    if (imgData?.signedUrl) {
      const resp = await fetch(imgData.signedUrl)
      if(resp.status === 200) {
        contentType = resp.headers.get('content-type') ?? 'application/octet-stream';
        const buff = await resp.arrayBuffer()
        base64 = mod.encodeBase64(buff)
      }
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ThrowThatBox <team@elteutikt.com>',
        to: userData?.email,
        subject: 'ThrowThatBox - Time to throw away a box!',
        html: `
          <h2>It's time to throw away "${reminder?.description}"</h2>
          <h3>You stored it at "${reminder?.location}" on ${new Date(reminder?.created_at).toLocaleDateString('en-GB')}.</h3>
          ${base64 ? '<p>We attached a photo of the box. Happy clutter free life!</p>' : null}
          <p>ThrowThatBox</p>
        `,
        attachments: [
          base64 ? {
            filename: 'box.'+contentType?.split('/')[1],
            content: base64,
          } : null,
        ] 
      }),
    })

    await supabase
      .from('reminders')
      .delete()
      .eq('id', reminder.id)

    await supabase
      .storage
      .from('reminder_imgs')
      .remove([userData.id+'/'+reminder.img_url])
  })
  
  return new Response(JSON.stringify(`Sent ${data?.length} reminders`), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(handler)