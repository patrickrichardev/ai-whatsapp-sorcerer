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

    console.log('Creating agent with:', { name, description, prompt, temperature, user_id })

    // First, validate the prompt with OpenAI
    const validationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    if (!validationResponse.ok) {
      console.error('OpenAI Validation Error:', await validationResponse.text())
      throw new Error('Failed to validate prompt with OpenAI')
    }

    const validationData = await validationResponse.json()
    console.log('Validation Response:', validationData)
    
    const isValidPrompt = validationData.choices[0].message.content.toLowerCase().includes('valid')

    if (!isValidPrompt) {
      throw new Error('Invalid prompt structure')
    }

    // Create OpenAI Assistant
    console.log('Creating OpenAI Assistant...')
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
        model: "gpt-4o-mini",
        tools: [{ type: "code_interpreter" }]
      })
    })

    if (!assistantResponse.ok) {
      console.error('OpenAI Assistant Creation Error:', await assistantResponse.text())
      throw new Error('Failed to create OpenAI Assistant')
    }

    const assistant = await assistantResponse.json()
    console.log('OpenAI Assistant created:', assistant)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert the agent into the database with the OpenAI Assistant ID
    const { data: agent, error } = await supabaseClient
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

    if (error) {
      console.error('Supabase Error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ agent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})