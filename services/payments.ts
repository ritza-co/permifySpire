const permifyUrl = Deno.env.get("permifyUrl");

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST" || !req.url.endsWith("/pay"))
    return new Response("Payments service", { status: 200 });

  const requestSpiffeId = req.headers.get("spiffeId");
  if (!requestSpiffeId) {
    console.error("Payments: Missing SPIFFE identity from Ghostunnel");
    return new Response(JSON.stringify({ allowed: false, error: "Missing identity" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  console.log("Payments service processing request for SPIFFE ID:", requestSpiffeId);

  const allowed = await checkPermissionInPermify(requestSpiffeId);
  if (!allowed) {
    console.log("PaymentsService: Permission denied for:", requestSpiffeId);
    return new Response(JSON.stringify({ allowed: false }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  console.log("PaymentsService: Request allowed for:", requestSpiffeId);
  return new Response(JSON.stringify({ allowed: true }), {
    headers: { "Content-Type": "application/json" }
  });
}

async function checkPermissionInPermify(callerId: string): Promise<boolean> {
  try {
    const response = await fetch(`${permifyUrl}/v1/tenants/t1/permissions/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: { schema_version: "", depth: 20 },
        entity: { type: "service", id: "spiffe:__example.org_payments" },
        permission: "debit",
        subject: { type: "service", id: callerId.replace(/\//g, "_") },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Payments service: Permify request failed: ${errorText}`);
      return false;
    }

    const result = await response.json();
    return result.can === "CHECK_RESULT_ALLOWED";
  }
  catch (error) {
    console.error("Payments service: checkPermission network/internal error:", error);
    return false;
  }
}


console.log("Payments service starting using permify URL:", permifyUrl);
Deno.serve({ port: 3000 }, handler);