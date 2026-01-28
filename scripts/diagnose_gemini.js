import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
    console.log("Starting diagnostic...");

    // Read .env
    let apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const envContent = fs.readFileSync('.env', 'utf-8');
            const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
            if (match) apiKey = match[1].trim();
        } catch (e) {
            console.log("Could not read .env file");
        }
    }

    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const modelsToTest = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    for (const model of modelsToTest) {
        console.log(`\nTesting ${model}...`);
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts: [{ text: "Say hello" }] }],
                config: {
                    // responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } },
                },
            });
            console.log(`SUCCESS: ${model} generated audio.`);
        } catch (e) {
            console.log(`FAILURE: ${model} - ${e.message}`);
        }
    }
}

main();
