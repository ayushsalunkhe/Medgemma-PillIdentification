import { GoogleGenAI, Type } from "@google/genai";
import type { FallbackMedicineInfo, FdaDataToSummarize, SummarizedMedicineInfo, MedicineInfo } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const LANGUAGES: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi'
};

/**
 * Extracts and corrects the medicine name from an image in a single step using Gemini.
 * This prompt is designed to handle potential OCR errors upfront.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @returns The identified and potentially corrected medicine name as a string.
 */
export const identifyAndCorrectMedicineName = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "Identify the primary brand or generic name of the medicine in this image. The image may have poor quality, so correct for any potential OCR errors or typos to provide the most likely standardized name. Provide only the name. Do not include dosage, form (e.g., 'tablets'), or other extra information.",
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });
    
    const medicineName = response.text.trim();
    if (!medicineName) {
        throw new Error("Gemini returned an empty response for the medicine name.");
    }
    return medicineName;

  } catch (error) {
    console.error("Error identifying and correcting medicine from image:", error);
    throw new Error("Failed to identify medicine from the image via AI.");
  }
};


/**
 * Fetches medicine information using Gemini as a fallback (simulating MedGemma).
 * @param medicineName The name of the medicine to search for.
 * @returns A structured object with medicine information.
 */
export const getMedicineInfoFallback = async (medicineName: string): Promise<FallbackMedicineInfo> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `The medicine named "${medicineName}" was not found in the US FDA database. It might be an international or Indian medicine. Provide information for it, including practical details for daily life. For side effects, provide a text summary and also a structured list of up to 5 of the most common ones for a chart.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A brief summary of the medicine, including common uses and what it treats."
                        },
                        activeIngredients: {
                            type: Type.STRING,
                            description: "The active ingredient(s) of the medicine."
                        },
                        purpose: {
                            type: Type.STRING,
                            description: "The primary purpose or use of the medicine."
                        },
                        howToTake: {
                            type: Type.STRING,
                            description: "Instructions on how to take the medicine, including dosage, frequency, and whether to take it with food or water."
                        },
                        sideEffects: {
                            type: Type.OBJECT,
                            description: "Information about common side effects.",
                            properties: {
                                summary: {
                                    type: Type.STRING,
                                    description: "A text summary of the common side effects."
                                },
                                chartData: {
                                    type: Type.ARRAY,
                                    description: "An array of the top 5 most common side effects for visualization. Omit if no specific side effects are known.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING, description: "The name of the side effect." },
                                            frequencyPercent: { type: Type.NUMBER, description: "The estimated numerical percentage of occurrence. Estimate based on terms like 'common' (>1%) or 'frequent' (>10%) if no exact number is given." },
                                            frequencyDescription: { type: Type.STRING, description: "The original text describing the frequency (e.g., '1 in 10 patients', 'Common')." }
                                        },
                                        required: ["name", "frequencyPercent", "frequencyDescription"]
                                    }
                                }
                            },
                            required: ["summary"]
                        },
                        whatToAvoid: {
                            type: Type.STRING,
                            description: "Information on what to avoid while taking the medicine, such as other drugs, foods, or activities like driving."
                        },
                        storage: {
                            type: Type.STRING,
                            description: "Instructions on how to properly store the medicine (e.g., temperature, light exposure)."
                        },
                        warnings: {
                            type: Type.STRING,
                            description: "Important warnings and precautions associated with the medicine."
                        }
                    },
                    required: ["summary", "activeIngredients", "purpose", "howToTake", "sideEffects", "whatToAvoid", "storage", "warnings"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FallbackMedicineInfo;
    } catch (error) {
        console.error("Error fetching fallback medicine info:", error);
        throw new Error(`Failed to get information for "${medicineName}" from the AI knowledge base.`);
    }
};

/**
 * Summarizes raw FDA data into user-friendly content using Gemini.
 * @param data An object containing the raw text sections from the FDA API.
 * @returns A promise that resolves to a structured object with summarized medicine information.
 */
export const summarizeFdaData = async (data: FdaDataToSummarize): Promise<SummarizedMedicineInfo> => {
    const prompt = `
        The following is technical medical information from an FDA drug label. Your task is to summarize this information into clear, concise, and easy-to-understand language for a general audience. Avoid medical jargon where possible. If a section has no information provided, return an empty string for that field in the JSON output.

        For the "Common Side Effects" section, first provide a text summary. Then, if the text contains a list of side effects, extract up to 5 of the most common ones and present them as a structured array for a data visualization chart. For each side effect, provide a name, an estimated frequency as a numerical percentage, and the original frequency description. If the source mentions 'common' or 'frequent', you can estimate a percentage (e.g., 'common' > 1%, 'frequent' > 10%).

        Here is the data to summarize:
        - Purpose: ${data.purpose || "Not provided."}
        - How to Take (Dosage and Administration): ${data.howToTake || "Not provided."}
        - Common Side Effects (Adverse Reactions): ${data.sideEffects || "Not provided."}
        - What to Avoid (Drug Interactions): ${data.whatToAvoid || "Not provided."}
        - Storage Instructions: ${data.storage || "Not provided."}
        - Important Warnings: ${data.warnings || "Not provided."}

        Please provide a JSON object with the summarized content. Also, generate a brief overall summary based on all available information.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A brief, one or two-sentence summary of the medicine's purpose and key warnings, written for a layperson."
                        },
                        purpose: {
                            type: Type.STRING,
                            description: "The summarized purpose or use of the medicine, in simple terms."
                        },
                        howToTake: {
                            type: Type.STRING,
                            description: "Summarized, easy-to-follow instructions on how to take the medicine."
                        },
                        sideEffects: {
                            type: Type.OBJECT,
                            description: "Information about common side effects, including a summary and data for a chart.",
                             properties: {
                                summary: {
                                    type: Type.STRING,
                                    description: "A text summary of the common side effects in plain language."
                                },
                                chartData: {
                                    type: Type.ARRAY,
                                    description: "An array of the top 5 most common side effects for visualization. Omit if the source text does not list specific side effects.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING, description: "The name of the side effect." },
                                            frequencyPercent: { type: Type.NUMBER, description: "The estimated numerical percentage of occurrence. Estimate from the text if no exact number is given." },
                                            frequencyDescription: { type: Type.STRING, description: "The original text describing the frequency (e.g., 'greater than 5%', 'Common')." }
                                        },
                                        required: ["name", "frequencyPercent", "frequencyDescription"]
                                    }
                                }
                            },
                            required: ["summary"]
                        },
                        whatToAvoid: {
                            type: Type.STRING,
                            description: "Summarized, practical information on what to avoid (e.g., other drugs, food, activities)."
                        },
                        storage: {
                            type: Type.STRING,
                            description: "Summarized instructions on how to properly store the medicine."
                        },
                        warnings: {
                            type: Type.STRING,
                            description: "Summarized important warnings and precautions in simple, direct language."
                        }
                    },
                    required: ["summary", "purpose", "howToTake", "sideEffects", "whatToAvoid", "storage", "warnings"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SummarizedMedicineInfo;
    } catch (error) {
        console.error("Error summarizing FDA data with AI:", error);
        throw new Error("Failed to summarize the medicine information via AI.");
    }
};

