import { Router, Request, Response } from "express";
import { AccessToken } from "livekit-server-sdk";
import { ensureBotRunning } from "../helpers/ensureBotRunning";

const LivekitRouter = Router();

interface TokenRequestBody {
  roomName: string;
  participantName: string;
}

LivekitRouter.post(
  "/token",
  async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
    const { roomName, participantName } = req.body;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        ttl: "1h",
      },
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    ensureBotRunning(roomName);

    res.json({ token: await at.toJwt() });
  },
);

export default LivekitRouter;
