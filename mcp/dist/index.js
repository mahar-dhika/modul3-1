#!/usr/bin/env node

// src/index.ts
import { MCPServer } from "@mastra/mcp";

// src/tools/nasaPicOfDay.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";
var NASA_API_KEY = process.env.NASA_API_KEY;
async function fetchNasaPicOfDay(date, apiKey) {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${date ? `&date=${date}` : ""}`
    );
    return {
      title: response.data.title,
      explanation: response.data.explanation,
      url: response.data.url,
      date: response.data.date,
      copyright: response.data.copyright || "Public Domain"
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch NASA picture of the day: ${error.message}`
      );
    }
    throw new Error("Failed to fetch NASA picture of the day");
  }
}
var nasaPicOfDayTool = createTool({
  id: "NASA Picture of the Day Tool",
  description: "Fetches the NASA picture of the day for a given date",
  inputSchema: z.object({
    date: z.string().optional().describe(
      "The date to fetch the picture of the day for, in YYYY-MM-DD format"
    )
  }),
  execute: async ({ context: { date } }) => {
    if (!NASA_API_KEY) {
      throw new Error("NASA API key is not set");
    }
    return fetchNasaPicOfDay(date, NASA_API_KEY);
  }
});

// src/tools/getCurrentDate.ts
import { createTool as createTool2 } from "@mastra/core/tools";
import { z as z2 } from "zod";
var getCurrentDateTool = createTool2({
  id: "Get Current Date Tool",
  description: "Get the current date",
  inputSchema: z2.object({}),
  execute: async () => {
    return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  }
});

// src/index.ts
var server = new MCPServer({
  name: "nasa-mcp-server",
  version: "1.0.0",
  tools: { nasaPicOfDayTool, getCurrentDateTool }
});
server.startStdio().catch((error) => {
  console.error("Error running MCP server:", error);
  process.exit(1);
});
