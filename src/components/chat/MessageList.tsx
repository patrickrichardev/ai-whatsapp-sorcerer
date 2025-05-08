
import { useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { MessageItem } from "./MessageItem"
import TypingIndicator from "./TypingIndicator"

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  likes?: number;
  hasHashtags?: boolean;
  hasAttachment?: boolean;
  hasActions?: boolean;
  sender_type?: 'customer' | 'agent';
}

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onLikeMessage?: (messageId: string) => void;
}

const MessageList = ({ messages, isTyping = false, onLikeMessage = () => {} }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div className="w-full max-w-3xl mx-auto pt-8">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            onLike={onLikeMessage}
          />
        ))}
      </AnimatePresence>
      
      {isTyping && (
        <div className="flex items-start gap-4 mb-6">
          <div className="h-8 w-8 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xs">AI</span>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">ChatGPT</div>
            <TypingIndicator />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
