const base = "http://permify:3000/v1/tenants/t1";

const schemaRes = await fetch(`${base}/schemas/write`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    schema: "entity user {}\n\nentity service {\n  relation mayDebit @service\n  action debit = mayDebit\n}",
  }),
});
const schema = await schemaRes.json();
const schemaVersion = schema.schema_version;
console.log("[permify] Schema created:", schemaVersion);

const dataRes = await fetch(`${base}/data/write`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    metadata: { schema_version: schemaVersion },
    tuples: [{
      entity: { type: "service", id: "spiffe:__example.org_payments" },
      relation: "mayDebit",
      subject: { type: "service", id: "spiffe:__example.org_orders" },
    }],
  }),
});
const data = await dataRes.json();
console.log("[permify] Data written:", JSON.stringify(data));

console.log("[permify] Setup complete");
console.log("[permify] - spiffe:__example.org_orders: CAN debit");
console.log("[permify] - spiffe:__example.org_audit:  CANNOT debit");
