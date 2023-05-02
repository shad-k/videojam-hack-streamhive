import { Player } from "@livepeer/react";
import { Post } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import StreamHiveAbi from "@/contracts/StreamHive.json";
import axios from "axios";

function PosterImage({ thumbnail }: { thumbnail: string | null }) {
  if (!thumbnail) {
    return null;
  }

  return (
    <img src={"https://gateway.lighthouse.storage/ipfs/" + thumbnail} alt="" />
  );
}

export default function RecordedVideo({ post }: { post: Post }) {
  const [creatorFollowed, setCreatorFollowed] = React.useState<boolean>();
  const [postLiked, setPostLiked] = React.useState<boolean>();

  const { data: signer } = useSigner();
  const { address } = useAccount();

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
      <Player
        title={post.title}
        src={"https://gateway.lighthouse.storage/ipfs/" + post.playbackId}
        showPipButton
        controls={{
          autohide: 3000,
        }}
        poster={<PosterImage thumbnail={post.thumbnailUrl} />}
        objectFit="cover"
        priority
        autoPlay
        muted
      />
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
