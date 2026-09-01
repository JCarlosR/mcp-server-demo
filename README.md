# mcp-server-demo

Official MCP TypeScript SDK v2 server (`@modelcontextprotocol/server`) with Streamable HTTP on localhost.

Tools:

- `current_time` — server local time, optional IANA timezone
- `recommend_courses` — Programación y Más paid courses (snapshot of `pym.series` where `public = 0`)

Requires **Node.js 20+**. This repo includes `.nvmrc`.

```bash
nvm use
npm install
npm run build
npm start
```

The server listens at `http://127.0.0.1:3000/mcp`.

## Cursor

Project config is already in `.cursor/mcp.json`. Start the server, then enable it in Cursor Settings → MCP.

Global config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mcp-server-demo": {
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

## Claude Desktop

Claude Desktop speaks stdio, so bridge to HTTP with `mcp-remote`:

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

Config file: `~/Library/Application Support/Claude/claude_desktop_config.json`

## Catalog

Course data lives in `src/data/courses.json`. It is a snapshot from local MySQL `pym.series` (paid courses only). Re-export from the database if the catalog changes.
