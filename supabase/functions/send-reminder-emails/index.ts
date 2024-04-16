import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const SB_URL = Deno.env.get('SB_URL')
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY')

const handler = async (request: Request): Promise<Response> => {
  const supabase = createClient(
    SB_URL ?? '',
    SB_SERVICE_ROLE_KEY ?? '',
    { global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } } }
  )

  const now = new Date().toISOString()

  const { data, error } = await supabase
      .from('reminders')
      .select(`id, user_id, email, description, location, img_url, created_at`)
      .eq('date', now)

  if (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } else if (!data || data.length === 0) {
    return new Response(JSON.stringify('No reminders to send'), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  data.forEach((reminder) => {
    fetch('https://rurzxhlhhwxpowcvcxyz.supabase.co/functions/v1/send-email-resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SB_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(reminder)
    })
  })
  
  return new Response(JSON.stringify(`Successfully send ${data?.length} reminders`), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

Deno.serve(handler)