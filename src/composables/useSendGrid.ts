/**
 * Composable for sending emails via SendGrid through the backend API
 */
export function useSendGrid() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          text,
          html: html || text,
        }),
      })

      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        
        if (isJson) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            // If JSON parsing fails, use the default error message
          }
        } else {
          // If response is HTML (like a 404 page), provide a helpful error
          const text = await response.text()
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage = `Server not responding correctly. Make sure the server is running on ${apiUrl}`
          }
        }
        
        throw new Error(errorMessage)
      }

      if (!isJson) {
        throw new Error('Server returned non-JSON response')
      }

      return await response.json()
    } catch (error: any) {
      console.error('SendGrid error:', error)
      
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Cannot connect to server at ${apiUrl}. Make sure the server is running.`)
      }
      
      throw new Error(error.message || 'Failed to send email')
    }
  }

  const sendContactFormEmail = async (name: string, email: string, message: string, recipientEmail?: string) => {
    const toEmail = recipientEmail || import.meta.env.VITE_SENDGRID_TO_EMAIL || 'ktra0069@student.monash.edu'
    
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

    return await sendEmail(toEmail, subject, text, html)
  }

  return {
    sendEmail,
    sendContactFormEmail,
  }
}


