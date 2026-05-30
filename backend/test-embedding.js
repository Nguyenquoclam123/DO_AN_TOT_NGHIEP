const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent("Test embedding");
    console.log("Embedding generated successfully!");
    console.log("Vector length:", result.embedding.values.length);
  } catch (e) {
    console.error("Embedding failed:", e.message);
  }
}

run();
