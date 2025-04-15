import { playAudio } from "@mastra/node-audio";
import { mastra } from './mastra';
import * as p from '@clack/prompts';

// Helper function to format text with line wrapping
function formatText(text: string, maxWidth: number): string {
    const words = text.split(' ');
    let result = '';
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            result += (result ? '\n' : '') + currentLine;
            currentLine = word;
        }
    }

    if (currentLine) {
        result += (result ? '\n' : '') + currentLine;
    }

    return result;
}

async function textToSpeech() {
    p.intro('Text-to-Speech Demo');

    let continueConversation = true;

    while (continueConversation) {
        const userPrompt = await p.text({
            message: 'Enter your prompt for the AI:',
            placeholder: 'What color is the sky?',
            initialValue: '',
            validate(value) {
                if (!value) return 'Please enter a prompt';
                return;
            },
        });

        // Exit if cancelled
        if (p.isCancel(userPrompt)) {
            p.cancel('Operation cancelled.');
            process.exit(0);
        }

        const spinner = p.spinner();
        spinner.start('Generating response...');

        const textToSpeechAgent = mastra.getAgent('voiceEnabledAgent');
        const { text } = await textToSpeechAgent.generate(userPrompt as string);

        spinner.message('Converting text to speech...');

        const audioStream = await textToSpeechAgent.voice.speak(text, {
            speaker: "alloy", // Optional: specify a speaker
            speed: 1.2,
            responseFormat: "wav", // Optional: specify a response format
        });

        spinner.stop('Done!');

        // Format the text to wrap at 80 characters for better display
        const formattedText = formatText(text, 80);
        p.note(formattedText, 'AI Response');
        p.log.info('Playing audio response...');

        playAudio(audioStream!);

        // Ask if the user wants to continue
        const shouldContinue = await p.confirm({
            message: 'Would you like to ask another question?',
            initialValue: true,
        });

        // Check for cancellation or if user wants to stop
        if (p.isCancel(shouldContinue) || shouldContinue === false) {
            continueConversation = false;
        }
    }

    p.outro('Thanks for using the Text-to-Speech Demo!');
}

textToSpeech().catch((error) => {
    p.log.error('An error occurred:');
    console.error(error);
    process.exit(1);
});