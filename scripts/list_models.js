import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

async function main() {
    console.log("Listing models...");

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

    try {
        // The SDK might not have a direct listModels method on 'first-class' client, 
        // but usually it's under an admin or model service. 
        // Checking if standard list works or if we need a specific endpoint.
        // For @google/genai 0.1.x/latest, sometimes it is ai.models.list()

        // Let's try to just list them if possible? 
        // Actually, standard `generateContent` doesn't list models.
        // We might need to use the REST API if the SDK doesn't expose it easily in this version.
        // But let's try a direct call if the SDK supports it.

        // Since I can't be sure of the SDK version's exact surface for listing without docs,
        // I'll try to use the `models` namespace if it exists.

        // If this fails, I will use a simple fetch to the REST API.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models.`);
            data.models.forEach(m => {
                if (m.name.includes('gemini') || m.name.includes('tts')) {
                    console.log(`- ${m.name}`);
                    console.log(`  Supported: ${m.supportedGenerationMethods?.join(', ')}`);
                }
            });
        } else {
            console.log("No models found or error listing:", data);
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

main();
