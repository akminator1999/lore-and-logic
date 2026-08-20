import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

 const fromAddress = process.env.EMAIL_FROM || 'Lore & Logic <notifications@loreandlogic.com>'

 const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

 export async function sendEmail({
    to,
    subject,
    body,
    actionUrl,
 }: {
    to: string
    subject: string
    body: string
    actionUrl?: string 
 }) {
    try {
        await resend.emails.send({
            from: fromAddress,
            to: to,
            subject: subject,
            html: `
        <div style="max-width: 600px; margin: 0 auto; background: #0B0F19; color: #fff; padding: 30px; border-radius: 12px; font-family: sans-serif;">
          <h1 style="color: #7C3AED; margin-bottom: 20px;">Lore &amp; Logic</h1>
          <p style="font-size: 16px; line-height: 1.6;">${body}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; background: #7C3AED; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
              View on Lore &amp; Logic
            </a>
          ` : ''}
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">© ${new Date().getFullYear()} Lore &amp; Logic. You received this email because you are a member of our community.</p>
        </div>
      `,
        })
    } catch (error) {
        console.error('Failed to send email:', error)
    }
 }
