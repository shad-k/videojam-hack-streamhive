import React from "react";
import { Post } from "@prisma/client";
import { Video, Audio } from "@huddle01/react/components";
import { useLobby, usePeers, useRoom } from "@huddle01/react/hooks";
import StreamHiveAbi from "@/contracts/StreamHive.json";
import Link from "next/link";
import { useAccount, useContract, useSigner } from "wagmi";
import axios from "axios";

export default function LiveStream({ post }: { post: Post }) {
  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();
  const { peers } = usePeers();

  const [creatorFollowed, setCreatorFollowed] = React.useState<boolean>();
  const [postLiked, setPostLiked] = React.useState<boolean>();

  const { address } = useAccount();

  const { data: signer } = useSigner();

  const contract = useContract({
    address: process.env.NEXT_PUBLIC_CONTRACT as `0x${string}`,
    abi: StreamHiveAbi,
    signerOrProvider: signer,
  });

  React.useEffect(() => {
    if (address) {
      (async () => {
        const { data } = await axios.post("/api/user/following", {
          address,
          creatorAddress: post.creatorAddress,
        });
        if (data.following) {
          setCreatorFollowed(true);
        } else {
          setCreatorFollowed(false);
        }
      })();
      (async () => {
        const { data } = await axios.post("/api/posts/liked", {
          address,
          playbackId: post.playbackId,
        });
        if (data.liked) {
          setPostLiked(true);
        } else {
          setPostLiked(false);
        }
      })();
    }
  }, [address, post.creatorAddress, post.playbackId]);

  const followUser = async () => {
    if (!contract) {
      alert("Something went wrong");
      return;
    }

    const address = await signer?.getAddress();
    const filter = contract.filters.UserFollowed(address, post.creatorAddress);
    await contract.followUser(post.creatorAddress);
    contract.once(filter, async () => {
      console.log("calling api");
      await axios.post("/api/user/follow", {
        address,
        creatorAddress: post.creatorAddress,
      });

      setCreatorFollowed(true);
    });
  };

  const likeStream = async () => {
    const address = await signer?.getAddress();
    await axios.post("/api/posts/like", {
      address,
      playbackId: post.playbackId,
    });
    setPostLiked(true);
  };

  return (
    <div>
      <button
        onClick={() => joinLobby.isCallable && joinLobby(post.playbackId)}
      >
        Join Lobby
      </button>
      <button onClick={() => joinRoom.isCallable && joinRoom()}>
        Join Room
      </button>
      {Object.values(peers).map((peer) => {
        if (!peer.cam) {
          return null;
        }
        return <Video key={peer.peerId} peerId={peer.peerId} />;
      })}
      {Object.values(peers).map((peer) => {
        if (!peer.mic) {
          return null;
        }
        return <Audio key={peer.peerId} peerId={peer.peerId} />;
      })}
      <Link href={post.productLink} target="_blank" className="btn btn-lg">
        Buy Now
      </Link>
      <div>
        {post.creatorAddress}
        {creatorFollowed === false && post.creatorAddress !== address && (
          <button onClick={followUser}>Follow user</button>
        )}
      </div>
      <div>
        {postLiked === false && post.creatorAddress !== address && (
          <button className="btn btn-sm" onClick={likeStream}>
            Like
          </button>
        )}
      </div>
    </div>
  );
}
