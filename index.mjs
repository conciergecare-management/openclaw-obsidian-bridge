import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function run(command, args = []) {
  const { stdout, stderr } = await execFileAsync(command, args, { encoding: 'utf8' });
  return { stdout, stderr };
}

async function obsidianStatus() {
  const { stdout } = await run(process.env.OBSIDIAN_BIN || 'obsidian', ['status']);
  return JSON.parse(stdout);
}

async function obsidianOpen(vaultPath) {
  const args = ['open'];
  if (vaultPath) args.push(`path=${vaultPath}`);
  const { stdout } = await run(process.env.OBSIDIAN_BIN || 'obsidian', args);
  return stdout ? JSON.parse(stdout) : { launched: true };
}

export default definePluginEntry({
  id: 'obsidian-bridge',
  name: 'Obsidian Bridge',
  description: 'Minimal OpenClaw-owned Obsidian bridge for Paperclip and local callers.',
  register(api) {
    api.registerGatewayMethod('obsidian.bridge.status', async ({ respond }) => {
      try {
        respond({ ok: true, status: await obsidianStatus() });
      } catch (error) {
        respond({ ok: false, error: String(error?.message || error) });
      }
    });
    api.registerGatewayMethod('obsidian.bridge.open', async ({ params, respond }) => {
      try {
        respond({ ok: true, result: await obsidianOpen(params?.path || null) });
      } catch (error) {
        respond({ ok: false, error: String(error?.message || error) });
      }
    });
    api.registerHttpRoute({
      path: '/hooks/obsidian-bridge',
      auth: 'plugin',
      match: 'exact',
      replaceExisting: true,
      async handler(req, res) {
        try {
          const body = req.body && typeof req.body === 'object' ? req.body : {};
          const action = body.action || 'status';
          if (action === 'status') {
            res.status(200).json({ ok: true, status: await obsidianStatus() });
            return;
          }
          if (action === 'open') {
            res.status(200).json({ ok: true, result: await obsidianOpen(body.path || null) });
            return;
          }
          res.status(400).json({ ok: false, error: 'unsupported action' });
        } catch (error) {
          res.status(500).json({ ok: false, error: String(error?.message || error) });
        }
      }
    });
  }
});
