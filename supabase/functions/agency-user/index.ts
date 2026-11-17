import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const roles = ['admin', 'commercial', 'production', 'client'];
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return respond({ error: 'Método indisponível.' }, 405);

  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return respond({ error: 'Entre com sua conta de administrador.' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return respond({ error: 'O serviço de convites ainda não foi configurado.' }, 503);

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return respond({ error: 'Sua sessão expirou. Entre novamente.' }, 401);
    const { data: operator, error: roleError } = await admin.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
    if (roleError || operator?.role !== 'admin') return respond({ error: 'Apenas administradores geram convites.' }, 403);

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = typeof body?.role === 'string' ? body.role : 'client';
    const clientId = role === 'client' && typeof body?.client_id === 'string' ? body.client_id : null;
    if (!name || name.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 || !roles.includes(role) || (role === 'client' && (!clientId || !uuid.test(clientId)))) {
      return respond({ error: 'Preencha nome, e-mail e cliente.' }, 400);
    }
    if (clientId) {
      const { data } = await admin.from('clients').select('id').eq('id', clientId).maybeSingle();
      if (!data) return respond({ error: 'O cliente selecionado não foi encontrado.' }, 404);
    }

    const { data: existingProfile, error: lookupError } = await admin.from('profiles')
      .select('id,name,role,client_id,email').eq('email', email).maybeSingle();
    if (lookupError) return respond({ error: 'Não foi possível verificar se o e-mail já tem acesso.' }, 409);
    if (existingProfile) {
      if (existingProfile.role !== role || existingProfile.client_id !== clientId) {
        return respond({ error: 'Este e-mail já está vinculado a outro acesso.' }, 409);
      }
      const { data: renewal, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });
      if (error || renewal.user?.id !== existingProfile.id || !renewal.properties?.hashed_token) {
        return respond({ error: 'Não foi possível gerar um novo link de acesso.' }, 409);
      }
      return respond({ profile: existingProfile, tokenHash: renewal.properties.hashed_token, accessType: 'recovery' });
    }

    const { data: invite, error: inviteError } = await admin.auth.admin.generateLink({ type: 'invite', email });
    if (inviteError || !invite.user || !invite.properties?.hashed_token) {
      return respond({ error: 'O convite não foi gerado. Se o e-mail já tiver conta, use o acesso existente ou a recuperação de senha.' }, 409);
    }
    const profile = { id: invite.user.id, name, role, client_id: clientId, email };
    const { data, error } = await admin.from('profiles').insert(profile).select('id,name,role,client_id,email').single();
    if (error || !data) {
      return respond({ error: 'A conta foi criada no Auth, mas o vínculo ao cliente não foi confirmado. Revise o cadastro antes de enviar um convite.' }, 409);
    }
    return respond({ profile: data, tokenHash: invite.properties.hashed_token, accessType: 'invite' });
  } catch {
    return respond({ error: 'Não foi possível gerar o convite. Tente novamente.' }, 500);
  }
});
