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

Claude Desktop’s config file only launches **local** (stdio) processes. Point it at this HTTP server with `mcp-remote`:

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

Config file (`claude_desktop_config.json`):

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Open or create it via Settings → Developer → Edit Config.

Once the server is on a public HTTPS URL, you can skip `mcp-remote` and add it as a **custom connector** (Customize → Connectors → Add custom connector). Claude then reaches the server from Anthropic’s cloud, not from your laptop. Free plans allow one custom connector.

## Catalog

Courses live in `src/data/courses.json`. Update that file when the catalog changes, then rebuild.
