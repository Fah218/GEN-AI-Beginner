require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
async function test() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];
  for (const m of models) {
    try {
      const model = new ChatGoogleGenerativeAI({ model: m, maxOutputTokens: 10 });
      await model.invoke('hello');
      console.log(`Success: ${m}`);
      break;
    } catch (e) {
      console.log(`Failed: ${m} - ${e.message}`);
    }
  }
}
test();
