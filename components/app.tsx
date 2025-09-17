"use client";

import Controls from "@/components/controls";
import Scene from "@/components/scene";
import Logs from "@/components/logs";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { INSTRUCTIONS, TOOLS } from "@/lib/config";
import { BASE_URL, MODEL } from "@/lib/constants";
import { startPlanetaryTour } from "@/lib/planetary-tour";

type ToolCallOutput = {
  response: string;
  [key: string]: any;
};

export default function App() {
  const [logs, setLogs] = useState<any[]>([]);
  const [toolCall, setToolCall] = useState<any>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [songUrl, setSongUrl] = useState<string | null>(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioTransceiver = useRef<RTCRtpTransceiver | null>(null);
  const tracks = useRef<RTCRtpSender[] | null>(null);

  // Start a new realtime session
  async function startSession() {
    try {
      if (!isSessionStarted) {
        setIsSessionStarted(true);
        // Get an ephemeral session token
        const session = await fetch("/api/session").then((response) =>
          response.json()
        );
        const sessionToken = session.client_secret.value;
        const sessionId = session.id;

        console.log("Session id:", sessionId);

        // Create a peer connection
        const pc = new RTCPeerConnection();

        // Set up to play remote audio from the model
        if (!audioElement.current) {
          audioElement.current = document.createElement("audio");
        }
        audioElement.current.autoplay = true;
        pc.ontrack = (e) => {
          if (audioElement.current) {
            audioElement.current.srcObject = e.streams[0];
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        stream.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, stream);
          if (sender) {
            tracks.current = [...(tracks.current || []), sender];
          }
        });

        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        setDataChannel(dc);

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(`${BASE_URL}?model=${MODEL}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/sdp",
          },
        });

        const answer: RTCSessionDescriptionInit = {
          type: "answer",
          sdp: await sdpResponse.text(),
        };
        await pc.setRemoteDescription(answer);

        peerConnection.current = pc;
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionStarted(false);
    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);
    setIsListening(false);
    audioTransceiver.current = null;
  }

  // Grabs a new mic track and replaces the placeholder track in the transceiver
  async function startRecording() {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioStream(newStream);

      // If we already have an audioSender, just replace its track:
      if (tracks.current) {
        const micTrack = newStream.getAudioTracks()[0];
        tracks.current.forEach((sender) => {
          sender.replaceTrack(micTrack);
        });
      } else if (peerConnection.current) {
        // Fallback if audioSender somehow didn't get set
        newStream.getTracks().forEach((track) => {
          const sender = peerConnection.current?.addTrack(track, newStream);
          if (sender) {
            tracks.current = [...(tracks.current || []), sender];
          }
        });
      }

      setIsListening(true);
      console.log("Microphone started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }

  // Replaces the mic track with a placeholder track
  function stopRecording() {
    setIsListening(false);

    // Stop existing mic tracks so the user's mic is off
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);

    // Replace with a placeholder (silent) track only if peer connection is still active
    if (tracks.current && peerConnection.current && peerConnection.current.connectionState !== 'closed') {
      const placeholderTrack = createEmptyAudioTrack();
      tracks.current.forEach((sender) => {
        sender.replaceTrack(placeholderTrack);
      });
    }
  }

  // Creates a placeholder track that is silent
  function createEmptyAudioTrack(): MediaStreamTrack {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    return destination.stream.getAudioTracks()[0];
  }

  // Send a message to the model
  const sendClientEvent = useCallback(
    (message: any) => {
      if (dataChannel) {
        message.event_id = message.event_id || crypto.randomUUID();
        dataChannel.send(JSON.stringify(message));
      } else {
        console.error(
          "Failed to send message - no data channel available",
          message
        );
      }
    },
    [dataChannel]
  );

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    async function handleToolCall(output: any) {
      const toolCall = {
        name: output.name,
        arguments: output.arguments,
      };
      console.log("Tool call:", toolCall);
      setToolCall(toolCall);

      // TOOL CALL HANDLING
      // Initialize toolCallOutput with a default response
      const toolCallOutput: ToolCallOutput = {
        response: `Tool call ${toolCall.name} executed successfully.`,
      };

      // Handle special tool calls
      if (toolCall.name === "get_iss_position") {
        const issPosition = await fetch("/api/iss").then((response) =>
          response.json()
        );
        console.log("ISS position:", issPosition);
        toolCallOutput.issPosition = issPosition;
      }

      if (toolCall.name === "play_solar_system_song") {
        try {
          const songUrl = "/solar-system-song.ogg";
          setSongUrl(songUrl);

          // Create and play the local audio file
          const audio = new Audio(songUrl);

          // Clear song notification when audio ends (keep camera on Earth)
          audio.onended = () => {
            setSongUrl(null);
          };

          audio.play();

          // Fade out audio in the last 3 seconds
          setTimeout(() => {
            const fadeOut = setInterval(() => {
              if (audio.volume > 0.1) {
                audio.volume -= 0.1;
              } else {
                clearInterval(fadeOut);
              }
            }, 200);
          }, 92000); // Start fade at 92s (3 seconds before 95s end)

          // Start synchronized planetary tour
          startPlanetaryTour(setToolCall);

          toolCallOutput.response = "Voici notre chanson spéciale Air Liquide sur le système solaire! Listen as we explore each planet and discover all the gases that your parents work with at Air Liquide!";
        } catch (error) {
          console.error("Error playing song:", error);
          toolCallOutput.response = "I couldn't play our special song right now, but let me tell you all about the amazing gases your parents work with at Air Liquide!";
        }
      }

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: output.call_id,
          output: JSON.stringify(toolCallOutput),
        },
      });

      // Force a model response to make sure it responds after certain tool calls
      if (
        toolCall.name === "get_iss_position" ||
        toolCall.name === "display_data" ||
        toolCall.name === "play_solar_system_song"
      ) {
        sendClientEvent({
          type: "response.create",
        });
      }
    }

    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (event.type === "response.done") {
          const output = event.response.output[0];
          setLogs((prev) => [output, ...prev]);
          if (output?.type === "function_call") {
            handleToolCall(output);
          }
        }
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setIsListening(true);
        setLogs([]);
        // Send session config
        const sessionUpdate = {
          type: "session.update",
          session: {
            tools: TOOLS,
            instructions: INSTRUCTIONS,
          },
        };
        sendClientEvent(sessionUpdate);
        console.log("Session update sent:", sessionUpdate);
      });
    }
  }, [dataChannel, sendClientEvent]);

  const handleConnectClick = async () => {
    if (isSessionActive) {
      console.log("Stopping session.");
      stopSession();
    } else {
      console.log("Starting session.");
      startSession();
    }
  };

  const handleMicToggleClick = async () => {
    if (isListening) {
      console.log("Stopping microphone.");
      stopRecording();
    } else {
      console.log("Starting microphone.");
      startRecording();
    }
  };


  return (
    <div className="relative size-full">
      <Scene toolCall={toolCall} />

      {/* Air Liquide Logo */}
      <div className="absolute top-4 left-4 z-10">
        <Image
          src="/logo-air-liquide.png"
          alt="Air Liquide"
          width={200}
          height={48}
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
          priority
        />
      </div>

      <Controls
        handleConnectClick={handleConnectClick}
        handleMicToggleClick={handleMicToggleClick}
        isConnected={isSessionActive}
        isListening={isListening}
      />
      <Logs messages={logs} />

      {/* Song Player Notification */}
      {songUrl && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
            </svg>
            <div>
              <p className="font-bold">🎵 Solar System Song Playing!</p>
              <p className="text-sm">Learning about gases in space!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
