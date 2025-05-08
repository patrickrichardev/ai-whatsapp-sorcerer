
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Copy, Heart, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface MessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    likes?: number;
    hasHashtags?: boolean;
  };
  onLike: (messageId: string) => void;
}

export const MessageItem = ({ message, onLike }: MessageProps) => {
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Conteúdo copiado para a área de transferência!")
  }

  const saveContent = () => {
    toast.success("Conteúdo salvo nas suas criações!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[90%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src="/elia.png" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-2 flex-1">
            <div className="text-sm font-medium">
              {message.role === "user" ? "Você" : "Social Content Pro"}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {message.role === "assistant" && (
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7" 
                    onClick={() => copyToClipboard(message.content)}
                    title="Copiar conteúdo"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => saveContent()}
                    title="Salvar conteúdo"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 relative"
                    onClick={() => onLike(message.id)}
                    title="Curtir"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {message.likes && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {message.likes}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* For messages with hashtags, highlight them */}
            {message.role === "assistant" && message.hasHashtags && (
              <div className="mt-3 bg-muted/60 p-2 rounded-lg">
                <p className="text-xs font-medium mb-1">Hashtags sugeridas:</p>
                <div className="flex flex-wrap gap-1">
                  {["#AutoCuidado", "#SaúdeMental", "#BemEstar", "#EquilíbrioEmocional"].map(tag => (
                    <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
