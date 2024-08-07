'use client'
import { useState, useEffect } from 'react'
import { Textarea } from '@nextui-org/input'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [threadId, setThreadId] = useState('')
  const [seenMessageIds, setSeenMessageIds] = useState(new Set())
  const [buttonText, setButtonText] = useState('Send')

  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'initializing thread' }),
        })
        const data = await response.json()
        console.log('Thread initialization response:', data)
        setThreadId(data.threadId)
        const initialMessages = data.messages.map((msg) => ({
          id: msg.id,
          role: 'assistant',
          content: msg.content,
        }))
        setMessages(initialMessages)
        setSeenMessageIds(new Set(initialMessages.map((msg) => msg.id)))
      } catch (error) {
        console.error('Error initializing thread:', error)
      }
    }

    if (!threadId) {
      createThread()
    }
  }, [threadId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setButtonText('Loading...')

    setTimeout(() => {
      setButtonText('Send')
    }, 8000) //set it to the time that it takes to gen a response

    try {
      if (!threadId) {
        console.error('Thread ID is not initialized.')
        return
      }

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, threadId, role: 'user' }),
      })
      const data = await response.json()
      console.log('Message response:', data)
      if (data.error) {
        console.error('Error:', data.error)
        return
      }
      const newAssistantMessages = data.messages.filter(
        (msg) => !seenMessageIds.has(msg.id),
      )
      setSeenMessageIds((prevIds) => {
        const newIds = new Set(prevIds)
        newAssistantMessages.forEach((msg) => newIds.add(msg.id))
        return newIds
      })
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: input },
        ...newAssistantMessages.map((msg) => ({
          role: 'assistant',
          content: msg.content,
        })),
      ])
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div>
      <div className="topnav">
        <h1 className="main-title">
          WhyMy
          <span className="sub-title">beta</span>
        </h1>
        <a href="mailto:teeraasasav@gmail.com" target="_blank">
          Feedback
        </a>
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
        <button type="submit">{buttonText}</button>
      </form>
      {/* <div className="sidebar"> */}
      {/* <button className='addchat'></button> */}
      {/* </div> */}
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
