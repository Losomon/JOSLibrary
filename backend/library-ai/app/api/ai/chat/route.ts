import { NextRequest } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { getCurrentUserWithRole } from '../../../lib/auth'
import { handleApiError, ok, parseBody } from '../../../lib/utils'
import { AiChatRequestSchema } from '../../../lib/types'
import { getGrokClient } from '../../../lib/grok'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const { messages } = parseBody(req, AiChatRequestSchema) as any

    const grok = getGrokClient()
    
    const systemPrompt = `You are JOS Library AI assistant. Help users with book recommendations, searches, borrowing status, and library info.
    
User: ${JSON.stringify(user, null, 2)}`

    const response = await grok.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || 'Sorry, no response.'

    return ok({ reply: content })
  } catch (err) {
    return handleApiError(err)
  }
}
