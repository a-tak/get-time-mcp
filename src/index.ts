#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "get-time-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes a single "get_current_time" tool that returns the current system time.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_time",
        description: "Get current system time with timezone information",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ]
  };
});

/**
 * Handler for the get_current_time tool.
 * Returns the current system time with timezone information.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "get_current_time") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  try {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcOffset = now.getTimezoneOffset();
    const hours = Math.floor(Math.abs(utcOffset) / 60);
    const minutes = Math.abs(utcOffset) % 60;
    const sign = utcOffset <= 0 ? '+' : '-';
    const offsetString = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          datetime: now.toISOString(),
          timezone: timezone,
          utcOffset: offsetString
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get system time: ${error}`
    );
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Time MCP server running on stdio');
}

// Error handling for the main process
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Handle process signals
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});
