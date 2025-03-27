
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MessageTemplate {
  id: string;
  content: string;
  tags: string[];
  usage_count: number;
  is_favorite: boolean;
  created_at: string;
}

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadTemplates = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      console.error('Error loading message templates:', err);
      setError(err.message || 'Failed to load message templates');
      toast.error('Erro ao carregar modelos de mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (content: string, tags: string[] = []) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user.id,
          content,
          tags
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      toast.success('Modelo de mensagem salvo');
      return data;
    } catch (err: any) {
      console.error('Error saving message template:', err);
      toast.error('Erro ao salvar modelo de mensagem');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      );
      
      toast.success('Modelo de mensagem atualizado');
      return true;
    } catch (err: any) {
      console.error('Error updating message template:', err);
      toast.error('Erro ao atualizar modelo de mensagem');
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Modelo de mensagem excluído');
      return true;
    } catch (err: any) {
      console.error('Error deleting message template:', err);
      toast.error('Erro ao excluir modelo de mensagem');
      return false;
    }
  };

  const incrementUsage = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    const newCount = (template.usage_count || 0) + 1;
    await updateTemplate(id, { usage_count: newCount });
  };

  const toggleFavorite = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    await updateTemplate(id, { is_favorite: !template.is_favorite });
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    toggleFavorite
  };
}
