#!/usr/bin/env node
import { createServer as createHttpServer } from "node:http";
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

const mcpHandler = createMcpHandler(createServer);
const nodeHandler = toNodeHandler(mcpHandler);
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

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
