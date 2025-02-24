
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, AlertTriangle, WhatsApp } from "lucide-react"
import { useSearchParams } from "react-router-dom"

const ConnectWhatsApp = () => {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent_id")

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Conectar WhatsApp</h1>
          <p className="text-muted-foreground">
            Escolha como você deseja conectar seu agente ao WhatsApp
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2 mt-1" />
          <AlertDescription>
            Você precisa ter o WhatsApp Business instalado no seu celular para
            poder usar esta funcionalidade.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <Link
            to={agentId ? `/connect-whatsapp/qr?agent_id=${agentId}` : "#"}
            className={!agentId ? "pointer-events-none opacity-50" : ""}
          >
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <WhatsApp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    WhatsApp via QR Code
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Conecte escaneando um QR Code com o WhatsApp Business do seu
                    celular. Recomendado para testes.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <WhatsApp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">WhatsApp Cloud API</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Em breve
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Conecte usando a API oficial do WhatsApp Business. Recomendado
                  para uso em produção.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {!agentId && (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  Selecione um agente primeiro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você precisa selecionar um agente antes de conectá-lo ao
                  WhatsApp.
                </p>
              </div>
              <Link
                to="/select-agent"
                className="inline-flex text-sm text-primary hover:underline"
              >
                Selecionar Agente
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ConnectWhatsApp
