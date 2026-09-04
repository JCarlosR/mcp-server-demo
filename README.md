# mcp-server-demo

MCP server using the official TypeScript SDK v2. It speaks Streamable HTTP at `http://127.0.0.1:3000/mcp`.

Tools:

- `current_time` — current date and time in America/Lima
- `recommend_courses` — Programación y Más paid courses, matched by topic, skill, or level

Requires **Node.js 20+** (see `.nvmrc`). Copy `.env.example` to `.env` for local defaults (optional; the same values are already built in).

```bash
nvm use
cp .env.example .env
npm install
npm run build
npm start
```

## Claude Desktop

### Local development

Claude Desktop’s config file only launches **local** (stdio) processes. With `npm start` running, bridge to localhost HTTP with `mcp-remote`.

Open or create the config via Settings → Developer → Edit Config (`claude_desktop_config.json`):

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-server-demo": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:3000/mcp"]
    }
  }
}
```

Do not use Customize → Connectors for localhost: that flow connects from Anthropic’s cloud, which cannot reach `127.0.0.1` on your machine.

### Remote server

After the server is on a **public HTTPS** URL (see [Deploy to a VPS](#deploy-to-a-vps)):

1. In Claude Desktop open **Customize → Connectors → Add custom connector**.
2. Paste the HTTPS MCP URL (for example `https://your-domain/mcp`). No `mcp-remote` and no JSON edit.
3. Anthropic’s cloud opens the connection, so the VPS must be reachable on the public internet. Add auth before it is public.

Free plans allow one custom connector. Restart Claude Desktop after adding it.

## Cursor

This repo includes `.cursor/mcp.json` (project-only: it loads when this folder is the workspace). Start the server, then enable it in Cursor Settings → MCP.

To use the same server in every workspace, add it to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mcp-server-demo": {
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

After you deploy a public HTTPS URL, use that `url` instead of localhost.

## Deploy to a VPS

A [Hostinger VPS](https://hostinger.com/PROGRAMACIONYMAS) works well for this (Node + nginx + a process manager). That link applies coupon **`PROGRAMACIONYMAS`**. Choose **KVM 2** (2 vCPU, 8 GB RAM) and **Ubuntu**. A fresh KVM 2 image does not include Node or npm.

1. Create the VPS, point a domain at its IP, and SSH in.
2. Install git, nginx, certbot, then **nvm** and **Node.js 20** (same major as `.nvmrc`):

```bash
sudo apt update
sudo apt install -y git nginx certbot python3-certbot-nginx curl

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
node -v
npm -v
```

Add `source ~/.nvm/nvm.sh` to `~/.bashrc` if `node` is missing after a new SSH session.

3. Clone this repo, then:

```bash
cd mcp-server-demo
cp .env.example .env
npm ci
npm run build
```

4. Keep Node listening only on this machine (`127.0.0.1`). In `.env`, set `MCP_ALLOWED_HOSTS` to the **public domain** you pointed at the VPS (hostname only, no `https://`). Nginx and Claude will send that name in the HTTP `Host` header; without it the app rejects the request as unknown.

```bash
HOST=127.0.0.1
PORT=3000
MCP_ALLOWED_HOSTS=mcp.example.com
```

Example: if the server will be `https://mcp.programacionymas.com/mcp`, set `MCP_ALLOWED_HOSTS=mcp.programacionymas.com`.

Keep the process up with PM2 (or systemd):

```bash
npx pm2 start build/index.js --name mcp-server-demo
npx pm2 save
npx pm2 startup
```

5. Reverse-proxy with nginx so `https://your-domain/mcp` reaches Node on `http://127.0.0.1:3000/mcp`. Replace `mcp.example.com` with your hostname. DNS for that name must already point at the VPS.

```bash
sudo tee /etc/nginx/sites-available/mcp-server-demo >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name mcp.example.com;

    location /mcp {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mcp-server-demo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Issue a Let's Encrypt certificate (certbot will add HTTPS to that site):

```bash
sudo certbot --nginx -d mcp.example.com
```

Leave port **3000** closed on the firewall. Only **22**, **80**, and **443** need to be public:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

6. Put auth in front of the public URL before you share it (Claude Connectors and a token/OAuth). Then add the HTTPS URL in Claude (**Remote server** above) or in Cursor’s `url` field.

If Connectors return 403, add the hostname from the request (your domain, and any `Origin` host Claude sends) to `MCP_ALLOWED_HOSTS` in `.env`, comma-separated, then restart.

## Catalog

Courses live in `src/data/courses.json`. Update that file when the catalog changes, then rebuild.
