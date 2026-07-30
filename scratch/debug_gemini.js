import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Note: listModels is not directly on genAI in some versions, 
    // but we can try to fetch it or just try a different model name.
    console.log('Testing gemini-flash-latest...');
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent('Hi');
    console.log('Success with gemini-1.5-flash:', result.response.text());
  } catch (err) {
    console.error('Error with gemini-1.5-flash:', err.message);
    
    console.log('\nTesting gemini-pro...');
    try {
      const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const resultPro = await modelPro.generateContent('Hi');
      console.log('Success with gemini-pro:', resultPro.response.text());
    } catch (errPro) {
      console.error('Error with gemini-pro:', errPro.message);
    }
  }
}

listModels();
