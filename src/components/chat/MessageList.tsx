
import { useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { MessageItem } from "./MessageItem"
import TypingIndicator from "./TypingIndicator"

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  likes?: number;
  hasHashtags?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onLikeMessage: (messageId: string) => void;
}

const MessageList = ({ messages, isTyping, onLikeMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            onLike={onLikeMessage}
          />
        ))}
      </AnimatePresence>
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
