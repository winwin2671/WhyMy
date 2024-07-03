import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  const { prompt, threadId, role } = req.body

  if (req.method === 'POST') {
    try {
      if (!threadId) {
        // Initialize a new thread
        const thread = await openai.beta.threads.create()
        res.status(200).json({ threadId: thread.id })
      } else {
        // Retrieve the assistant
        const assistant = await openai.beta.assistants.retrieve(
          'asst_8gevepD9heOgP8wxYGiGl9rh',
        )

        // Create a message
        const userMessage = {
          role: role || 'user',
          content: prompt,
        }
        await openai.beta.threads.messages.create(threadId, userMessage)

        // Create and poll a run
        const run = await openai.beta.threads.runs.createAndPoll(threadId, {
          assistant_id: assistant.id,
        })

        if (run.status === 'completed') {
          const responseMessages = await openai.beta.threads.messages.list(
            threadId,
          )

          // Filter new assistant messages
          const newAssistantMessages = responseMessages.data.filter(
            (msg) => msg.role === 'assistant',
          )

          const assistantResponses = newAssistantMessages.map((msg) => ({
            id: msg.id,
            content: msg.content[0].text.value,
          }))

          res.status(200).json({ messages: assistantResponses })
        } else {
          res.status(500).json({ error: 'Run did not complete successfully' })
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
