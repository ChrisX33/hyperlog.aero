import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, linkedin, turnstileToken } = body;

    // Validate required fields
    if (!name || !email || !linkedin) {
      return new Response(JSON.stringify({ error: 'Name, email, and LinkedIn profile are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic LinkedIn URL validation
    if (!linkedin.includes('linkedin.com')) {
      return new Response(JSON.stringify({ error: 'Please provide a valid LinkedIn profile URL.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify Turnstile token
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: 'Verification failed. Please try again.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Forward to JetLink admin API for database storage + email notification
    const jetlinkApiUrl = process.env.JETLINK_API_URL;
    const jetlinkInternalKey = process.env.JETLINK_INTERNAL_KEY;

    if (jetlinkApiUrl && jetlinkInternalKey) {
      try {
        const jetlinkRes = await fetch(`${jetlinkApiUrl}/api/admin/hyperlog-wp/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': jetlinkInternalKey,
          },
          body: JSON.stringify({ name, email, linkedin }),
        });

        if (jetlinkRes.ok) {
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        console.error('JetLink API returned error:', jetlinkRes.status);
      } catch (jetlinkErr) {
        console.error('Failed to reach JetLink API:', jetlinkErr);
      }
    }

    // Fallback: send email directly if JetLink API is unavailable
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'noreply@hyperlog.aero';
    const contactEmail = process.env.CONTACT_EMAIL || 'info@hyperlog.aero';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP not configured and JetLink API unavailable');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"HyperLog Whitepaper" <${smtpFrom}>`,
      to: contactEmail,
      replyTo: email,
      subject: `[HyperLog] Whitepaper Request: ${name}`,
      text: [
        `Whitepaper request (fallback - not stored in admin database):`,
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `LinkedIn: ${linkedin}`,
      ].join('\n'),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Whitepaper request error:', err);
    return new Response(JSON.stringify({ error: 'Failed to submit request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
