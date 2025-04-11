import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use server-side API calls
})

interface GenerateEmailProps {
  businessName: string
  businessType: string
  businessAddress: string
  serviceOffering: string
  tone: 'professional' | 'friendly' | 'casual'
  painPoints?: string[]
}

export async function generateEmail({
  businessName,
  businessType,
  businessAddress,
  serviceOffering,
  tone = 'professional',
  painPoints = []
}: GenerateEmailProps) {
  const systemPrompt = `You are an expert business development professional writing a personalized outreach email.
The email should be:
- Concise and engaging
- Focused on value proposition
- Written in a ${tone} tone
- Include specific details about the business
- Address their potential pain points
- End with a clear call to action`

  const userPrompt = `Write an email to ${businessName}, a ${businessType} located at ${businessAddress}.
I want to offer them ${serviceOffering}.
${painPoints.length > 0 ? `Their potential pain points are: ${painPoints.join(', ')}` : ''}

The email should use variables where appropriate:
- {{company_name}} for the business name
- {{address}} for the business address

Format the response as a JSON object with 'subject' and 'body' fields.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      subject: response.subject || '',
      body: response.body || ''
    }
  } catch (error) {
    console.error('Error generating email:', error)
    throw new Error('Failed to generate email')
  }
} 