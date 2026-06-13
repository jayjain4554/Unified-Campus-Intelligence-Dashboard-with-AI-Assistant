const query = async (content) => {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: { content } })
  });
  const data = await res.json();
  console.log(`[QUERY]: ${content}`);
  console.log(`[ANSWER]: ${data.answer}`);
  console.log(`[SUGGESTED ACTIONS]:`, data.suggestedActions);
  console.log("---------------------------------------------------");
};

(async () => {
  try {
    await query("What events are tomorrow and what vegan food is available?");
    await query("What is my GPA?");
  } catch (err) {
    console.error("Error testing queries:", err);
  }
})();
