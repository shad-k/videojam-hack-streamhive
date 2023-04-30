// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  user: Partial<User>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const address = JSON.parse(req.body).address;
  console.log({
    address,
  });
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });
  if (user) {
    res.status(200).json({
      user: {
        address: user.address,
        name: user.name,
        email: user.email,
      },
    });
  } else {
    res.status(404);
  }
}
