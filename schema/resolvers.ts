import bcrypt from 'bcryptjs';
import { Users } from '../models/User';
import { Sessions } from '../models/Sessions';
import { Groups } from '../models/Group';
import { Projects } from '../models/Project';
import { Chats } from '../models/Chat';
import { Files } from '../models/File';
import { KnowledgeBases } from '../models/KnowledgeBase';
import { Instructions } from '../models/Instruction';
import { Messages } from '../models/Messages';
import { signJWT, createRefreshSession, revokeRefreshSession, validateRefreshToken, verifyJWT } from '../lib/jwt';
import { chatGroupId, chatProjectId, fileGroupId, fileProjectId, kbId, instructionId, messageGroupId, messageProjectId } from '../lib/ids';
import { minio } from '../lib/minio';
import { sendGroupChatToN8N, sendProjectChatToN8N } from '../lib/n8n';
import { mcpEnhanceMessage } from '../lib/mcp';
import { connectMongo } from '../lib/db';

function getAuth(ctx:any){
  const token = ctx.request.headers.get('authorization')?.replace(/^Bearer\s+/i,'') || '';
  if (!token) return null;
  try { return verifyJWT<{ id: string, grp: number }>(token); } catch { return null; }
}

export const resolvers = {
  Query: {
    me: async (_:any, __:any, ctx:any) => {
      const a = getAuth(ctx); if (!a) return null;
      await connectMongo();
      const u = await Users.findById(a.id);
      if (!u) return null;
      return { id: u._id.toString(), user_sys_id: u.user_sys_id, name: u.name, email: u.email, role: u.role, assigned_group: u.assigned_group };
    },
    userGroups: async ()=> Groups.find({}),
    validateSession: async (_:any, { token }:any) => {
      try {
        const p = verifyJWT(token) as any;
        const u = await Users.findById(p.id);
        if (!u) return { valid: false, user: null };
        const dashboard_route = (u.role === 'admin' || u.role === 'super_admin') ? 'admin' : 'groups';
        return { valid: true, user: { id: u._id.toString(), user_sys_id: u.user_sys_id, name: u.name, email: u.email, role: u.role, assigned_group: u.assigned_group }, dashboard_route };
      } catch { return { valid: false, user: null }; }
    },
    getUserGroups: async ()=> Groups.find({}),
    getGroupAccess: async (_:any, { userId }:any)=>{
      const u = await Users.findById(userId); if (!u) return [];
      return Groups.find({ number: { $in: [u.assigned_group] } });
    },
    listProjects: async (_:any, { group_number }:any) => Projects.find({ group_number }),
    projectDetails: async (_:any, { project_serial }:any)=> Projects.findOne({ serial: project_serial }),
    listProjectChats: async (_:any, { project_serial }:any)=> Chats.find({ kind:'project', project_serial }),
    listGroupChats: async (_:any, { group_number }:any)=> Chats.find({ kind:'group', group_number }),
    groupChatHistory: async (_:any, { chat_id }:any)=> Messages.find({ chat_id, chat_type:'group' }).sort({ createdAt:1 }),
    projectChatHistory: async (_:any, { chat_id }:any)=> Messages.find({ chat_id, chat_type:'project' }).sort({ createdAt:1 }),
    listFiles: async (_:any, { chat_id }:any)=> Files.find({ chat_id }),
    listKB: async (_:any, { project_serial }:any)=> KnowledgeBases.find({ project_serial }),
    getInstruction: async (_:any, { kb_id }:any)=> Instructions.findOne({ kb_id }),
  },
  Mutation: {
    login: async (_:any, { input }:any) => {
      await connectMongo();
      const u = await Users.findOne({ email: input.email });
      if (!u) throw new Error('Invalid credentials');
      if (u.locked_until && u.locked_until > new Date()) throw new Error('Account locked');
      const ok = await bcrypt.compare(input.password, u.password_hash);
      if (!ok) {
        u.failed_logins = (u.failed_logins || 0) + 1;
        if (u.failed_logins >= 5) { u.locked_until = new Date(Date.now()+15*60*1000); u.failed_logins = 0; }
        await u.save(); throw new Error('Invalid credentials');
      }
      u.failed_logins = 0; u.locked_until = null; await u.save();
      const token = signJWT({ id: u._id.toString(), role: u.role, grp: u.assigned_group });
      const refresh = await createRefreshSession(u._id);
      const dashboard_route = (u.role === 'admin' || u.role === 'super_admin') ? 'admin' : 'groups';
      return { token, refresh, user: { id: u._id.toString(), user_sys_id: u.user_sys_id, name: u.name, email: u.email, role: u.role, assigned_group: u.assigned_group }, dashboard_route };
    },
    logout: async (_:any, { refreshToken }:any)=> revokeRefreshSession(refreshToken),
    refreshToken: async (_:any, { refreshToken }:any)=>{
      await connectMongo();
      const s = await validateRefreshToken(refreshToken);
      if (!s) throw new Error('Invalid refresh token');
      const u = await Users.findById(s.user_id); if (!u) throw new Error('User not found');
      const token = signJWT({ id: u._id.toString(), role: u.role, grp: u.assigned_group });
      const refresh = await createRefreshSession(u._id);
      const dashboard_route = (u.role === 'admin' || u.role === 'super_admin') ? 'admin' : 'groups';
      return { token, refresh, user: { id: u._id.toString(), user_sys_id: u.user_sys_id, name: u.name, email: u.email, role: u.role, assigned_group: u.assigned_group }, dashboard_route };
    },
    changePassword: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const ok = await bcrypt.compare(input.currentPassword, u.password_hash); if (!ok) throw new Error('Wrong password');
      u.password_hash = await bcrypt.hash(input.newPassword, 10); await u.save(); return true;
    },

    createProject: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const serial = String(Math.floor(100000 + Math.random()*900000));
      const u = await Users.findById(a.id);
      const sys_id = `PRJ-${serial}/DGP-${input.group_number}/${(u?.name||'U')[0].toUpperCase()}`;
      const p = await Projects.create({ serial, sys_id, name: input.name, group_number: input.group_number, created_by_user_id: u?._id });
      return p;
    },
    deleteProject: async (_:any, { project_serial }:any)=>{
      await Files.deleteMany({ project_serial });
      await Messages.deleteMany({ project_serial });
      await Chats.deleteMany({ project_serial });
      await KnowledgeBases.deleteMany({ project_serial });
      await Instructions.deleteMany({ project_serial });
      await Projects.deleteOne({ serial: project_serial });
      return true;
    },

    createGroupChat: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const cid = chatGroupId(input.group_number, (u.name||'U').split(' ').map((p:string)=>p[0]).join('').toUpperCase());
      const c = await Chats.create({ chat_id: cid, kind: 'group', group_number: input.group_number, user_initials: (u.name||'U')[0].toUpperCase(), kb_selected_id: null, has_sent_message: false });
      return c;
    },
    createProjectChat: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const proj = await Projects.findOne({ serial: input.project_serial });
      if (!proj) throw new Error('Project not found');
      if (proj.kb_upload_lock_until && proj.kb_upload_lock_until > new Date()) throw new Error('Project locked during KB upload');
      const cid = chatProjectId(proj.serial, proj.group_number, (u.name||'U')[0].toUpperCase());
      const chat = await Chats.create({ chat_id: cid, kind: 'project', group_number: proj.group_number, project_serial: proj.serial, user_initials: (u.name||'U')[0].toUpperCase(), kb_selected_id: input.kb_id || null, has_sent_message: false });
      return chat;
    },
    sendGroupMessage: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const chat = await Chats.findOne({ chat_id: input.chat_id, kind: 'group' }); if (!chat) throw new Error('Chat not found');
      const mid = messageGroupId(chat.group_number, (u.name||'U').split(' ').map((p:string)=>p[0]).join('').toUpperCase());
      const payload = { chat_id: chat.chat_id, user_sys_id: u.user_sys_id, user_message: input.message };
      const n8n = await sendGroupChatToN8N(payload);
      const msg = await Messages.create({ message_id: mid, chat_id: chat.chat_id, chat_type: 'group', group_number: chat.group_number, user_sys_id: u.user_sys_id, user_message: input.message, ai_response: n8n?.ai_response || '', response_metadata: { direct_n8n: true, n8n } });
      chat.has_sent_message = true; await chat.save();
      return msg;
    },
    sendProjectMessage: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const chat = await Chats.findOne({ chat_id: input.chat_id, kind: 'project' }); if (!chat) throw new Error('Chat not found');
      const proj = await Projects.findOne({ serial: chat.project_serial }); if (!proj) throw new Error('Project missing');
      const mid = messageProjectId(proj.serial, chat.group_number, chat.user_initials);
      // route via MCP, then to N8N
      const enhanced = await mcpEnhanceMessage({ chat_id: chat.chat_id, project_serial: proj.serial, kb_id: chat.kb_selected_id, message: input.message });
      const n8n = await sendProjectChatToN8N({ chat_id: chat.chat_id, project_serial: proj.serial, kb_id: chat.kb_selected_id, enhanced });
      const msg = await Messages.create({ message_id: mid, chat_id: chat.chat_id, chat_type:'project', project_serial: proj.serial, group_number: chat.group_number, user_sys_id: u.user_sys_id, selected_kb_id: chat.kb_selected_id, user_message: input.message, ai_response: n8n?.ai_response || enhanced?.ai_response || '', response_metadata: { mcp_processed: true, enhanced, n8n } });
      chat.has_sent_message = true; await chat.save();
      return msg;
    },
    uploadToChat: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const chat = await Chats.findOne({ chat_id: input.chat_id }); if (!chat) throw new Error('Chat not found');
      const [type, subtype] = input.mime_type.split('/');
      const chatSerial = input.chat_id.split('/')[0].replace('cha-','');
      const initials = chat.user_initials;
      const fid = chat.kind === 'project'
        ? fileProjectId(subtype || 'bin', chatSerial, chat.project_serial!, chat.group_number, initials)
        : fileGroupId(subtype || 'bin', chatSerial, chat.group_number, initials);
      const s3Key = fid.replaceAll('/','_');
      const buffer = Buffer.from(input.contentBase64, 'base64');
      await minio.putObject(process.env.S3_BUCKET || 'paradigm-kb', s3Key, buffer, buffer.length, { 'Content-Type': String(input.mime_type) });
      const f = await Files.create({ file_id: fid, chat_id: chat.chat_id, chat_type: chat.kind, project_serial: chat.project_serial, group_number: chat.group_number, user_sys_id: u.user_sys_id, file_name: input.file_name, file_type: subtype || 'bin', mime_type: input.mime_type, s3_key: s3Key });
      return f;
    },
    createKB: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const kb_id = kbId(input.project_serial, input.group_number, (u.name||'U')[0].toUpperCase());
      const kb = await KnowledgeBases.create({ kb_id, name: input.name, project_serial: input.project_serial, group_number: input.group_number, created_by_user_sys_id: u.user_sys_id, file_type: input.file_type, upload_status:'processing', mcp_processed:false, additive_sequence:1 });
      return kb;
    },
    deleteKB: async (_:any, { kb_id }:any)=>{ await KnowledgeBases.deleteOne({ kb_id }); await Instructions.deleteMany({ kb_id }); return true; },
    createInstruction: async (_:any, { input }:any, ctx:any)=>{
      const a = getAuth(ctx); if (!a) throw new Error('Unauthorized');
      const u = await Users.findById(a.id); if (!u) throw new Error('Unauthorized');
      const iid = instructionId(input.kb_id, input.project_serial, input.group_number, (u.name||'U')[0].toUpperCase());
      const inst = await Instructions.create({ instruction_id: iid, kb_id: input.kb_id, project_serial: input.project_serial, group_number: input.group_number, created_by_user_sys_id: u.user_sys_id, instruction_name: input.instruction_name, instruction_content: input.instruction_content });
      return inst;
    },
    updateInstruction: async (_:any, { input }:any)=>{
      const inst = await Instructions.findOne({ instruction_id: input.instruction_id });
      if (!inst) throw new Error('Instruction not found');
      if (input.instruction_name) inst.instruction_name = input.instruction_name;
      if (input.instruction_content) inst.instruction_content = input.instruction_content;
      await inst.save(); return inst;
    },
    deleteInstruction: async (_:any, { instruction_id }:any)=>{ await Instructions.deleteOne({ instruction_id }); return true; },
startTyping: async (_:any, { chat_id }:any)=>{
  const chat = await Chats.findOne({ chat_id }); if (!chat) throw new Error('Chat not found');
  const now = new Date(); const until = new Date(now.getTime()+2*60*1000);
  chat.lock_until = until; await chat.save(); return true;
},
endTyping: async (_:any, { chat_id }:any)=>{
  const chat = await Chats.findOne({ chat_id }); if (!chat) throw new Error('Chat not found');
  chat.lock_until = null; await chat.save(); return true;
},

    updateKBSelection: async (_:any, { input }:any)=>{
      const chat = await Chats.findOne({ chat_id: input.chat_id }); if (!chat) throw new Error('Chat not found');
      if (chat.has_sent_message) throw new Error('KB selection locked after first message');
      chat.kb_selected_id = input.kb_id; await chat.save(); return chat;
    },
  },
};
