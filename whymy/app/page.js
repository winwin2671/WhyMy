'use client'

import { useState } from 'react'
import { Textarea } from '@nextui-org/input'
import OpenAI from 'openai'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })

    const assistant = await openai.beta.assistants.retrieve(
      'asst_8gevepD9heOgP8wxYGiGl9rh',
    )
    const thread = await openai.beta.threads.create()

    console.log('User:', input)

    const userMessage = {
      role: 'user',
      content: input,
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])

    await openai.beta.threads.messages.create(thread.id, userMessage)

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    })

    if (run.status === 'completed') {
      const responseMessages = await openai.beta.threads.messages.list(
        run.thread_id,
      )
      const botMessage = responseMessages.data
        .reverse()
        .find((msg) => msg.role === 'assistant')

      if (botMessage) {
        // Log OpenAI bot message
        console.log('WhyMy:', botMessage.content[0].text.value)

        const assistantMessage = {
          role: 'assistant',
          content: botMessage.content[0].text.value,
        }

        setMessages((prevMessages) => [...prevMessages, assistantMessage])
      } else {
        console.error('No bot message found in response.')
      }
    } else {
      console.error('Error:', run.status)
    }

    setInput('')
  }

  return (
    <div>
      <div className="topnav">
        <h1>WhyMy</h1>
      </div>
      <div className="chat">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'WhyMy'}:</strong>{' '}
            {msg.content}
          </div>
        ))}
      </div>
      <form className="messageForm" onSubmit={handleSubmit}>
        <Textarea
          placeholder="Message WhyMy"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <div className="sidebar"></div>
    </div>
  )
}