/**
 * Translates the content of a MedicineInfo object to a target language.
 * @param info The MedicineInfo object to translate.
 * @param targetLanguage The language code (e.g., 'es') to translate to.
 * @returns A new MedicineInfo object with translated content.
 */
export const translateMedicineInfo = async (info: MedicineInfo, targetLanguage: string): Promise<MedicineInfo> => {
    const languageName = LANGUAGES[targetLanguage] || 'the target language';
    const textsToTranslate: string[] = [];
    
    // We create a temporary flat structure to hold the text and its path in the original object
    // so we can reconstruct it later.
    const textPaths: { path: (string | number)[], text: string }[] = [];

    const traverseAndCollect = (obj: any, path: (string | number)[] = []) => {
        if (obj === null || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
            const newPath = [...path, key];
            if (typeof value === 'string' && value.trim()) {
                // Do not translate frequencyPercent
                if (key === 'frequencyPercent') continue;
                // Only translate specific fields in chartData
                if (path.includes('chartData') && !['name', 'frequencyDescription'].includes(key)) continue;
                
                textPaths.push({ path: newPath, text: value });
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    traverseAndCollect(item, [...newPath, index]);
                });
            } else if (typeof value === 'object') {
                traverseAndCollect(value, newPath);
            }
        }
    };

    traverseAndCollect(info);

    if (textPaths.length === 0) return info;

    const prompt = `Translate the following list of texts to ${languageName}. Return the result as a JSON array of strings, where each string is the translation of the corresponding text in the input array. Maintain the exact order and array length.
    
    Input Texts:
    ${JSON.stringify(textPaths.map(p => p.text))}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const translatedTexts = JSON.parse(response.text.trim()) as string[];

        if (translatedTexts.length !== textPaths.length) {
            throw new Error("Translation API returned a mismatched number of items.");
        }

        const translatedInfo = JSON.parse(JSON.stringify(info)); // Deep copy to avoid mutation

        // Helper to set a value at a nested path
        const setNestedValue = (obj: any, path: (string | number)[], value: string) => {
            let current = obj;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        };

        textPaths.forEach((item, index) => {
            setNestedValue(translatedInfo, item.path, translatedTexts[index]);
        });
        
        return translatedInfo;
    } catch (error) {
        console.error("Error translating medicine info with AI:", error);
        throw new Error("Failed to translate the medicine information.");
    }
};