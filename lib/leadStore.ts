export type Lead = {
  name: string;
  email: string;
  phone: string;
  tool: "university-match" | "cost-calculator";
  payload: Record<string, unknown>;
};

export async function sendLead(lead: Lead): Promise<void> {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, submittedAt: new Date().toISOString() }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lead submission failed: ${res.status} ${t}`);
  }
}
