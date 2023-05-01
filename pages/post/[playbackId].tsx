import HostLiveStream from "@/components/post/hostLiveStream";
import LiveStream from "@/components/post/liveStream";
import prisma from "@/lib/prisma";
import { Post } from "@prisma/client";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useAccount } from "wagmi";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const playbackId = (context.params as any).playbackId;
  const post = await prisma.post.findFirst({
    where: {
      playbackId,
    },
  });

  return {
    props: {
      post: {
        postId: post?.postId,
        title: post?.title,
        description: post?.description,
        startTime: new Date(post?.startTime as Date).valueOf(),
        endTime: new Date(post?.endTime as Date).valueOf(),
        playbackId: post?.playbackId,
        isLivestream: post?.isLivestream,
        creatorAddress: post?.creatorAddress,
        thumbnailUrl: post?.thumbnailUrl,
      },
    },
  };
};
export default function PostDetail({ post }: { post: Post }) {
  const { address } = useAccount();

  if (post.creatorAddress === address) {
    return <HostLiveStream post={post} />;
  }
  if (post && post.isLivestream) {
    return <LiveStream post={post} />;
  }
  return null;
}
