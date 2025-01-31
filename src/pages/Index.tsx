import { Card } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Assistants</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center text-muted-foreground py-8">
          No recent activity
        </div>
      </Card>
    </div>
  );
};

export default Index;