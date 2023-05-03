import { Player } from "@livepeer/react";
import { Post } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import StreamHiveAbi from "@/contracts/StreamHive.json";
import axios from "axios";
import Image from "next/image";
import Identicon from "identicon.js";

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

  const [avatar, setAvatar] = React.useState<string>();

  React.useEffect(() => {
    if (post.creatorAddress) {
      setAvatar(new Identicon(post.creatorAddress, 40).toString());
    }
  }, [post]);

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
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <Image
            width="40"
            height="40"
            src={`data:image/png;base64,${avatar}`}
            alt={post.title}
          />
        </div>
        {post.creatorAddress && (
          <span>
            {post.creatorAddress.substring(0, 5)}...
            {post.creatorAddress.substring(post.creatorAddress.length - 5)}
          </span>
        )}
        {post.creatorAddress !== address && address && (
          <button
            className="btn btn-xs btn-success flex-1 max-w-[150px] disabled:text-white/60 disabled:bg-white/10"
            onClick={followUser}
            disabled={creatorFollowed === true}
          >
            {creatorFollowed === false ? "Follow user" : "Followed"}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 flex flex-col">
          <h1 className="mb-1 text-3xl">{post.title}</h1>
          <h4>{post.description}</h4>
        </div>
        {post.creatorAddress !== address && address && (
          <button
            className="btn btn-circle mb-4 disabled:bg-white/10"
            onClick={likeStream}
            disabled={postLiked === true}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill={postLiked === false ? "none" : "red"}
              viewBox="0 0 24 24"
              stroke="red"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      <Link
        href={post.productLink}
        target="_blank"
        className="btn btn-info max-w-xs mb-4"
      >
        Buy Now
      </Link>

      <div className="min-h-[400px] relative recorded-video max-h-[500px] w-full mb-4 flex items-end">
        <Player
          title={post.title}
          src={"https://gateway.lighthouse.storage/ipfs/" + post.playbackId}
          showPipButton
          controls={{
            autohide: 3000,
          }}
          aspectRatio="16to9"
          poster={<PosterImage thumbnail={post.thumbnailUrl} />}
          priority
          autoPlay
          muted
          objectFit="contain"
        />
      </div>
    </div>
  );
}
