import { Roark } from '@roarkanalytics/sdk';
import chalk from 'chalk';

import { mastra } from '../../mastra';
import { createConversation, formatToolInvocations } from './utils';
import { uploadToCloudinary } from './upload';

const client = new Roark({
    bearerToken: process.env.ROARK_API_KEY
});

async function speechToSpeechServerExample() {
    const { start, stop } = createConversation({
        mastra,
        recordingPath: './speech-to-speech-server.mp3',
        providerOptions: {},
        initialMessage: 'Howdy partner',
        onConversationEnd: async (props) => {
            // File upload
            const url = await uploadToCloudinary(props.recordingPath)

            // Send to Roark
            console.log('Send to Roark', props, url)
            const response = await client.callAnalysis.create({
                recordingUrl: url,
                startedAt: props.startedAt,
                callDirection: 'INBOUND',
                interfaceType: 'PHONE',
                participants: [
                    { role: 'AGENT', spokeFirst: props.agent.spokeFirst, name: props.agent.name, phoneNumber: props.agent.phoneNumber },
                    { role: 'CUSTOMER', name: 'Jane Doe', phoneNumber: '123456789' },
                ],
                properties: props.metadata,
                toolInvocations: formatToolInvocations(props.toolInvocations),
            });

            console.log('Call Recording Posted:', response.data);
        },
        onSessionUpdated: async (session) => {
            // Additional custom session handling if needed
        },
        onResponseDone: async (item) => {
            // console.log('YOOOO', item)
        },
        onError: async (error) => {
            console.error(error)
        },
        onWriting: (ev) => {
            const color = ev.role === "user" ? chalk.green : chalk.blue;
            if (ev.role === 'assistant') {
                process.stdout.write(color(ev.text));
            }
        },
    });

    await start();

    process.on('SIGINT', async (e) => {
        console.log('SIGINT', e)
        await stop();
    })
}


speechToSpeechServerExample().catch(console.error)
