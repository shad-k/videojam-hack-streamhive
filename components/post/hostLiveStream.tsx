import React from "react";
import { Post } from "@prisma/client";
import {
  useAudio,
  useLivestream,
  useLobby,
  usePeers,
  useRecording,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { useEventListener } from "@huddle01/react";

export default function HostLiveStream({ post }: { post: Post }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const {
    fetchVideoStream,
    stopVideoStream,
    produceVideo,
    isProducing,
    stream,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    isProducing: isProducingAudio,
    stream: audioStream,
    produceAudio,
  } = useAudio();
  const { startRecording, stopRecording, isStarting, inProgress, isStopping } =
    useRecording();
  // Event Listner
  useEventListener("lobby:cam-on", () => {
    console.log(stream, videoRef.current);
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  });

  const { startLivestream, stopLivestream } = useLivestream();

  React.useEffect(() => {
    if (stream && isProducing) {
      (videoRef.current as any).srcObject = stream;
      startLivestream("l", "l", "twitch");
    }
  }, [isProducing, stream, startLivestream]);

  useEventListener("room:new-peer", () => {
    console.log("Peer joined");
  });

  return (
    <>
      <button
        onClick={() => joinLobby.isCallable && joinLobby(post.playbackId)}
      >
        Join Lobby
      </button>
      <button onClick={() => joinRoom.isCallable && joinRoom()}>
        Join Room
      </button>
      <button
        disabled={!fetchVideoStream.isCallable}
        onClick={fetchVideoStream}
      >
        Enable Video
      </button>
      <button
        disabled={!fetchAudioStream.isCallable}
        onClick={fetchAudioStream}
      >
        Enable Audio
      </button>
      <button
        disabled={!produceVideo.isCallable}
        onClick={() => produceVideo(stream)}
      >
        Produce Cam
      </button>

      <button
        disabled={!produceAudio.isCallable}
        onClick={() => produceAudio(audioStream)}
      >
        Produce Mic
      </button>
      <video ref={videoRef} autoPlay muted></video>
    </>
  );
}
