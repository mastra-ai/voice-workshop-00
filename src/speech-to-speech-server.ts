import chalk from 'chalk';
import { mastra } from './mastra';
import { createHuddle } from '@mastra/node-audio';
import type { Mastra } from '@mastra/core';


function createConversation({
    mastra,
    recordingPath,
    providerOptions,
    onSessionUpdated,
    onSpeaker,
    onResponseDone,
    onError,
    onWriting,
    initialMessage,
}: {
    mastra: Mastra,
    recordingPath: string,
    providerOptions?: Record<string, unknown>,
    onSessionUpdated?: (session: any) => Promise<void> | void,
    onSpeaker?: (stream: any) => Promise<void> | void,
    onResponseDone?: (item: any) => Promise<void> | void,
    onError?: (error: any) => Promise<void> | void,
    onWriting?: (ev: any) => void,
    initialMessage?: string
}) {
    const agent = mastra.getAgent('speechToSpeechServer');

    agent.voice.updateConfig(providerOptions ?? {})

    // Set up session.updated event handler
    agent.voice.on('session.updated', async (session) => {
        console.log('Session updated', session)
        if (onSessionUpdated) {
            await onSessionUpdated(session);
        }
    })

    // Set up other event handlers

    agent.voice.on('speaker', (stream) => {
        huddle.play(stream)

        if (onSpeaker) {
            onSpeaker(stream);
        }
    });


    if (onResponseDone) {
        agent.voice.on('response.done', onResponseDone);
    }

    if (onError) {
        agent.voice.on('error', onError);
    }

    if (onWriting) {
        agent.voice.on('writing', onWriting);
    }

    const huddle = createHuddle({
        record: {
            outputPath: recordingPath,
        }
    })

    // TODO: We need to listen for toolcall results
    huddle.on('recorder.end', async () => {
        // Get the audio file
        // s3 upload
        // Upload it get a url back
        // this is where we need to transmit to Roark
        const recordingObject = {
            recordingUrl: 'https://example.com/recording.wav',
            startedAt: new Date().toISOString(),
            callDirection: 'INBOUND',
            interfaceType: 'PHONE',
            participants: [
                { role: 'AGENT', spokeFirst: true, name: 'John Doe', phoneNumber: '123456789' },
                { role: 'CUSTOMER', name: 'Jane Doe', phoneNumber: '123456789' },
            ],
            properties: {
                // Any custom properties
                'business_name': 'customer-busines-name',
                'business_id': 'customer-business-id'
            },
            toolInvocations: [
                {
                    name: "bookAppointment",
                    description: "Book an appointment",
                    startOffsetMs: 7000,
                    parameters: {
                        // Parameters are submitted as key-value pairs
                        patientName: "John Doe",
                        patientPhone: "+1234567890",
                        appointmentType: {
                            // Parameter values can alternatively be objects which include the value and an optional description and type
                            value: 'cleaning',
                            description: 'Type of dental appointment',
                            type: 'string',
                        }
                    },
                    // Result can be a string or an object
                    result: "success",
                },
            ]
        }
    })

    return {
        agent, huddle, start: async () => {
            await agent.voice.connect();
            huddle.start()
            agent.voice.send(huddle.getMicrophoneStream())

            if (initialMessage) {
                await agent.voice.speak(initialMessage)
            }
        },
        stop: async () => {
            huddle.stop()
        }
    };
}

async function speechToSpeechServerExample() {
    const { start, stop } = createConversation({
        mastra,
        recordingPath: './recordings',
        providerOptions: {},
        initialMessage: 'Howdy partner',
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
        }
    });

    await start();

    process.on('SIGKILL', async () => {
        await stop();
    })
}

speechToSpeechServerExample().catch(console.error)
