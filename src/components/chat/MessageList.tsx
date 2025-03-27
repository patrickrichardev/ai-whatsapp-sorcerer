
import { useRef, useEffect } from "react"

interface Message {
  id: string
  content: string
  sender_type: 'customer' | 'agent'
  timestamp: string
  metadata?: any
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.sender_type === 'agent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p>{msg.content}</p>
            <span className="text-xs opacity-70">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
