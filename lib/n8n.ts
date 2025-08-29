import fetch from 'node-fetch';
const { N8N_BASE_URL='', N8N_API_KEY='', N8N_WEBHOOK_GROUP_CHAT='', N8N_WEBHOOK_PROJECT_CHAT='', N8N_BACKEND_API_KEY='' } = process.env;
function build(path: string) { return (N8N_BASE_URL||'').replace(/\/$/,'') + path; }
async function post(path: string, payload: any) {
  if (!N8N_BASE_URL) return { skipped: true };
  const res = await fetch(build(path), {
    method: 'POST',
    headers: { 'content-type':'application/json', 'X-API-Key': N8N_API_KEY || '', 'x-backend-key': N8N_BACKEND_API_KEY || '' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { text }; }
}
export async function sendGroupChatToN8N(data:any){ return post(N8N_WEBHOOK_GROUP_CHAT || '/webhook/group-chat', data); }
export async function sendProjectChatToN8N(data:any){ return post(N8N_WEBHOOK_PROJECT_CHAT || '/webhook/project-chat', data); }
