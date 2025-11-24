import sgMail from '@sendgrid/mail'

/**
 * Composable for sending emails via SendGrid
 * 
 * IMPORTANT SECURITY NOTE:
 * Using SendGrid API key client-side exposes it to users.
 * For production, consider using Firebase Cloud Functions or a backend API
 * to keep your API key secure.
 */
export function useSendGrid() {
  const apiKey = import.meta.env.VITE_SENDGRID_API_KEY
  
  if (!apiKey) {
    throw new Error('SendGrid API key not found. Please set VITE_SENDGRID_API_KEY in your .env file')
  }

  sgMail.setApiKey(apiKey)

  const sendEmail = async (to: string, from: string, subject: string, text: string, html?: string) => {
    try {
      const msg = {
        to,
        from,
        subject,
        text,
        html: html || text,
      }

      await sgMail.send(msg)
      return { success: true }
    } catch (error: any) {
      console.error('SendGrid error:', error)
      if (error.response) {
        console.error('Error response body:', error.response.body)
      }
      throw new Error(error.message || 'Failed to send email')
    }
  }

  const sendContactFormEmail = async (name: string, email: string, message: string, recipientEmail?: string) => {
    const fromEmail = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@example.com'
    const toEmail = recipientEmail || import.meta.env.VITE_SENDGRID_TO_EMAIL || fromEmail
    
    const subject = `New Contact Form Submission from ${name}`
    const text = `
      New contact form submission:

      Name: ${name}
      Email: ${email}

      Message:
      ${message}
    `.trim()

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      </div>
    `

    return await sendEmail(toEmail, fromEmail, subject, text, html)
  }

  return {
    sendEmail,
    sendContactFormEmail,
  }
}


