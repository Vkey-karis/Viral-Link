import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
    console.log("Starting speech failure diagnostic...");

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
    const model = "gemini-2.5-flash-preview-tts";
    const text = "Stop scrolling! You need to see this revolutionary product that will change your life.";
    const voiceName = "Puck";

    console.log(`Testing model: ${model}`);
    console.log(`Text: "${text}"`);
    console.log(`Voice: ${voiceName}`);

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });

        console.log("Response received.");

        // Inspect structure
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            console.log("Candidate found.");
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const part = candidate.content.parts[0];
                console.log("Part found.");
                if (part.inlineData && part.inlineData.data) {
                    console.log("SUCCESS: Audio data found in inlineData.");
                    console.log("Data length: " + part.inlineData.data.length);
                } else {
                    console.error("FAILURE: No inlineData in part.");
                    console.log("Part content:", JSON.stringify(part, null, 2));
                }
            } else {
                console.error("FAILURE: No parts in candidate.");
            }
        } else {
            console.error("FAILURE: No candidates in response.");
            console.log("Full Response:", JSON.stringify(response, null, 2));
        }

    } catch (e) {
        console.error(`API CALL FAILED: ${e.message}`);
        console.error(e);
    }
}

main();
