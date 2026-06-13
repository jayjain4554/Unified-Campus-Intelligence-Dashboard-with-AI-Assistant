import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export const server = new Server(
  {
    name: "campus-events-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_upcoming_events",
        description: "Fetch upcoming campus events",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number" },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_upcoming_events") {
    const limit = request.params.arguments?.limit ? Number(request.params.arguments.limit) : 5;
    const events = [
      {
        id: "evt-001",
        title: "AI Hackathon 2026",
        description: "Build the next gen agents and win prizes.",
        category: "Academic",
        startTime: "2026-06-12T10:00:00Z",
        endTime: "2026-06-14T18:00:00Z",
        location: { latitude: 37.7749, longitude: -122.4194, buildingName: "Engineering Center", room: "Hall A" },
        organizer: "Computer Science Dept",
        rsvpCount: 120,
        capacity: 150
      },
      {
        id: "evt-002",
        title: "Spring Career Fair",
        description: "Meet top recruiters and secure internships.",
        category: "Career",
        startTime: "2026-06-15T09:00:00Z",
        endTime: "2026-06-15T15:00:00Z",
        location: { latitude: 37.7752, longitude: -122.4189, buildingName: "Student Union", room: "Grand Ballroom" },
        organizer: "Career Services",
        rsvpCount: 350,
        capacity: 500
      },
      {
        id: "evt-003",
        title: "Campus Concert night",
        description: "Live music, food stalls, and games.",
        category: "Social",
        startTime: "2026-06-18T18:00:00Z",
        endTime: "2026-06-18T22:00:00Z",
        location: { latitude: 37.7745, longitude: -122.4201, buildingName: "Quad Lawn" },
        organizer: "Student Council",
        rsvpCount: 480,
        capacity: 1000
      }
    ].slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(events),
        },
      ],
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});
