import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, FileText, MessageSquare, XOctagon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Settings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Suporte
            </CardTitle>
            <CardDescription>
              Precisa de ajuda? Entre em contato com nosso suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = 'mailto:suporte@seudominio.com'}
              variant="outline"
              className="w-full"
            >
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>

        {/* Faturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Faturas
            </CardTitle>
            <CardDescription>
              Visualize suas faturas e histórico de pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Faturas
            </Button>
          </CardContent>
        </Card>

        {/* Cartão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pagamento
            </CardTitle>
            <CardDescription>
              Atualize suas informações de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Atualizar Cartão
            </Button>
          </CardContent>
        </Card>

        {/* Cancelamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XOctagon className="h-5 w-5" />
              Cancelar Assinatura
            </CardTitle>
            <CardDescription>
              Cancele sua assinatura a qualquer momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Cancelar Assinatura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tem certeza que deseja cancelar?</DialogTitle>
                  <DialogDescription>
                    Ao cancelar sua assinatura, você perderá acesso a todos os recursos premium ao final do período atual.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Voltar</Button>
                  <Button variant="destructive">Confirmar Cancelamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}