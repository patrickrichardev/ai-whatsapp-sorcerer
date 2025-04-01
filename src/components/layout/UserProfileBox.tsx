
import { useState } from "react";
import { User, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfileBox() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Extrair o email ou nome de usuário para exibição
  const displayName = user?.email 
    ? user.email.split('@')[0] 
    : "Usuário";

  // Gerar iniciais para o fallback do avatar
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="p-4 border-t flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user?.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials || <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>

      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar perfil</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Editar Perfil</SheetTitle>
            <SheetDescription>
              Atualize suas informações de perfil aqui.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Funcionalidade de edição será implementada em breve.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
