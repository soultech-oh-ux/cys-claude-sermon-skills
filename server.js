const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3900;
const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, 'http://localhost');

  // GET /api/skills - list all skills with SKILL.md content
  if (url.pathname === '/api/skills' && req.method === 'GET') {
    try {
      const folders = fs.readdirSync(SKILLS_DIR).filter(f =>
        f.startsWith('sermon-') && fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
      );
      const skills = {};
      for (const folder of folders) {
        const skillPath = path.join(SKILLS_DIR, folder, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          skills[folder] = fs.readFileSync(skillPath, 'utf-8');
        }
      }
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify({ok: true, skills, count: Object.keys(skills).length}));
    } catch (e) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ok: false, error: e.message}));
    }
    return;
  }

  // POST /api/chat - call Claude API with streaming
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    try {
      const body = JSON.parse(await readBody(req));
      const { apiKey, skillFolder, verse, extra, model } = body;

      // Sanitize key: strip non-printable & trim
      const trimmedKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
      const debugInfo = new Date().toISOString() + ' | len:' + apiKey.length + '->' + trimmedKey.length + ' | prefix:' + trimmedKey.substring(0, 12) + '... | hasNonASCII:' + (apiKey.length !== trimmedKey.length) + ' | model:' + model + ' | skill:' + skillFolder;
      fs.appendFileSync(path.join(__dirname, 'debug.log'), debugInfo + '\n');
      console.log('[REQ]', debugInfo);

      if (!trimmedKey) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: false, error: 'API key required'}));
        return;
      }

      // Read SKILL.md as system prompt
      let systemPrompt = '';
      const skillPath = path.join(SKILLS_DIR, skillFolder, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        systemPrompt = fs.readFileSync(skillPath, 'utf-8');

        // Also read any reference files
        const refsDir = path.join(SKILLS_DIR, skillFolder, 'references');
        if (fs.existsSync(refsDir)) {
          const refFiles = fs.readdirSync(refsDir).filter(f => f.endsWith('.md'));
          for (const rf of refFiles) {
            const refContent = fs.readFileSync(path.join(refsDir, rf), 'utf-8');
            systemPrompt += '\n\n---\n[Reference: ' + rf + ']\n' + refContent;
          }
        }

        // Also read persona files if present
        const personasDir = path.join(SKILLS_DIR, skillFolder, 'personas');
        if (fs.existsSync(personasDir)) {
          const personaFiles = fs.readdirSync(personasDir).filter(f => f.endsWith('.md'));
          for (const pf of personaFiles) {
            const pContent = fs.readFileSync(path.join(personasDir, pf), 'utf-8');
            systemPrompt += '\n\n---\n[Persona: ' + pf + ']\n' + pContent;
          }
        }
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: false, error: 'Skill not found: ' + skillFolder}));
        return;
      }

      // Build user message
      let userMessage = verse;
      if (extra) userMessage += '\n\n' + extra;

      // Call Anthropic API with streaming
      const selectedModel = model || 'claude-sonnet-4-20250514';
      const apiBody = JSON.stringify({
        model: selectedModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
      });

      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': trimmedKey,
          'anthropic-version': '2023-06-01',
        },
        body: apiBody,
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        let errorMsg = errText;
        try { const ej = JSON.parse(errText); errorMsg = ej.error && ej.error.message ? ej.error.message : errText; } catch(e) {}
        res.writeHead(apiRes.status, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: false, error: errorMsg}));
        return;
      }

      // Stream SSE back to client
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const reader = apiRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                res.write('data: ' + JSON.stringify({text: parsed.delta.text}) + '\n\n');
              } else if (parsed.type === 'message_stop') {
                res.write('data: [DONE]\n\n');
              } else if (parsed.type === 'error') {
                res.write('data: ' + JSON.stringify({error: parsed.error?.message || 'Unknown error'}) + '\n\n');
              }
            } catch (e) { /* skip non-JSON lines */ }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: false, error: e.message}));
      } else {
        res.write('data: ' + JSON.stringify({error: e.message}) + '\n\n');
        res.end();
      }
    }
    return;
  }

  // Static file serving
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {'Content-Type': contentType});
    res.end(data);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  Sermon Skills Dashboard Server');
  console.log('  http://localhost:' + PORT);
  console.log('');
  console.log('  Skills dir: ' + SKILLS_DIR);
  console.log('  Skills found: ' + fs.readdirSync(SKILLS_DIR).filter(f => f.startsWith('sermon-')).length);
  console.log('');
});
