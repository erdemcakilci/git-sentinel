import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

let openaiInstance: OpenAI | null = null;

/**
 * Initializes and returns the OpenAI client instance.
 * Throws an error if OPENAI_API_KEY is not defined.
 */
export function getOpenAIClient(): OpenAI {
  if (openaiInstance) {
    return openaiInstance;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing from environment variables. Please set it in your .env file or run with the environment variable set.'
    );
  }

  openaiInstance = new OpenAI({ apiKey });
  return openaiInstance;
}

/**
 * Gets the target model name from environment or defaults.
 */
export function getModelName(): string {
  return process.env.OPENAI_MODEL || 'gpt-4-turbo';
}

/**
 * Helper to call the Chat Completion API.
 */
export async function askAI(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const model = getModelName();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    throw new Error(`AI Request Failed: ${error.message}`);
  }
}
