import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CreateCompanyAdminPayload = {
  companyCode: string;
  fullName: string;
  phone?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase service role is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerId = authData.user.id;
    const callerEmail = authData.user.email;

    if (!callerEmail) {
      return new Response(JSON.stringify({ error: 'Authenticated user has no email.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Guard: this endpoint may only be used ONCE per auth user.
    const { data: existingEmployee } = await adminClient
      .from('employees')
      .select('id')
      .eq('id', callerId)
      .maybeSingle();

    if (existingEmployee) {
      return new Response(JSON.stringify({ error: 'This account is already linked to a company.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as CreateCompanyAdminPayload;

    if (!payload.companyCode?.trim() || !payload.fullName?.trim()) {
      return new Response(JSON.stringify({ error: 'companyCode and fullName are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const companyCode = payload.companyCode.trim().toUpperCase();

    // Step 1: the company MUST already exist (pre-registered manually by a
    // super-admin). Self-service creation of new companies is not allowed.
    const { data: company, error: companyLookupError } = await adminClient
      .from('companies')
      .select('id')
      .eq('company_code', companyCode)
      .maybeSingle();

    if (companyLookupError || !company) {
      return new Response(
        JSON.stringify({ error: 'This company code is not registered. Contact your administrator.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Step 2: this company must not already have an admin.
    const { data: existingAdmin } = await adminClient
      .from('employees')
      .select('id')
      .eq('company_id', company.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'This company already has an admin account. Ask them to add you as an employee.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Step 3: create the admin employee row, tied to the existing company.
    // Role is hardcoded to 'admin' -- never client-supplied.
    const [firstName, ...rest] = payload.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const { error: employeeError } = await adminClient.from('employees').insert({
      id: callerId,
      company_id: company.id,
      login_id: `${companyCode}-ADMIN`,
      first_name: firstName,
      last_name: lastName,
      email: callerEmail,
      phone: payload.phone ?? null,
      role: 'admin',
      status: 'active',
      must_change_password: false,
      date_of_joining: new Date().toISOString().slice(0, 10),
    });

    if (employeeError) {
      return new Response(JSON.stringify({ error: employeeError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ companyId: company.id, companyCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});