import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { toast } from "sonner";

const CreateAssistant = () => {
  const [temperature, setTemperature] = useState([0.7]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Assistant created successfully!");
  };

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create Assistant</h1>
      
      <Card className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Assistant Name</Label>
            <Input id="name" placeholder="e.g., Customer Support Bot" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe what your assistant does..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea 
              id="prompt" 
              placeholder="Define your assistant's personality and behavior..."
              className="resize-none"
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Temperature: {temperature}</Label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Higher values make the output more random, lower values make it more focused.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            Create Assistant
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateAssistant;