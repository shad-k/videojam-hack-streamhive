// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import { Post } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  postsCount: number;
  followersCount: number;
  followingCount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const address = req.body.address;
    const postsCount = await prisma.post.count({
      where: {
        creatorAddress: address,
      },
    });
    const followersCount = await prisma.relationship.count({
      where: {
        from: address,
        type: 0,
      },
    });
    const followingCount = await prisma.relationship.count({
      where: {
        to: address,
        type: 0,
      },
    });
    res.status(200).json({
      postsCount,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.log(error);
    res.status(502).end();
  }
}
