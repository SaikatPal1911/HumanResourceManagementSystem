import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CreateEmployeePayload = {
  fullName: string;
  email: string;
  phone?: string;
  jobPosition?: string;
  department?: string;
  location?: string;
};

const randomPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
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

    const { data: requester, error: requesterError } = await adminClient
      .from('employees')
      .select('id, company_id, role')
      .eq('id', authData.user.id)
      .single();

    if (requesterError || !requester || requester.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can create employees.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as CreateEmployeePayload;
    const [firstName, ...rest] = payload.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    const companyId = requester.company_id;

    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .select('company_code')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return new Response(JSON.stringify({ error: 'Company record not found.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const year = new Date().getFullYear();
    const { data: generatedLoginId, error: loginIdError } = await adminClient.rpc('generate_login_id', {
      p_company_code: company.company_code,
      p_first_name: firstName,
      p_last_name: lastName,
      p_year: year,
    });

    if (loginIdError || !generatedLoginId) {
      return new Response(JSON.stringify({ error: 'Could not generate Login ID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tempPassword = randomPassword();

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
        company_id: companyId,
        login_id: generatedLoginId,
        role: 'employee',
      },
    });

    if (createUserError || !createdUser.user) {
      return new Response(JSON.stringify({ error: createUserError?.message ?? 'Could not create auth user.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: employeeInsertError } = await adminClient.from('employees').insert({
      id: createdUser.user.id,
      company_id: companyId,
      login_id: generatedLoginId,
      first_name: firstName,
      last_name: lastName,
      email: payload.email,
      phone: payload.phone ?? null,
      role: 'employee',
      job_position: payload.jobPosition ?? null,
      department: payload.department ?? null,
      location: payload.location ?? null,
      date_of_joining: new Date().toISOString().slice(0, 10),
      must_change_password: true,
      status: 'active',
    });

    if (employeeInsertError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id);
      return new Response(JSON.stringify({ error: employeeInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        loginId: generatedLoginId,
        tempPassword,
        email: payload.email,
        fullName: payload.fullName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});