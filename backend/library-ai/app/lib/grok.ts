/**
 * lib/grok.ts — xAI Grok API client
 * https://docs.x.ai/docs/getting-started
 */

import { safeJsonParse } from './utils'
import type { UserProfile, BorrowRecord, Order, Book } from './types'

export const GROK_FAST = 'grok-beta'
export const GROK_SMART = 'grok-beta'

export function getGrokClient() {
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          // Mock response structure matching OpenAI API for compatibility
          return {
            choices: [{
              message: {
                content: 'Mock Grok response - implement grokComplete integration',
              }
            }]
          }
        }
      }
    }
  }
}

export interface UserContext {
  profile: UserProfile
  borrows: Pick<BorrowRecord, 'book_id' | 'status'>[]
  orders: Pick<Order, 'id' | 'status'>[]
  cartBookIds: string[]
  recentBooks: Pick<Book, 'id' | 'title' | 'author' | 'genres'>[]
}

export async function grokComplete(params: {
  model: string
  maxTokens: number
  temperature: number
  systemPrompt: string
  prompt: string
}): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.XAI_API_KEY ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.prompt }
      ],
      model: params.model,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Grok API: ${response.status} ${err}`)
  }

  const data: any = await response.json()
  return data.choices[0].message.content || ''
}

export function buildSystemPrompt(role: 'librarian' | 'search' | 'recommender' | 'tagger', ctx?: UserContext): string {
  const prompts = {
    librarian: 'You are a helpful librarian assistant.',
    search: 'You are a book search expert.',
    recommender: 'You are a book recommendation expert.',
    tagger: 'You tag books with relevant genres.',
  } as const
  return ctx ? `${prompts[role]}

User: ${JSON.stringify(ctx, null, 2)}` : prompts[role]
}

export function parseGrokJson<T>(raw: string): T {
  // Safe JSON extraction without /s flag
  const jsonStart = raw.indexOf('```json')
  if (jsonStart === -1) {
    const parsed = safeJsonParse<T>(raw.trim())
    if (!parsed) throw new Error('Invalid JSON from Grok')
    return parsed
  }

  const afterStart = raw.slice(jsonStart + 7)
  const jsonEnd = afterStart.indexOf('```')
  const jsonStr = jsonEnd === -1 ? afterStart.trim() : afterStart.slice(0, jsonEnd).trim()

  const parsed = safeJsonParse<T>(jsonStr)
  if (!parsed) throw new Error('Invalid JSON from Grok')
  return parsed
}
