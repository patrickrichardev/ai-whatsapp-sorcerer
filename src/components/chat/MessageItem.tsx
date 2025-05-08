
import { motion } from "framer-motion"
import { Message } from "./MessageList"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Copy, Repeat } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"

interface MessageItemProps {
  message: Message;
  onLike?: (id: string) => void;
}

export const MessageItem = ({ message, onLike }: MessageItemProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 mb-8"
    >
      <div className="flex items-start gap-4">
        {!isUser && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src="/elia.png" />
            <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex-1 ${isUser ? "pl-10" : ""}`}>
          <div className="text-sm font-medium mb-1">
            {isUser ? "Você" : "ChatGPT"}
          </div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            
            {message.hasAttachment && (
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Baixar imagem do layout</span>
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="14" height="14" x="8" y="2" rx="2" ry="2"/><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {!isUser && (
            <div className="mt-3 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onLike && onLike(message.id)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {message.likes ? message.likes : ""}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copiar
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Repeat className="h-3.5 w-3.5 mr-1" />
                Regenerar
              </Button>
            </div>
          )}
          
          {message.hasActions && (
            <div className="mt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                Gostou do layout? Quer ajustar algum detalhe no protótipo?
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
