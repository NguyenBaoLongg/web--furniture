import "dotenv/config";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = "gemma3:4b"; // Testing specifically with gemma

async function testOllama() {
  console.log("Testing connection to:", OLLAMA_URL);
  console.log("Model:", OLLAMA_MODEL);
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: "Hi",
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      console.error("Response error:", response.status, response.statusText);
      const text = await response.text();
      console.error("Error body:", text);
      return;
    }

    const result = await response.json();
    console.log("Success! Response:", result.response);
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testOllama();
