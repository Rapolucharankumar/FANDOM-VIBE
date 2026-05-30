"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";

type LiveRoomProps = {
  roomName: string;
  onLeave: () => void;
};

export function LiveRoom({ roomName, onLeave }: LiveRoomProps) {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomName}`);
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || "Failed to fetch token");
        }
        setToken(data.token);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, [roomName]);

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-[28px] border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm font-bold text-red-400">Failed to join room</p>
        <p className="mt-2 text-xs text-red-400/70">{error}</p>
        <button
          onClick={onLeave}
          className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <Loader2 className="size-8 animate-spin text-cyan" />
        <p className="mt-4 text-sm font-semibold text-white/50">Joining room...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <LiveKitRoom
        video={false} // Default to voice-only, users can turn on video
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={onLeave}
        className="h-[500px]"
        data-lk-theme="default"
      >
        <RoomView />
      </LiveKitRoom>
    </div>
  );
}

function RoomView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
          <ParticipantTile />
        </GridLayout>
      </div>
      <div className="border-t border-white/8 bg-ink/50 p-2">
        <ControlBar
          controls={{ camera: true, microphone: true, screenShare: true, chat: false }}
        />
      </div>
      <RoomAudioRenderer />
    </div>
  );
}
