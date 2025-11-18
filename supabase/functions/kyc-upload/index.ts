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

    // Client for auth verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    // Admin client for storage and database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const documentType = formData.get('documentType') as string

      if (!file || !documentType) {
        return new Response(
          JSON.stringify({ error: 'File and document type are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate file size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'File size must be less than 4MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(
          JSON.stringify({ error: 'Failed to upload file: ' + uploadError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('kyc-documents')
        .getPublicUrl(fileName)

      // Delete existing document of same type
      await supabaseAdmin
        .from('kyc_documents')
        .delete()
        .eq('user_id', user.id)
        .eq('document_type', documentType)

      // Insert new document record
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
        // Clean up uploaded file
        await supabaseAdmin.storage.from('kyc-documents').remove([fileName])
        return new Response(
          JSON.stringify({ error: 'Failed to save document information: ' + insertError.message }),
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
          JSON.stringify({ error: 'Failed to fetch documents' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ documents }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})