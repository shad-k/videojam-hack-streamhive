// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    await prisma.relationship.create({
      data: {
        from: req.body.address,
        to: req.body.playbackId,
        type: 1,
      },
    });
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(502).end();
  }
}
