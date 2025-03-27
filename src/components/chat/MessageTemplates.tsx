
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { MessageTemplate, useMessageTemplates } from "@/hooks/useMessageTemplates";
import { Star, Search, Trash2, Send, SaveIcon, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
  currentMessage: string;
}

export default function MessageTemplates({ onSelectTemplate, currentMessage }: MessageTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    templates, 
    isLoading, 
    saveTemplate, 
    deleteTemplate, 
    incrementUsage,
    toggleFavorite 
  } = useMessageTemplates();

  const handleSaveCurrentMessage = async () => {
    if (!currentMessage.trim()) {
      toast.error("Mensagem vazia não pode ser salva");
      return;
    }
    
    const result = await saveTemplate(currentMessage);
    if (result) {
      toast.success("Mensagem salva como modelo");
      setIsOpen(false);
    }
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    onSelectTemplate(template.content);
    incrementUsage(template.id);
    setIsOpen(false);
  };

  const filteredTemplates = templates.filter(template => 
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Modelos de mensagem">
          <SaveIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Modelos de Mensagem</SheetTitle>
        </SheetHeader>
        
        <div className="p-6 space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar modelos..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {currentMessage && (
              <Button onClick={handleSaveCurrentMessage}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Salvar atual
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredTemplates.length > 0 ? (
            <div className="space-y-3 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="text-sm mb-2">{template.content}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      Usado {template.usage_count || 0} vezes
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleFavorite(template.id)}
                        className={template.is_favorite ? "text-yellow-500" : ""}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Usar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? "Nenhum modelo encontrado para esta busca" 
                : "Nenhum modelo de mensagem salvo"}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
