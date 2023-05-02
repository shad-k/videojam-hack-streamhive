import React from "react";
import { Post } from "@prisma/client";
import {
  useAudio,
  useLobby,
  usePeers,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { useEventListener } from "@huddle01/react";

export default function HostLiveStream({ post }: { post: Post }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { joinLobby, leaveLobby } = useLobby();
  const { joinRoom, leaveRoom } = useRoom();
  const {
    fetchVideoStream,
    stopVideoStream,
    produceVideo,
    stream,
    stopProducingVideo,
  } = useVideo();
  const {
    fetchAudioStream,
    stopAudioStream,
    stream: audioStream,
    produceAudio,
    stopProducingAudio,
  } = useAudio();

  // Event Listner
  useEventListener("lobby:cam-on", () => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  });

  const [inLobby, setInLobby] = React.useState<boolean>(false);
  const [inRoom, setInRoom] = React.useState<boolean>(false);
  const { peerIds } = usePeers();

  React.useEffect(() => {
    if (stream && !produceVideo.isCallable) {
      (videoRef.current as any).srcObject = stream;
      console.log("sh: displaying video");
    }
  }, [stream, produceVideo]);

  return (
    <div className="w-full">
      <h1 className="mb-1 text-3xl">{post.title}</h1>
      <h4 className="mb-4">{post.description}</h4>
      <video
        className="min-h-[400px] max-h-[500px] w-full bg-black"
        ref={videoRef}
        autoPlay
        muted
      ></video>

      <div>
        <h4 className="my-4 text-xl">Controls:</h4>
        <div className="flex flex-col space-y-4">
          {inLobby ? (
            <div className="w-full flex flex-wrap items-center space-x-2">
              <button
                onClick={() => {
                  leaveLobby();
                  setInLobby(false);
                  console.log("sh: left lobby");
                }}
                className="btn btn-error"
              >
                Leave Lobby
              </button>

              {!inRoom ? (
                <>
                  {/* Not in room */}
                  {/* Camera buttons */}
                  {fetchVideoStream.isCallable && (
                    <button
                      onClick={() => {
                        fetchVideoStream();
                        console.log("sh: enable camera");
                      }}
                      className="btn btn-success"
                    >
                      Enable Camera
                    </button>
                  )}
                  {stopVideoStream.isCallable && (
                    <button
                      onClick={() => {
                        stopVideoStream();
                        console.log("sh: disable camera");
                      }}
                      className="btn btn-error"
                    >
                      Disable Camera
                    </button>
                  )}

                  {/* Mic buttons */}
                  {fetchAudioStream.isCallable && (
                    <button
                      onClick={() => {
                        fetchAudioStream();
                        console.log("sh: enable mic");
                      }}
                      className="btn btn-success"
                    >
                      Enable Mic
                    </button>
                  )}
                  {stopAudioStream.isCallable && (
                    <button
                      onClick={() => {
                        stopAudioStream();
                        console.log("sh: disable mic");
                      }}
                      className="btn btn-error"
                    >
                      Disable Mic
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* In Room */}
                  {/* Camera buttons */}
                  {produceVideo.isCallable && stream && (
                    <button
                      onClick={() => {
                        produceVideo(stream);
                        console.log("sh: start camera");
                      }}
                      className="btn btn-success"
                    >
                      Start Camera
                    </button>
                  )}
                  {stopProducingVideo.isCallable && (
                    <button
                      onClick={() => {
                        stopProducingVideo();
                        console.log("sh: stop camera");
                      }}
                      className="btn btn-error"
                    >
                      Stop Camera
                    </button>
                  )}

                  {/* Mic buttons */}
                  {produceAudio.isCallable && audioStream && (
                    <button
                      onClick={() => {
                        produceAudio(audioStream);
                        console.log("sh: start mic");
                      }}
                      className="btn btn-success"
                    >
                      Start Mic
                    </button>
                  )}
                  {stopProducingAudio.isCallable && (
                    <button
                      onClick={() => {
                        stopProducingAudio();
                        console.log("sh: stop mic");
                      }}
                      className="btn btn-error"
                    >
                      Stop Mic
                    </button>
                  )}
                </>
              )}

              {inRoom ? (
                <button
                  onClick={() => {
                    leaveRoom();
                    console.log("sh: leave room");
                    setInRoom(false);
                  }}
                  className="btn btn-accent"
                  disabled={!leaveRoom.isCallable}
                >
                  Leave Room
                </button>
              ) : (
                <button
                  onClick={() => {
                    joinRoom();
                    console.log("sh: join room");
                    setInRoom(true);
                  }}
                  className="btn btn-accent"
                  disabled={!joinRoom.isCallable}
                >
                  Join Room
                </button>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-wrap items-center space-x-2">
              <button
                onClick={() => {
                  joinLobby(post.playbackId);
                  setInLobby(true);
                  console.log("sh: joined lobby");
                }}
                className="btn btn-accent"
              >
                Join Lobby
              </button>
            </div>
          )}
        </div>
        <div className="stats bg-black/50 shadow my-4">
          <div className="stat place-items-center">
            <div className="stat-title">Viewers</div>
            <div className="stat-value">{peerIds.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
