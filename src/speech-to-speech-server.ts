import * as p from '@clack/prompts';
import type { Mastra } from '@mastra/core';
import { createHuddle } from '@mastra/node-audio';
import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime';
import { Roark } from '@roarkanalytics/sdk';
import chalk from 'chalk';
import { v2 as cloudinary } from 'cloudinary';
import { mastra } from './mastra';

const client = new Roark({
    bearerToken: process.env.ROARK_API_KEY
});

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
    const toolInvocations: unknown[] = []
    const agent = mastra.getAgent('speechToSpeechServer');

    agent.voice.updateConfig(providerOptions ?? {})

    // Set up session.updated event handler
    agent.voice.on('session.updated', async (session) => {
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

    agent.voice.on('tool-result', (toolCall) => {
        console.log('tool-result', toolCall)
        toolInvocations.push(toolCall)
    })


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
        try {
            await onConversationEnd?.({
                recordingPath,
                metadata,
                startedAt,
                toolInvocations,
                agent: {
                    spokeFirst: !!initialMessage,
                    name: agent.name,
                    phoneNumber: '123456789'
                }
            })
            process.exit(0)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }

    })

    return {
        agent, 
        huddle, 
        start: async () => {
            const spinner = p.spinner()
            spinner.start('Connecting...')
            await agent.voice.connect();
            spinner.stop()
            huddle.start()
            agent.voice.send(huddle.getMicrophoneStream())

            if (initialMessage) {
                await agent.voice.speak(initialMessage)
            }

            startedAt = new Date().toISOString();
        },
        stop: async () => {
            if (agent.voice instanceof OpenAIRealtimeVoice) {
                agent.voice.disconnect()
            }

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

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(path: string) {
    const response = await cloudinary.uploader.upload(path, { resource_type: 'raw' })
    console.log(response)
    return response.url
}

function formatToolInvocations(toolInvocations: unknown[]): Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[] {
    // [
    //     {
    //         name: "bookAppointment",
    //         description: "Book an appointment",
    //         startOffsetMs: 7000,
    //         parameters: {
    //             // Parameters are submitted as key-value pairs
    //             patientName: "John Doe",
    //             patientPhone: "+1234567890",
    //             appointmentType: {
    //                 // Parameter values can alternatively be objects which include the value and an optional description and type
    //                 value: 'cleaning',
    //                 description: 'Type of dental appointment',
    //                 type: 'string',
    //             }
    //         },
    //         // Result can be a string or an object
    //         result: "success",
    //     },
    // ]
    return toolInvocations as Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[]
}

speechToSpeechServerExample().catch(console.error)
