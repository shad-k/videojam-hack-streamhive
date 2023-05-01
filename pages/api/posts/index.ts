// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import { Post } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  posts: Partial<Post>[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const address = JSON.parse(req.body).address;
    const posts = await prisma.post.findMany({
      select: {
        postId: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        playbackId: true,
        isLivestream: true,
        creatorAddress: true,
        thumbnailUrl: true,
      },
      where: {
        creatorAddress: address,
      },
    });
    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(502).end();
  }
}
