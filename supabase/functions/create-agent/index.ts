
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, description, prompt, temperature, user_id } = await req.json()

    // Verificar se o OPENAI_API_KEY está configurado
    if (!openAIApiKey) {
      console.error('OpenAI API Key não está configurada')
      throw new Error('OpenAI API Key não está configurada')
    }

    console.log('Iniciando criação do agente com:', { 
      name, 
      description: description?.substring(0, 50), // Log parcial para evitar dados sensíveis
      promptLength: prompt?.length,
      temperature, 
      user_id 
    })

    // Validação dos dados de entrada
    if (!name || !prompt || !user_id) {
      throw new Error('Dados obrigatórios faltando: nome, prompt ou user_id')
    }

    // First, validate the prompt with OpenAI
    console.log('Validando prompt com OpenAI...')
    const validationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are validating if the following prompt is appropriate and well-structured for an AI assistant. Respond with only "valid" or "invalid".' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1,
      }),
    })

    const validationResponseText = await validationResponse.text()
    console.log('Resposta da validação OpenAI:', validationResponseText)

    if (!validationResponse.ok) {
      throw new Error(`Falha na validação do prompt: ${validationResponseText}`)
    }

    const validationData = JSON.parse(validationResponseText)
    const isValidPrompt = validationData.choices[0].message.content.toLowerCase().includes('valid')

    if (!isValidPrompt) {
      throw new Error('Estrutura do prompt inválida')
    }

    // Create OpenAI Assistant
    console.log('Criando Assistente OpenAI...')
    const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        name,
        description,
        instructions: prompt,
        model: "gpt-4-turbo-preview",
        tools: [{ type: "code_interpreter" }]
      })
    })

    const assistantResponseText = await assistantResponse.text()
    console.log('Resposta da criação do Assistente:', assistantResponseText)

    if (!assistantResponse.ok) {
      throw new Error(`Falha ao criar Assistente OpenAI: ${assistantResponseText}`)
    }

    const assistant = JSON.parse(assistantResponseText)

    // Create Supabase client
    console.log('Conectando ao Supabase...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurações do Supabase faltando')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Insert the agent into the database
    console.log('Inserindo agente no banco de dados...')
    const { data: agent, error: dbError } = await supabaseClient
      .from('agents')
      .insert({
        name,
        description,
        prompt,
        temperature,
        user_id,
        openai_assistant_id: assistant.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro Supabase:', dbError)
      throw new Error(`Erro ao salvar agente: ${dbError.message}`)
    }

    console.log('Agente criado com sucesso!')
    return new Response(
      JSON.stringify({ agent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na criação do agente:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno ao criar agente',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
