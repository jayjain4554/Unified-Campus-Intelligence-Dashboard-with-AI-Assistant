import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
export const server = new Server({
    name: "campus-academics-mcp",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_gpa",
                description: "Fetch student GPA details and course credit information",
                inputSchema: {
                    type: "object",
                    properties: {
                        studentId: { type: "string", description: "The student ID to look up" },
                    },
                    required: ["studentId"],
                },
            },
            {
                name: "get_schedule",
                description: "Fetch the weekly class schedule of a student",
                inputSchema: {
                    type: "object",
                    properties: {
                        studentId: { type: "string", description: "The student ID to look up" },
                    },
                    required: ["studentId"],
                },
            },
            {
                name: "query_handbook",
                description: "Query the student academic handbook using semantic search to find policies regarding attendance, failing courses, graduation, etc.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The question to ask about the academic handbook policies"
                        }
                    },
                    required: ["query"]
                }
            }
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "query_handbook") {
        const query = String(args?.query);
        try {
            // Lazy-load to avoid slowing down startup if retriever isn't used
            const { queryHandbook } = await import('./rag/retriever.js');
            const chunks = await queryHandbook(query);
            return {
                content: [{ type: "text", text: JSON.stringify(chunks, null, 2) }]
            };
        }
        catch (err) {
            return {
                content: [{ type: "text", text: `Error querying handbook: ${err.message}. Make sure ChromaDB is running.` }]
            };
        }
    }
    const studentId = String(args?.studentId || "std-123");
    if (name === "get_gpa") {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        studentId,
                        gpa: 3.85,
                        totalCreditsEarned: 96,
                        gradesHistory: [
                            { courseId: "CS-101", courseName: "Introduction to Computer Science", grade: "A", credits: 4, semester: "Fall 2024" },
                            { courseId: "CS-201", courseName: "Data Structures", grade: "A-", credits: 4, semester: "Spring 2025" },
                            { courseId: "MATH-250", courseName: "Linear Algebra", grade: "B+", credits: 3, semester: "Fall 2025" },
                            { courseId: "CS-301", courseName: "Software Engineering", grade: "A", credits: 4, semester: "Spring 2026" }
                        ]
                    }),
                },
            ],
        };
    }
    else if (name === "get_schedule") {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify([
                        { courseId: "CS-401", courseName: "Artificial Intelligence", instructor: "Dr. Evelyn Vance", room: "Tech Hall 302", days: ["Monday", "Wednesday"], startTime: "10:00 AM", endTime: "11:15 AM" },
                        { courseId: "CS-402", courseName: "Database Systems", instructor: "Prof. Alan Turing", room: "Science Lab 101", days: ["Tuesday", "Thursday"], startTime: "01:00 PM", endTime: "02:15 PM" },
                        { courseId: "HUMN-150", courseName: "Ethics in Technology", instructor: "Dr. Clara Barton", room: "Humanities Hall 15", days: ["Friday"], startTime: "09:00 AM", endTime: "11:30 AM" }
                    ]),
                },
            ],
        };
    }
    throw new Error(`Tool not found: ${name}`);
});
