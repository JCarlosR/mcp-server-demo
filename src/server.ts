import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { formatCourse, recommendCourses } from "./catalog.js";
import { formatCurrentTime, getCurrentTime } from "./time.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-server-demo",
    version: "1.0.0",
  });

  server.registerTool(
    "current_time",
    {
      title: "Current time",
      description: "Get the current date and time in America/Lima (the server timezone).",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () => {
      const time = getCurrentTime();
      return {
        content: [{ type: "text", text: formatCurrentTime(time) }],
      };
    },
  );

  server.registerTool(
    "recommend_courses",
    {
      title: "Recommend courses",
      description:
        "Recommend Programación y Más paid courses by topic, goal, or skill (Laravel, Vue, Docker, SQL, Python, Android, JavaScript, OAuth). Optionally filter by level: Aprendiz/beginner, Intermedio/intermediate, Avanzado/advanced.",
      inputSchema: z.object({
        topic: z
          .string()
          .min(2)
          .describe("Topic, goal, or technology the student wants to learn"),
        level: z
          .string()
          .optional()
          .describe("Optional level: Aprendiz, Intermedio, Avanzado, or beginner/intermediate/advanced"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe("Max courses to return (default 5)"),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ topic, level, limit }) => {
      const matches = recommendCourses(topic, level, limit ?? 5);
      if (matches.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No matching courses for "${topic}"${level ? ` at level ${level}` : ""}. Try a skill such as Laravel, Vue, Docker, SQL, Python, Android, JavaScript, or OAuth.`,
            },
          ],
        };
      }

      const text = [
        `Recommended courses for "${topic}"${level ? ` (${level})` : ""}:`,
        ...matches.map(formatCourse),
      ].join("\n\n");

      return { content: [{ type: "text", text }] };
    },
  );

  return server;
}
