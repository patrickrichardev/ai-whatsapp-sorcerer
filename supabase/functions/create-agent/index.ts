import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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

    // Validate the OpenAI prompt first
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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

    if (!openAIResponse.ok) {
      console.error('OpenAI API Error:', await openAIResponse.text())
      throw new Error('Failed to validate prompt with OpenAI')
    }

    const openAIData = await openAIResponse.json()
    console.log('OpenAI Response:', openAIData)
    
    const isValidPrompt = openAIData.choices[0].message.content.toLowerCase().includes('valid')

    if (!isValidPrompt) {
      throw new Error('Invalid prompt structure')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert the agent into the database
    const { data: agent, error } = await supabaseClient
      .from('agents')
      .insert({
        name,
        description,
        prompt,
        temperature,
        user_id
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