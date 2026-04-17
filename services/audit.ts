const paymentsUrl = Deno.env.get("paymentsUrl");

async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET" || !req.url.endsWith("/audit"))
    return new Response("Audit service", { status: 200 });

  try {
    const response = await fetch(`${paymentsUrl}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  catch (e) {
    console.error("AuditService: Request to payments failed:", e);
    return new Response(JSON.stringify({ error: "Upstream connection failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}

console.log("Audit service starting using payments URL:", paymentsUrl);
Deno.serve({ port: 3000 }, handler);