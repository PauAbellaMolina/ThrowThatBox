import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as mod from 'https://deno.land/std@0.222.1/encoding/base64.ts'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SB_URL = Deno.env.get('SB_URL')
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY')

const handler = async (request: Request): Promise<Response> => {
  const reminder: { id: string, user_id: string, email: string, description: string, location: string, img_url: string, created_at: string } = await request.json()
  
  try {
    if (!reminder || !reminder?.email || reminder?.email === '') {
      throw new Error()
    }
    const supabase = createClient(
      SB_URL ?? '',
      SB_SERVICE_ROLE_KEY ?? '',
      { global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } } }
    )

    let base64;
    let contentType;
    if (reminder?.img_url && reminder?.img_url !== '') {
      const { data: imgData } = await supabase.storage.from('reminder_imgs').createSignedUrl(reminder?.user_id+'/'+reminder?.img_url, 10)
      if (imgData?.signedUrl) {
        const resp = await fetch(imgData.signedUrl)
        if(resp.status === 200) {
          contentType = resp.headers.get('content-type') ?? 'application/octet-stream';
          const buff = await resp.arrayBuffer()
          base64 = mod.encodeBase64(buff)
        }
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
        to: reminder?.email,
        subject: 'ThrowThatBox - Time to throw away a box!',
        html: `
          <h2>It's time to throw away "${reminder?.description}"</h2>
          <h3>You stored it"${reminder?.location ? ' at '+reminder?.location : ''}" on ${new Date(reminder?.created_at).toLocaleDateString('en-GB')}.</h3>
          ${base64 ? '<p>We attached a photo of the box. Happy clutter free life!</p>' : '<p>Happy clutter free life!</p>'}
          <p>ThrowThatBox</p>
        `,
        attachments: base64 ? [{
          filename: 'box.'+contentType?.split('/')[1],
          content: base64,
        }] : null
      }),
    })

    await supabase
      .from('reminders')
      .delete()
      .eq('id', reminder?.id)

    await supabase
      .storage
      .from('reminder_imgs')
      .remove([reminder.user_id+'/'+reminder?.img_url])
  } catch (_error) {
    return new Response(JSON.stringify(`Failed to send reminder with id ${reminder?.id}`), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  return new Response(JSON.stringify(`Successfully sent reminder with id ${reminder.id}`), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  })
}

Deno.serve(handler)
