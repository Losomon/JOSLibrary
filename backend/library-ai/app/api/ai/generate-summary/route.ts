import { NextRequest } from 'next/server'
import { handleApiError, ok, parseBody } from '../../../lib/utils'
import { getGrokClient } from '../../../lib/grok'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const GenerateSummarySchema = z.object({
  content: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const { content } = await parseBody(req, GenerateSummarySchema)

    const grok = getGrokClient()

    const response = await grok.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates concise summaries of text. Provide a brief summary of the following content.' 
        },
        { role: 'user', content },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const summary = response.choices[0]?.message?.content || 'Unable to generate summary.'

    return ok({ summary })
  } catch (err) {
    return handleApiError(err)
  }
}

