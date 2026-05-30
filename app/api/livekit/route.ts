import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username") || `User_${Math.floor(Math.random() * 1000)}`;
  
  if (!room) {
    return NextResponse.json({ error: "Missing 'room' query parameter" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Create a new AccessToken
  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  });

  // Grant permissions for the specific room
  at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  return NextResponse.json({ token });
}
