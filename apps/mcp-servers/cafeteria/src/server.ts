import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export const server = new Server(
  {
    name: "campus-cafeteria-mcp",
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
        name: "get_menu",
        description: "Get the cafeteria menu for a specific date and meal time",
        inputSchema: {
          type: "object",
          properties: {
            date: { type: "string", description: "YYYY-MM-DD format" },
            mealType: { type: "string", enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
          },
          required: ["date", "mealType"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_menu") {
    const { date, mealType } = request.params.arguments || {};
    
    // Custom mock items depending on mealType
    let items = [
      { id: "m-001", name: "Vegan Quinoa Bowl", price: 8.50, allergens: [] as string[], isVegetarian: true, isVegan: true, availability: true },
      { id: "m-002", name: "Grilled Chicken Breast", price: 10.00, allergens: [] as string[], isVegetarian: false, isVegan: false, availability: true },
      { id: "m-003", name: "Garden Side Salad", price: 4.50, allergens: [] as string[], isVegetarian: true, isVegan: true, availability: true }
    ];

    if (mealType === "Breakfast") {
      items = [
        { id: "m-101", name: "Belgian Waffles", price: 6.50, allergens: ["Gluten", "Dairy"], isVegetarian: true, isVegan: false, availability: true },
        { id: "m-102", name: "Avocado Sourdough Toast", price: 7.00, allergens: ["Gluten"], isVegetarian: true, isVegan: true, availability: true },
        { id: "m-103", name: "Classic Scrambled Eggs & Bacon", price: 8.00, allergens: ["Eggs"], isVegetarian: false, isVegan: false, availability: true }
      ];
    } else if (mealType === "Dinner") {
      items = [
        { id: "m-201", name: "Pan-Seared Salmon", price: 14.50, allergens: ["Fish"], isVegetarian: false, isVegan: false, availability: true },
        { id: "m-202", name: "Eggplant Parmesan", price: 11.00, allergens: ["Dairy", "Gluten"], isVegetarian: true, isVegan: false, availability: true },
        { id: "m-203", name: "Garlic Mashed Potatoes", price: 4.00, allergens: ["Dairy"], isVegetarian: true, isVegan: false, availability: true }
      ];
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(items),
        },
      ],
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});
