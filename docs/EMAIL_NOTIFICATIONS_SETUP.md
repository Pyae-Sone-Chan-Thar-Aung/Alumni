# Email Notifications Setup (Supabase Edge Functions)

This guide enables email sending for notifications (registration approved/rejected, job approved, internal news).

## 1) Create Edge Function (TypeScript)

```ts
// functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const SENDGRID_KEY = Deno.env.get('SENDGRID_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL');

async function sendEmail({ to, subject, html }: EmailPayload) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
  if (!res.ok) throw new Error(`SendGrid error ${res.status}`);
}

serve(async (req) => {
  try {
    const payload = await req.json();
    await sendEmail(payload);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
```

Deploy the function:
```bash
supabase functions deploy send-email
supabase secrets set --env-file ./functions/.env
```

Secrets required:
- SENDGRID_API_KEY=... (or provider of your choice)
- FROM_EMAIL=no-reply@yourdomain.com

## 2) DB Trigger → Call Edge Function

Create a Postgres function to call the Edge Function when a notification is inserted.

```sql
create or replace function public.send_notification_email()
returns trigger language plpgsql as $$
begin
  -- only send for specific types
  if NEW.type in ('registration_approved','registration_rejected','job_approved','news') then
    perform
      net.http_post(
        url := 'https://<your-project-ref>.functions.supabase.co/send-email',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '|| current_setting('app.settings.service_role_key', true)),
        body := jsonb_build_object(
          'to', (select email from public.users where id = NEW.user_id),
          'subject', case NEW.type 
            when 'registration_approved' then 'Your Registration was Approved'
            when 'registration_rejected' then 'Your Registration was Rejected'
            when 'job_approved' then 'Your Job Post was Approved'
            else coalesce(NEW.title,'UIC Alumni Update') end,
          'html', coalesce(NEW.message,'')
        )::text
      );
  end if;
  return NEW;
end;
$$;

-- Requires Postgres HTTP extension (net/http). If unavailable, call from backend instead
-- Attach trigger on insert into notifications
create trigger trg_send_notification_email
  after insert on public.notifications
  for each row execute function public.send_notification_email();
```

If `net.http_post` is not available, call the Edge Function from your backend (Node/Laravel) on insert.

## 3) Test
- Insert a notification row in `public.notifications` with type = 'registration_approved' and verify email.
- Approve a registration in the Admin Dashboard; confirm email is received.

## Notes
- Ensure RLS allows email function or run as SECURITY DEFINER.
- Throttle or batch emails if sending to many recipients.
