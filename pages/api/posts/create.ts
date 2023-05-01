import prisma from "@/lib/prisma";
import axios from "axios";

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  stream?: any;
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    postId,
    title,
    description,
    startTime,
    endTime,
    playbackId,
    isLiveStream: isLivestream,
    creatorAddress,
    thumbnailUrl,
  } = req.body;
  try {
    await prisma.post.create({
      data: {
        postId: `${postId}`,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        playbackId,
        isLivestream,
        creatorAddress,
        thumbnailUrl,
      },
    });

    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}
