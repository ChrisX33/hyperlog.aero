import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, company, message, turnstileToken } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
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

    // Send email via SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'noreply@hyperlog.aero';
    const contactEmail = process.env.CONTACT_EMAIL || 'info@hyperlog.aero';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured.' }), {
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

    const companyLine = company ? `Company/Organisation: ${company}` : '';
    const textBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      companyLine,
      '',
      'Message:',
      message,
    ].filter(Boolean).join('\n');

    await transporter.sendMail({
      from: `"HyperLog Enquiry" <${smtpFrom}>`,
      to: contactEmail,
      replyTo: email,
      subject: `[HyperLog] New Contact: ${name}${company ? ` (${company})` : ''}`,
      text: textBody,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send message.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
