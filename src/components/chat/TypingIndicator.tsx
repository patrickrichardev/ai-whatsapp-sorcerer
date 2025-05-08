
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { motion } from "framer-motion"

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-card border border-border p-3 rounded-2xl flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/elia.png" />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="text-sm font-medium">Social Content Pro</div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
