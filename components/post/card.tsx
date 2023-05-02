import React from "react";
import { Post } from "@prisma/client";
import Link from "next/link";
import Identicon from "identicon.js";
import Image from "next/image";

export default function Card({ post }: { post: Post }) {
  const [avatar, setAvatar] = React.useState<string>();

  React.useEffect(() => {
    if (post.creatorAddress) {
      setAvatar(new Identicon(post.creatorAddress, 40).toString());
    }
  }, [post]);

  return (
    <div className="card h-[350px] w-64 bg-base-100 shadow-xl image-full">
      <figure>
        <img
          className="h-full w-full object-fit object-center"
          src={
            post.thumbnailUrl ?? "https://placehold.co/400x600?text=StreamHive"
          }
          alt={post.title}
        />
      </figure>
      <div className="card-body">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <Image
              width="40"
              height="40"
              src={`data:image/png;base64,${avatar}`}
              alt={post.title}
            />
          </div>
          <span className="mx-2 text-sm">
            {post.creatorAddress.substring(0, 5)}...
            {post.creatorAddress.substring(post.creatorAddress.length - 5)}
          </span>
        </div>
        <h2 className="card-title">{post.title}</h2>
        <p>{post.description}</p>
        <Link href={`/post/${post.playbackId}`}>
          <div className="card-actions">
            <button className="btn btn-primary">Watch</button>
          </div>
        </Link>
      </div>
    </div>
  );
}
