const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI("AIzaSyD62yQ7CeBo433DB3KYbMc4kDWY4g25ikk");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-flash-latest:", result.response.text());
  } catch (e) {
    console.error("Error with gemini-flash-latest:", e.message);
  }
}

test();
