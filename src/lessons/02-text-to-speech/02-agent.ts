/**
 * This example demonstrates text-to-speech using Mastra agents.
 * Features:
 * - Uses an AI agent to generate dynamic content (Lakers news headlines)
 * - Text preprocessing (markdown link stripping)
 * - Customized speech synthesis with speed adjustment
 */

import { mastra } from "../../mastra";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { playAudio } from "@mastra/node-audio";
import { stripMarkdownLinks } from "./utils";

const agent = mastra.getAgent('webSearchAgent')

async function textToSpeech() {
    p.intro(chalk.bold('Text to Speech Demo'));

    const s = p.spinner();
    s.start('Generating text...');

    const { text } = await agent.generate(`
        Search for the latest news about the Lakers and synthesize the headlines only. 3 Headlines only.`)

    s.stop('Text generated')

    // Strip markdown links from the text
    const cleanText = stripMarkdownLinks(text);

    p.log.info(cleanText)

    const audioStream = await agent.voice.speak(cleanText, {
        responseFormat: 'wav',
        speed: 1.2,
    })

    playAudio(audioStream!)

}

textToSpeech().catch(console.error)
