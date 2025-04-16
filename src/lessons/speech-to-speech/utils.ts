import * as p from '@clack/prompts';
import readline from "readline"
import type { Mastra } from "@mastra/core";
import { createHuddle } from "@mastra/node-audio"
import { Roark } from '@roarkanalytics/sdk';

export function formatToolInvocations(toolInvocations: unknown[]): Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[] {
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
    console.log(toolInvocations);
    return toolInvocations as Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[]
}


export function createConversation({
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

    handleEnterKeypress(() => {
        huddle.interrupt()
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
            // if (agent.voice instanceof OpenAIRealtimeVoice) {
            //     agent.voice.disconnect()
            // }
            huddle.stop()
        }
    };
}

export function handleEnterKeypress(fn: () => void) {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.setRawMode != null) {
        process.stdin.setRawMode(true);
    }

    process.stdin.on("keypress", function (letter, key) {
        if (key.ctrl && key.name === "c") {
            process.exit();
        }
        if (key.name === "return") {
            fn();
        }
    });
}