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
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    messages: [{ role: 'user', content: input }],
  })
  console.log(completion.choices[0].message)
  userInterface.prompt()
})
