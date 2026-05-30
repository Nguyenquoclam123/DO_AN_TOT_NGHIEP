
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            console.error('Error:', data.error);
            return;
        }
        console.log('Available Models:');
        data.models.forEach(m => {
            console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error('Failed to list models:', error.message);
    }
}

listModels();
