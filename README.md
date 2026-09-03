# mcp-server-demo

MCP server using the official TypeScript SDK v2. It speaks Streamable HTTP at `http://127.0.0.1:3000/mcp`.

Tools:

- `current_time` — current date and time in America/Lima
- `recommend_courses` — Programación y Más paid courses, matched by topic, skill, or level

Requires **Node.js 20+** (see `.nvmrc`).

```bash
nvm use
npm install
npm run build
npm start
```

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

After the server is on a **public HTTPS** URL (for example `https://your-domain/mcp`):

1. In Claude Desktop open **Customize → Connectors → Add custom connector**.
2. Paste the HTTPS MCP URL. No `mcp-remote` and no JSON edit.
3. Anthropic’s cloud opens the connection, so the VPS must be reachable on the public internet. Add auth before it is public.

Free plans allow one custom connector. Restart Claude Desktop after adding it.

## Catalog

Courses live in `src/data/courses.json`. Update that file when the catalog changes, then rebuild.
