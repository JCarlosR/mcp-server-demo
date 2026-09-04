#!/usr/bin/env node
import { createServer as createHttpServer } from "node:http";
import {
  hostHeaderValidation,
  originValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
const allowedHostnames = [
  "localhost",
  "127.0.0.1",
  "[::1]",
  ...(process.env.MCP_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
];

const mcpHandler = createMcpHandler(createServer);
const nodeHandler = toNodeHandler(mcpHandler);
const validateHost = hostHeaderValidation(allowedHostnames);
const validateOrigin = originValidation(allowedHostnames);

const httpServer = createHttpServer(async (req, res) => {
  if (!validateHost(req, res) || !validateOrigin(req, res)) {
    return;
  }

  if (req.url?.split("?")[0] !== "/mcp") {
    res.writeHead(404).end("Not found");
    return;
  }

  await nodeHandler(req, res);
});

httpServer.listen(port, host, () => {
  console.error(`mcp-server-demo listening on http://${host}:${port}/mcp`);
});
