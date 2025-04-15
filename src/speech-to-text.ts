import { mastra } from './mastra';
import { getMicrophone } from '@mastra/node-audio';
import * as p from '@clack/prompts';

async function processOneInteraction(agent: any) {
    try {
        // Get microphone stream and start recording immediately
        const { stream: audioStream, mic } = getMicrophone();

        // Show that audio is recording
        p.log.info('Audio recording is active. Start speaking now...');

        // Use clack/prompts to let the user signal when to stop recording and start transcription
        const stopRecording = await p.confirm({
            message: 'Press Y when you are done speaking to start transcription',
        });

        mic.stop();

        if (!stopRecording) {
            // Make sure to end the stream before returning
            p.cancel('Transcription cancelled.');
            return false; // Return false to indicate cancellation
        }

        if (p.isCancel(stopRecording)) {
            p.cancel('Operation cancelled.');
            process.exit(0);
        }


        // Show a spinner while transcribing
        const s = p.spinner();
        s.start('Processing your speech...');

        const transcript = await agent.voice.listen(audioStream);

        s.stop('Transcription complete');
        p.log.success(`User said: ${transcript}`);

        // Show a spinner while generating a response
        s.start('Generating recommendation...');
        const { text } = await agent.generate(`Based on what the user said, provide them a recommendation: ${transcript}`);
        s.stop('Recommendation generated');

        p.log.info(`Recommendation: ${text}`);
        return true; // Return true to indicate successful completion
    } catch (error) {
        p.log.error('An error occurred during processing:');
        console.error(error);
        return false; // Return false to indicate failure
    }
}

async function speechToText() {
    p.intro('Speech-to-Text Demo');

    // Create a new agent for speech-to-text
    const agent = mastra.getAgent('voiceEnabledAgent');

    let continueInteracting = true;

    while (continueInteracting) {
        try {
            // Process one interaction
            const success = await processOneInteraction(agent);

            // If the interaction was cancelled or failed, ask if they want to exit
            if (!success) {
                const shouldExit = await p.confirm({
                    message: 'Do you want to exit the application?',
                });

                if (shouldExit) {
                    return;
                }
                continue;
            }

            // Ask if they want to continue with another interaction
            const shouldContinue = await p.confirm({
                message: 'Would you like to speak again?',
            });

            if (!shouldContinue) {
                return;
            }

            p.log.info('Starting a new interaction...');
        } catch (error) {
            p.log.error('An unexpected error occurred:');
            console.error(error);

            const shouldExit = await p.confirm({
                message: 'An error occurred. Do you want to exit the application?',
            });

            if (shouldExit) {
                return;
            }
        }
    }
}

speechToText().then(() => {
    p.outro('Thanks for using the Speech-to-Text Demo!');
}).catch((error) => {
    p.log.error('An error occurred:');
    console.error(error);
    p.outro('Application terminated due to an error.');
    process.exit(1);
});
