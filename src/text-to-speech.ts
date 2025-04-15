import { playAudio } from "@mastra/node-audio";
import { mastra } from './mastra';
import * as p from '@clack/prompts';

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

        const textToSpeechAgent = mastra.getAgent('textToSpeech');
        const { text } = await textToSpeechAgent.generate(userPrompt as string);

        spinner.message('Converting text to speech...');

        const audioStream = await textToSpeechAgent.voice.speak(text, {
            speaker: "alloy", // Optional: specify a speaker
            responseFormat: "wav", // Optional: specify a response format
        });

        spinner.stop('Done!');

        p.note(text, 'AI Response');
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