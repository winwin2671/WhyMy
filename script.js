import { config } from 'dotenv'
config()

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo-16k',
  messages: [{ role: 'user', content: 'Hello!' }],
})
console.log(completion.choices[0].message)
