const groq = require('../config/openaiClient.js');
const AppError = require('./AppError.js');

exports.callLLM = async ({ systemPrompt, userPrompt, maxTokens = 500 }) => {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq LLM Error:', error.message);
    throw new AppError('AI service unavailable', 503);
  }
};
