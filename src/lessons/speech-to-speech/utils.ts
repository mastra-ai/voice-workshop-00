import * as p from '@clack/prompts';
import readline from "readline"
import type { Mastra } from "@mastra/core";
import { createHuddle } from "@mastra/node-audio"
import { Roark } from '@roarkanalytics/sdk';

export function formatToolInvocations(toolInvocations: unknown[]): Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[] {
    const toolInvocationsFormatted = toolInvocations.map((toolInvocation: unknown) => {
        const toolCall = toolInvocation as ToolCallResult;
        return {
            name: toolCall.toolName,
            description: toolCall.toolDescription,
            startOffsetMs: toolCall.startOffsetMs,
            parameters: toolCall.args,
            result: toolCall.result
        }
    })
    return toolInvocationsFormatted as Roark.CallAnalysis.CallAnalysisCreateParams.ToolInvocation[]
}

type ToolCallStart = {
    toolCallId: string,
    toolName: string,
    toolDescription: string,
}

type ToolCallResult = {
    toolCallId: string,
    toolName: string,
    toolDescription: string,
    startOffsetMs?: number,
    args: Record<string, unknown>,
    result: Record<string, unknown>,
}

export function createConversation({
    mastra,
    recordingPath,
    providerOptions,
    onSessionUpdated,
    onSpeaker,
    onResponseDone,
    onResponseCreated,
    onToolCallStart,
    onToolCallResult,
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
    onResponseCreated?: (item: any) => Promise<void> | void,
    onToolCallStart?: (toolCall: ToolCallStart) => Promise<void> | void,
    onToolCallResult?: (toolCall: ToolCallResult) => Promise<void> | void,
    onError?: (error: any) => Promise<void> | void,
    onWriting?: (ev: any) => void,
    initialMessage?: string,
    metadata?: Record<string, string>,
    onConversationEnd?: (props: {
        audioBuffer: Buffer,
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
    let startedAt = Date.now();

    agent.voice.updateConfig(providerOptions ?? {})

    agent.voice.on('session.updated', async (session) => {
        if (onSessionUpdated) {
            await onSessionUpdated(session);
        }
    })

    agent.voice.on('speaker', (stream) => {
        huddle.play(stream)

        if (onSpeaker) {
            onSpeaker(stream);
        }
    });

    if (onError) {
        agent.voice.on('error', onError);
    }

    if (onWriting) {
        agent.voice.on('writing', onWriting);
    }

    const toolInvocationDuration = new Map<string, number>();

    if (onToolCallStart) {
        agent.voice.on('tool-call-start', (data: unknown) => {
            const toolCall = data as ToolCallStart;
            console.log('tool-start', toolCall)
            onToolCallStart(toolCall);
            toolInvocationDuration.set(toolCall.toolCallId, Date.now());
        })
    }

    if (onToolCallResult) {
        agent.voice.on('tool-call-result', (data: unknown) => {
            const toolCall = data as ToolCallResult;
            console.log('tool-result', toolCall)
            onToolCallResult(toolCall);
            const startOffsetMs = Date.now() - startedAt;
            (toolCall as any).startOffsetMs = startOffsetMs;
            toolInvocations.push(toolCall)
        })
    }

    if (onResponseCreated) {
        agent.voice.on('response.created', onResponseCreated);
    }

    if (onResponseDone) {
        agent.voice.on('response.done', onResponseDone);
    }

    const huddle = createHuddle({
        record: {
            outputPath: recordingPath,
        }
    })

    handleEnterKeypress(() => {
        huddle.interrupt()
    })

    const audioChunks: Buffer[] = [];
    const recorderStream = (huddle as any).recorder.stream;

    return {
        agent,
        huddle,
        start: async () => {
            const spinner = p.spinner()
            spinner.start('Connecting...')
            await agent.voice.connect();
            spinner.stop()
            huddle.start()
            recorderStream.on('data', (chunk: Buffer) => {
                audioChunks.push(chunk)
            })
            agent.voice.send(huddle.getMicrophoneStream())

            if (initialMessage) {
                await agent.voice.speak(initialMessage)
            }

            startedAt = Date.now();
        },
        stop: async () => {
            // if (agent.voice instanceof OpenAIRealtimeVoice) {
            //     agent.voice.disconnect()
            // }
            
            try {
                huddle.stop();
                recorderStream.end();
                await onConversationEnd?.({
                    audioBuffer: Buffer.concat(audioChunks),
                    metadata,
                    startedAt: new Date(startedAt).toISOString(),
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