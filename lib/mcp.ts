import fetch from 'node-fetch';
const { MCP_BASE_URL='', MCP_API_KEY='' } = process.env;
function build(path: string){ return (MCP_BASE_URL||'').replace(/\/$/,'') + path; }
export async function mcpEnhanceMessage(payload:any){
  if (!MCP_BASE_URL) return { skipped: true };
  const res = await fetch(build('/enhance'), {
    method: 'POST',
    headers: { 'content-type':'application/json', 'x-api-key': MCP_API_KEY || '' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { text }; }
}
