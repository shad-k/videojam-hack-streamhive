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
    await prisma.relationship.create({
      data: {
        from: req.body.address,
        to: req.body.creatorAddress,
        type: 0,
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(502).end();
  }
}
