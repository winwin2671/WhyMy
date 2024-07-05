import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function handleThreadInteraction(threadId, prompt, role) {
  if (!threadId) {
    const thread = await openai.beta.threads.create()
    threadId = thread.id
  }

  const assistant = await openai.beta.assistants.retrieve(
    'asst_8gevepD9heOgP8wxYGiGl9rh',
  )

  const userMessage = { role: role || 'user', content: prompt }
  await openai.beta.threads.messages.create(threadId, userMessage)

  try {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant.id,
    })

    if (run.status === 'completed') {
      const responseMessages = await openai.beta.threads.messages.list(threadId)
      const newAssistantMessages = responseMessages.data.filter(
        (msg) => msg.role === 'assistant',
      )
      return {
        messages: newAssistantMessages.map((msg) => ({
          id: msg.id,
          content: msg.content[0].text.value,
        })),
        threadId,
      }
    } else {
      throw new Error('Run did not complete successfully')
    }
  } catch (error) {
    if (error.message.includes('already has an active run')) {
      // Handle the case where the thread already has an active run
      const responseMessages = await openai.beta.threads.messages.list(threadId)
      const newAssistantMessages = responseMessages.data.filter(
        (msg) => msg.role === 'assistant',
      )
      return {
        messages: newAssistantMessages.map((msg) => ({
          id: msg.id,
          content: msg.content[0].text.value,
        })),
        threadId,
      }
    } else {
      throw error
    }
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request) {
  console.log('Route handler hit')
  try {
    const { prompt, threadId, role } = await request.json()
    const { messages, threadId: newThreadId } = await handleThreadInteraction(
      threadId,
      prompt,
      role,
    )
    return NextResponse.json(
      { messages, threadId: newThreadId },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
