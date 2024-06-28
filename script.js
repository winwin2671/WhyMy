import { config } from 'dotenv'
config()

import OpenAI from 'openai'
import readline from 'readline'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

userInterface.prompt()
userInterface.on('line', async (input) => {
  const assistant = await openai.beta.assistants.retrieve(
    'asst_8gevepD9heOgP8wxYGiGl9rh',
  )

  // const thread = await openai.beta.threads.create()

  const thread = await openai.beta.threads.retrieve(
    'thread_GKcmu3oi0VCmagzIY87zgCpf',
  )

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: input,
  })

  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
  })

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id)
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${message.content[0].text.value}`)
    }
  } else {
    console.log(run.status)
  }
  userInterface.prompt()
})
