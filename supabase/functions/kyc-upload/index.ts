import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupabaseClient {
  auth: any;
  storage: any;
  from: (table: string) => any;
}

function createClient(url: string, key: string, options?: any): SupabaseClient {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    ...options?.global?.headers
  };

  return {
    auth: {
      getUser: async () => {
        const authHeader = options?.global?.headers?.Authorization || `Bearer ${key}`;
        const response = await fetch(`${url}/auth/v1/user`, {
          headers: {
            'Authorization': authHeader,
            'apikey': key
          }
        });
        
        if (!response.ok) {
          return { data: { user: null }, error: new Error('Unauthorized') };
        }
        
        const user = await response.json();
        return { data: { user }, error: null };
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, data: ArrayBuffer, options: any) => {
          const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'apikey': key,
              'Content-Type': options.contentType
            },
            body: data
          });
          
          if (!response.ok) {
            const error = await response.json();
            return { data: null, error };
          }
          
          const data_result = await response.json();
          return { data: data_result, error: null };
        },
        getPublicUrl: (path: string) => {
          return { data: { publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` } };
        },
        remove: async (paths: string[]) => {
          const response = await fetch(`${url}/storage/v1/object/${bucket}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${key}`,
              'apikey': key,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefixes: paths })
          });
          
          return { data: null, error: null };
        }
      })
    },
    from: (table: string) => ({
      select: (columns = '*') => {
        let query = `${url}/rest/v1/${table}?select=${columns}`;
        return {
          eq: (column: string, value: any) => {
            query += `&${column}=eq.${value}`;
            return {
              order: (column: string, options: any) => {
                query += `&order=${column}.${options.ascending ? 'asc' : 'desc'}`;
                return {
                  then: async (resolve: any) => {
                    const response = await fetch(query, {
                      headers: {
                        'Authorization': headers.Authorization,
                        'apikey': key
                      }
                    });
                    
                    if (!response.ok) {
                      resolve({ data: null, error: new Error('Failed to fetch') });
                      return;
                    }
                    
                    const data = await response.json();
                    resolve({ data, error: null });
                  }
                };
              }
            };
          }
        };
      },
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            then: async (resolve: any) => {
              const response = await fetch(`${url}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${key}`,
                  'apikey': key,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
              });
              
              if (!response.ok) {
                const error = await response.json();
                resolve({ data: null, error });
                return;
              }
              
              const result = await response.json();
              resolve({ data: result[0], error: null });
            }
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => ({
            then: async (resolve: any) => {
              const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}&${column2}=eq.${value2}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${key}`,
                  'apikey': key
                }
              });
              
              resolve({ data: null, error: null });
            }
          })
        })
      })
    })
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

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

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (file.size > 4 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'File size must be less than 4MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const fileBuffer = await file.arrayBuffer()

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(
          JSON.stringify({ error: 'Failed to upload file: ' + uploadError.message }),
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
      const { data: documents, error: fetchError } = await supabaseClient
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