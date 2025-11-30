/**
 * Composable for sending emails via SendGrid through Firebase Cloud Functions
 */
import { inject } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type { FirebaseApp } from 'firebase/app'

interface SendEmailData {
  to: string
  from: string
  subject: string
  text: string
  html?: string
}

export function useSendGrid() {
  const firebaseApp = inject<FirebaseApp>('firebaseApp')
  
  if (!firebaseApp) {
    throw new Error('Firebase app not found. Make sure Firebase is initialized in main.ts')
  }

  const functions = getFunctions(firebaseApp)
  const sendEmailFunction = httpsCallable<SendEmailData, {success: boolean}>(functions, 'sendEmail')

  const sendEmail = async (to: string, from: string, subject: string, text: string, html?: string) => {
    try {
      const result = await sendEmailFunction({
        to,
        from,
        subject,
        text,
        html: html || text,
      })
      
      return result.data
    } catch (error: unknown) {
      console.error('SendGrid error:', error)
      
      // Firebase callable functions throw HttpsError objects
      // Extract the error message properly
      let errorMessage = 'Failed to send email'
      
      if (error && typeof error === 'object' && 'code' in error) {
        // This is a Firebase HttpsError
        const httpsError = error as {code: string; message: string; details?: unknown}
        errorMessage = httpsError.message || `Error: ${httpsError.code}`
        console.error('Firebase error details:', httpsError.details)
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  const sendContactFormEmail = async (name: string, from: string, message: string, to?: string) => {
    const toEmail = to || import.meta.env.VITE_SENDGRID_TO_EMAIL || 'hikevintran@gmail.com'

    const subject = `New Contact Form Submission from ${name}`
    const text = `
      New contact form submission:

      Name: ${name}
      Email: ${from}

      Message:
      ${message}
    `.trim()

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${from}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      </div>
    `

    return await sendEmail(toEmail, from, subject, text, html)
  }

  return {
    sendEmail,
    sendContactFormEmail,
  }
}


