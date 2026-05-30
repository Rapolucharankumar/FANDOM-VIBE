import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db-client";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  
  if (!room) {
    return NextResponse.json({ error: "Missing 'room' query parameter" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the user
  const currentUser = await dbClient.getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create a new AccessToken
  const at = new AccessToken(apiKey, apiSecret, {
    identity: currentUser.id,
    name: currentUser.username,
  });

  // Grant permissions for the specific room
  at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  return NextResponse.json({ token });
}
