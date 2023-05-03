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
  try {
    const { data } = await axios.post(
      "https://iriko.testing.huddle01.com/api/v1/create-room",
      {
        title: req.body.title,
        description:
          req.body.description !== "" ? req.body.description : req.body.title,
        startTime: new Date(req.body.startTime),
        expiryTime: new Date(req.body.endTime),
        roomLock: false,
        hostWallets: req.body.hostWallets,
        muteOnEntry: true,
        videoOnEntry: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY,
        },
      }
    );

    res.status(200).json({ stream: data });
  } catch (error) {
    res.status(500).json({ error });
  }
}
