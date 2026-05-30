const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    // models is an async iterator or array depending on version
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (e) {
    console.error("List failed:", e.message);
  }
}

run();
