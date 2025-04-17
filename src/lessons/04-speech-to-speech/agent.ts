import { getMicrophone, playAudio } from "@mastra/node-audio";
import { mastra } from "../../mastra";
import { weatherTool } from "../../mastra/tools";

const agent = mastra.getAgent('speechToSpeechServer');
const { stream: audioStream } = getMicrophone();

agent.voice.connect()
agent.voice.close()

agent.voice.addTools({ weatherTool })
agent.voice.addInstructions('Updated system instructions')

agent.voice.speak('Hello, how are you?')
agent.voice.on('speaker', (stream) => {
    playAudio(stream)
})

agent.voice.send(audioStream)

agent.voice.listen(audioStream)
agent.voice.on('writing', (data) => {
  if (data.role === 'assistant') {
    console.log(`Assistant: ${data.text}`)
  }

  if (data.role === 'user') {
    console.log(`Customer: ${data.text}`)
  }
})

agent.voice.updateConfig({
  turn_detection: {
    type: "server_vad",
    threshold: 0.5,
    silence_duration_ms: 1000
  }
})

agent.voice.on('session.updated', (session) => {
  // Do something with session
})

agent.voice.answer()
agent.voice.on('response.created', (_data) => {
  // Do something with data
})

agent.voice.on('response.done', (_data) => {
  // Do something with data
})

agent.voice.on('tool-call-start', (_data) => {
  // Do something with data
})

agent.voice.on('tool-call-result', (_data) => {
  // Do something with data
})

agent.voice.on('error', (error) => {
  console.error(error)
})


