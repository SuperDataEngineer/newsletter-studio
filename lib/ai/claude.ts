import Anthropic from "@anthropic-ai/sdk";

// Singleton with Helicone tagging support
export function createClaudeClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: process.env.HELICONE_API_KEY
      ? { "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}` }
      : undefined,
  });
}

export const MODEL = "claude-sonnet-4-5";
