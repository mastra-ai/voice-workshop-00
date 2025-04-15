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
    metadata,
    onConversationEnd
}: {
    mastra: Mastra,
    recordingPath: string,
    providerOptions?: Record<string, unknown>,
    onSessionUpdated?: (session: any) => Promise<void> | void,
    onSpeaker?: (stream: any) => Promise<void> | void,
    onResponseDone?: (item: any) => Promise<void> | void,
    onError?: (error: any) => Promise<void> | void,
    onWriting?: (ev: any) => void,
    initialMessage?: string,
    metadata?: Record<string, string>,
    onConversationEnd?: (props: {
        recordingPath: string,
        startedAt: string,
        metadata?: Record<string, string>,
        toolInvocations: any[],
        agent: {
            spokeFirst: boolean,
            name: string,
            phoneNumber: string
        }
    }) => Promise<void> | void,
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

    let startedAt = new Date().toISOString();

    // TODO: We need to listen for toolcall results
    huddle.on('recorder.end', async () => {
        onConversationEnd?.({
            recordingPath,
            metadata,
            startedAt,
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
            ],
            agent: {
                spokeFirst: !!initialMessage,
                name: agent.name,
                phoneNumber: '123456789'
            }
        })
    })

    return {
        agent, huddle, start: async () => {
            await agent.voice.connect();
            huddle.start()
            agent.voice.send(huddle.getMicrophoneStream())

            if (initialMessage) {
                await agent.voice.speak(initialMessage)
            }

            startedAt = new Date().toISOString();
        },
        stop: async () => {
            huddle.stop()
        }
    };
}

async function speechToSpeechServerExample() {
    const { start, stop } = createConversation({
        mastra,
        recordingPath: './speech-to-speech-server.mp3',
        providerOptions: {},
        initialMessage: 'Howdy partner',
        onConversationEnd: async (props) => {
            // File upload
            // Send to Roark

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

    process.on('SIGKILL', async () => {
        await stop();
    })
}

speechToSpeechServerExample().catch(console.error)
