import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PluginRequest, GeneratedPlugin, PluginFile } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Senior WordPress Developer and Security Engineer.
Your task is to generate complete, working, and secure WordPress plugins based on user requirements.

Adhere to these strict guidelines:
1. **Security First**: Sanitize all inputs (sanitize_text_field, etc.) and escape all outputs (esc_html, esc_attr, etc.). Use nonces for forms and AJAX calls.
2. **Best Practices**: Use WordPress coding standards. Prefix functions and classes with a unique slug derived from the plugin name to avoid conflicts.
3. **Structure**: Always include a main PHP file with the standard WordPress plugin header comment.
4. **Completeness**: If the plugin needs CSS or JS, include them as separate files in the 'files' array and properly enqueue them in the main PHP file.
5. **Readme**: Always generate a standard 'readme.txt' file.

Your output must be a valid JSON object matching the provided schema.
`;

// Define the response schema for strict JSON output
const fileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    filename: { type: Type.STRING, description: "The full filename including extension (e.g., 'my-plugin.php', 'assets/style.css')" },
    content: { type: Type.STRING, description: "The complete source code/text content of the file." },
    type: { type: Type.STRING, enum: ['php', 'css', 'js', 'txt', 'other'], description: "The type of file." }
  },
  required: ["filename", "content", "type"]
};

const pluginSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The proper name of the plugin" },
    slug: { type: Type.STRING, description: "The sanitized slug for the plugin (folder name)" },
    description: { type: Type.STRING, description: "Short description of what the plugin does" },
    version: { type: Type.STRING, description: "Semantic version number, e.g., 1.0.0" },
    files: {
      type: Type.ARRAY,
      items: fileSchema,
      description: "List of all files required for the plugin to work"
    }
  },
  required: ["name", "slug", "description", "version", "files"]
};

export const generatePlugin = async (request: PluginRequest): Promise<GeneratedPlugin> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a WordPress plugin with the following details:
    
    Name: ${request.name}
    Description: ${request.description}
    Key Features/Requirements:
    ${request.features.map(f => `- ${f}`).join('\n')}
    
    Ensure the main PHP file handles all necessary hooks (activation, deactivation, init).
    Include inline comments explaining complex logic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better coding capability
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: pluginSchema,
        thinkingConfig: { thinkingBudget: 4096 } // Allow some budget for complex logic
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No content generated from Gemini.");
    }

    const data = JSON.parse(responseText);

    // Add metadata for the app
    return {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...data
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate plugin code. Please try again.");
  }
};
