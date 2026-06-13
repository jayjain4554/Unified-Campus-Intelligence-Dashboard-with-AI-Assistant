import { handleQuery } from "@campus-intelligence/ai-assistant";

async function test() {
  const result = await handleQuery({
    studentId: "std-123",
    query: "What events are tomorrow and what vegan food is available?"
  });
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
