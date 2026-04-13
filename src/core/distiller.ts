import { GoogleGenAI, Type, Schema } from '@google/genai';
import { getConfig } from './config';
import { AntigravityProvider } from '../providers/antigravity';
import { GitProvider } from '../providers/git';
import { LogProvider } from '../providers';

const CONTEXT_CAPSULE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    timestamp: {
      type: Type.STRING,
      description: "UTC timestamp of the session snippet.",
    },
    projectContext: {
      type: Type.STRING,
      description: "Brief context of what was being accomplished.",
    },
    architecturalIntent: {
      type: Type.ARRAY,
      description: "The logic choices and trade-offs made during the session.",
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "The component or feature discussed." },
          decision: { type: Type.STRING, description: "The final decision or pattern adopted." },
          rationale: { type: Type.STRING, description: "Why this decision was made over alternatives." },
          tradeoffs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Known drawbacks or alternatives considered."
          }
        },
        required: ["topic", "decision", "rationale"]
      }
    },
    confidenceScore: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low"],
      description: "The AI's confidence in the logic/decisions of the session."
    },
    stylePreferences: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any coding standards, patterns, or aesthetics explicitly enforced."
    },
    openIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any pending questions, technical debt, or action items deferred to the next session."
    }
  },
  required: ["timestamp", "projectContext", "architecturalIntent", "confidenceScore"]
};

export async function distillLogs(modelOverride?: string): Promise<any | null> {
  const config = getConfig();
  if (!config.geminiApiKey) {
    throw new Error('Gemini API key is not configured. Run "vibe-log configure" to set it up.');
  }

  const modelName = modelOverride || config.model;
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey, apiVersion: 'v1beta' });
  const providers: LogProvider[] = [new AntigravityProvider(), new GitProvider()];
  
  let aggregatedLogs = '';

  for (const provider of providers) {
    if (await provider.isApplicable()) {
      const logs = await provider.getRecentLogs();
      if (logs) {
        aggregatedLogs += `\n=== SOURCE: ${provider.name} ===\n${logs}\n`;
      }
    }
  }

  if (!aggregatedLogs.trim()) {
    console.log('No recent logs or changes found to distill.');
    return null;
  }

  const prompt = `
You are the Distiller, an expert Lead Open-Source Engineer & Systems Architect.
Your goal is to parse the raw session logs and code diffs below, filter out syntax fixes, dependency updates, and other noise, and extract ONLY the Architectural Intent, reasoning, and key takeaways into a "Context Capsule". 

Raw Logs for Analysis:
${aggregatedLogs}
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: CONTEXT_CAPSULE_SCHEMA,
      temperature: 0.1,
    }
  });

  const responseText = response.text;
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON', e);
    return null;
  }
}
