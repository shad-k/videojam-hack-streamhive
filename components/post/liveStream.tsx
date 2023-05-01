import { Post } from "@prisma/client";
import { Video, Audio } from "@huddle01/react/components";
import { useLobby, usePeers, useRoom } from "@huddle01/react/hooks";
import { useEventListener } from "@huddle01/react";

export default function LiveStream({ post }: { post: Post }) {
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const { peers } = usePeers();

  useEventListener("room:new-peer", () => {
    console.log("Peer joined");
  });

  console.log(post.playbackId, peers);
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
      {Object.values(peers).map((peer) => {
        if (peer.role !== "host") {
          return null;
        }
        return <Video key={peer.peerId} peerId={peer.peerId} debug />;
      })}
    </>
  );
}
