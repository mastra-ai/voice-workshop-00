import chalk from 'chalk';
import { mastra } from './mastra';
import { createHuddle } from '@mastra/node-audio';

async function speechToSpeechServerExample() {
    const agent = mastra.getAgent('speechToSpeechServer');

    const huddle = createHuddle({
        record: {
            outputPath: './speech-to-speech-server.mp3',
        }
    })

    agent.voice.updateConfig({
        // TODO WE NEED THE TYPES FOR THIS
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.7,
            "prefix_padding_ms": 1500,
            "silence_duration_ms": 800,
            "create_response": true, // only in conversation mode
            "interrupt_response": true, // only in conversation mode
        }
    })

    agent.voice.on('session.updated', async (session) => {
        console.log('Session updated', session)
    })

    agent.voice.on('speaker', async (stream) => {
        huddle.play(stream)
    })

    agent.voice.on("response.done", async (item) => {
        // console.log('YOOOO', item)
    })

    agent.voice.on('error', async (error) => {
        console.error(error)
    })

    agent.voice.on("writing", (ev) => {
        const color = ev.role === "user" ? chalk.green : chalk.blue;
        if (ev.role === 'assistant') {
            process.stdout.write(color(ev.text));
        }
    });

    await agent.voice.connect();

    huddle.start()

    await agent.voice.speak('Howdy partner')

    agent.voice.send(huddle.getMicrophoneStream())

    // TODO: We need to listen for toolcall results
    huddle.on('recorder.end', async () => {
        // Get the audio file
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

    process.on('SIGKILL', () => {
        huddle.stop();
    })
}

speechToSpeechServerExample().catch(console.error)
