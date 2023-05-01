import { Player } from "@livepeer/react";
import { Post } from "@prisma/client";
import Image from "next/image";

function PosterImage({ thumbnail }: { thumbnail: string | null }) {
  if (!thumbnail) {
    return null;
  }

  return (
    <img src={"https://gateway.lighthouse.storage/ipfs/" + thumbnail} alt="" />
  );
}

export default function RecordedVideo({ post }: { post: Post }) {
  return (
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
    />
  );
}
