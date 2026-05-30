const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro"
  ];
  
  console.log("Testing API Key starting with:", process.env.GEMINI_API_KEY.substring(0, 10));
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      console.log(`SUCCESS with ${modelName}!`);
      return;
    } catch (e) {
      console.log(`FAILED with ${modelName}: ${e.message}`);
    }
  }
  
  console.log("All attempts failed. Please check if 'Generative Language API' is enabled in Google Cloud Console.");
}

run();
