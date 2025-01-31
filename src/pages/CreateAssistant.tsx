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
      <h1 className="text-4xl font-bold mb-8">Criar Agente</h1>
      
      <Card className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input id="name" placeholder="Ex: Amanda" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              placeholder="Descreva o que seu agente faz..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Agente</Label>
            <Textarea 
              id="prompt" 
              placeholder="Defina a personalidade do agente e coloque todas as informações..."
              className="resize-none"
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Temperatura: {temperature}</Label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Valores mais altos tornam a resposta do agente mais aleatória, valores mais baixos a tornam mais focada.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            Criar Agente
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateAssistant;
