import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const documentType = formData.get('documentType') as string

      if (!file || !documentType) {
        return new Response(
          JSON.stringify({ success: false, error: 'File and document type are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (file.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ success: false, error: 'File size must be less than 5MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

      const fileBuffer = await file.arrayBuffer()

      const { error: uploadError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: uploadError.message || 'Failed to upload file. Please try again.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('kyc-documents')
        .getPublicUrl(fileName)

      await supabaseAdmin
        .from('kyc_documents')
        .delete()
        .eq('user_id', user.id)
        .eq('document_type', documentType)

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        await supabaseAdmin.storage.from('kyc-documents').remove([fileName])
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to save document record. Please try again.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Document uploaded successfully! It will be reviewed shortly.',
          document: insertData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      const { data: documents, error: fetchError } = await supabaseAdmin
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch documents' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, documents }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})