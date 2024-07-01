'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@nextui-org/input'
import OpenAI from 'openai'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [threadId, setThreadId] = useState(null) // State to store thread ID
  const [lastMessageId, setLastMessageId] = useState(null) // State to store last message ID
  const [seenMessageIds, setSeenMessageIds] = useState(new Set()) // State to track seen message IDs

  useEffect(() => {
    // Initialize a new thread when component mounts
    initializeThread()
  }, [])

  const initializeThread = async () => {
    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      const thread = await openai.beta.threads.create()
      setThreadId(thread.id) // Store the thread ID
    } catch (error) {
      console.error('Error initializing thread:', error)
      // Handle error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      // Ensure threadId exists before making API calls
      if (!threadId) {
        console.error('Thread ID is not initialized.')
        return
      }

      const assistant = await openai.beta.assistants.retrieve(
        'asst_8gevepD9heOgP8wxYGiGl9rh',
      )

      console.log('User:', input)

      const userMessage = {
        role: 'user',
        content: input,
      }

      setMessages((prevMessages) => [...prevMessages, userMessage])

      await openai.beta.threads.messages.create(threadId, userMessage)

      const run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistant.id,
      })

      if (run.status === 'completed') {
        const responseMessages = await openai.beta.threads.messages.list(
          threadId,
        )

        // Find all assistant messages in the response that have not been seen
        const newAssistantMessages = responseMessages.data.filter(
          (msg) => msg.role === 'assistant' && !seenMessageIds.has(msg.id),
        )

        // Extract text content from each assistant message
        const assistantResponses = newAssistantMessages.map((msg) => {
          console.log('WhyMy:', msg.content[0].text.value)
          return msg.content[0].text.value
        })

        setSeenMessageIds((prevIds) => {
          const newIds = new Set(prevIds)
          newAssistantMessages.forEach((msg) => newIds.add(msg.id))
          return newIds
        })

        // Update messages state with assistant responses
        setMessages((prevMessages) => [
          ...prevMessages,
          ...assistantResponses.map((content) => ({
            role: 'assistant',
            content,
          })),
        ])
      } else {
        console.error('Error:', run.status)
      }

      setInput('')
    } catch (error) {
      console.error('Error:', error)
      // Handle error state here
    }
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
      <div className="sidebar">
        {/* <button className='addchat'></button> */}
      </div>
    </div>
  )
}
