import sgMail from '@sendgrid/mail'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

// Rate limiting configuration
const RATE_LIMIT = 100 // emails per second (adjust based on your SendGrid plan)
const BATCH_SIZE = 50 // number of emails to process in each batch

interface EmailContent {
  to: string
  from: string
  subject: string
  text: string
  html: string
  campaignId?: string
  customArgs?: Record<string, string>
}

export class EmailService {
  private queue: EmailContent[] = []
  private processing = false
  private lastSentTimestamp = 0

  private async rateLimitDelay() {
    const now = Date.now()
    const timeSinceLastSend = now - this.lastSentTimestamp
    const minimumGap = 1000 / RATE_LIMIT // minimum time between sends

    if (timeSinceLastSend < minimumGap) {
      await new Promise(resolve => setTimeout(resolve, minimumGap - timeSinceLastSend))
    }
    this.lastSentTimestamp = Date.now()
  }

  private async processBatch(batch: EmailContent[]) {
    const results = []
    
    for (const email of batch) {
      try {
        await this.rateLimitDelay()
        await sgMail.send(email)
        results.push({ success: true, email })
      } catch (error) {
        console.error('Error sending email:', error)
        results.push({ 
          success: false, 
          email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return results
  }

  async sendBulk(emails: EmailContent[]) {
    this.queue.push(...emails)
    
    if (this.processing) {
      return
    }

    this.processing = true
    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      errors: [] as any[]
    }

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, BATCH_SIZE)
        const batchResults = await this.processBatch(batch)

        batchResults.forEach(result => {
          if (result.success) {
            results.sent++
          } else {
            results.failed++
            results.errors.push({
              email: result.email.to,
              error: result.error
            })
          }
        })
      }
    } finally {
      this.processing = false
    }

    return results
  }

  async sendSingle(email: EmailContent) {
    try {
      await sgMail.send(email)
      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
} 