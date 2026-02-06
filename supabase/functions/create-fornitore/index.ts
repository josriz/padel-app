import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve((req) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers });
  }

  try {
    const { nome, email } = req.json();
    console.log('✅ Fornitore:', nome, email);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fornitore ${nome} creato!`,
        fornitore: { nome, email }
      }), 
      { status: 200, headers }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Errore' }), { status: 500, headers });
  }
});
