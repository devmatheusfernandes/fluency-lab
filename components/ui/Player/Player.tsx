"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
// FIREBASE SYNC: Uncomment the line below to import Firebase features.
// import { get, ref, onValue, set, serverTimestamp, Database } from "firebase/database";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";

import {
  Rewind15SecondsBack,
  Rewind15SecondsForward,
  Muted,
  VolumeLoud,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
} from "@solar-icons/react/ssr";

// FIREBASE SYNC: This interface defines the data structure in Firebase.
/*
interface FirebasePlayerState {
  isPlaying: boolean;
  currentTime: number;
  lastUpdated: number;
}
*/

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export interface PlayerProps {
  src: string;
  className?: string;
  transcript?: string;
  // FIREBASE SYNC: Uncomment the props below to enable real-time features.
  // db?: Database;
  // playerId?: string;
}

const Player = React.forwardRef<HTMLDivElement, PlayerProps>(
  ({ src, className, /* db, playerId, */ transcript }, ref) => {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const progressBarRef = React.useRef<HTMLInputElement>(null);

    // FIREBASE SYNC: These refs and variables are for managing real-time state.
    // const isRemoteUpdate = React.useRef(false);
    // const isRealtime = db && playerId;

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isMuted, setIsMuted] = React.useState(false);
    const [playbackRate, setPlaybackRate] = React.useState(1);
    const [isTranscriptExpanded, setIsTranscriptExpanded] =
      React.useState(false);

    const playbackRates = [0.5, 0.75, 1, 1.5, 2];

    // FIREBASE SYNC: Real-time player state synchronization
    /*
    React.useEffect(() => {
      if (!isRealtime) return;
      
      const playerStateRef = ref(db, `players/${playerId}`);
      const unsubscribe = onValue(playerStateRef, async (snapshot) => {
        if (!snapshot.exists()) {
          const initialTime = audioRef.current?.currentTime ?? 0;
          // await set(playerStateRef, { isPlaying: false, currentTime: initialTime, lastUpdated: serverTimestamp() });
          return;
        }

        const remoteState: FirebasePlayerState = snapshot.val();
        isRemoteUpdate.current = true;
        
        setIsPlaying(remoteState.isPlaying);
        setCurrentTime(remoteState.currentTime);

        if (audioRef.current) {
          if (Math.abs(audioRef.current.currentTime - remoteState.currentTime) > 1.5) {
             audioRef.current.currentTime = remoteState.currentTime;
          }
          remoteState.isPlaying ? audioRef.current.play() : audioRef.current.pause();
        }
        
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      });

      return () => unsubscribe();
    }, [isRealtime, db, playerId]);
    */

    // Standard effects for audio metadata and progress bar update
    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const setAudioData = () => {
        setDuration(audio.duration);
      };
      const updateCurrentTime = () => setCurrentTime(audio.currentTime);
      audio.addEventListener("loadedmetadata", setAudioData);
      audio.addEventListener("timeupdate", updateCurrentTime);
      return () => {
        audio.removeEventListener("loadedmetadata", setAudioData);
        audio.removeEventListener("timeupdate", updateCurrentTime);
      };
    }, [src]);

    React.useEffect(() => {
      const progressBar = progressBarRef.current;
      if (!progressBar || !duration) return;
      const progress = (currentTime / duration) * 100;
      progressBar.style.backgroundSize = `${progress}% 100%`;
    }, [currentTime, duration]);

    // FIREBASE SYNC: This function writes the local player state to Firebase.
    /*
    const writeStateToFirebase = (state: Partial<FirebasePlayerState>) => {
      if (!isRealtime || isRemoteUpdate.current) return;
      
      const playerStateRef = ref(db, `players/${playerId}`);
      const newState = {
        isPlaying: isPlaying,
        currentTime: audioRef.current?.currentTime ?? currentTime,
        ...state,
        lastUpdated: serverTimestamp(),
      };
      // set(playerStateRef, newState);
    };
    */

    const togglePlayPause = () => {
      const newIsPlaying = !isPlaying;

      if (audioRef.current) {
        if (newIsPlaying) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }

      setIsPlaying(newIsPlaying);

      // FIREBASE SYNC: This call broadcasts the state change.
      // writeStateToFirebase({ isPlaying: newIsPlaying });
    };

    const handleSeek = (amount: number) => {
      if (!audioRef.current) return;
      const newTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + amount)
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // FIREBASE SYNC: This call broadcasts the new time.
      // writeStateToFirebase({ currentTime: newTime });
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // FIREBASE SYNC: This call broadcasts the new time.
      // writeStateToFirebase({ currentTime: newTime });
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const changePlaybackRate = (rate: number) => {
      if (audioRef.current) audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          "bg-surface-1 text-paragraph p-4 rounded-3xl flex flex-col w-full shadow-lg",
          className
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <input
              type="range"
              ref={progressBarRef}
              value={currentTime}
              step="0.01"
              max={duration || 0}
              onChange={handleProgressChange}
              className="w-full h-1.5 bg-surface-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary bg-gradient-to-r from-primary to-primary bg-no-repeat"
              style={{ backgroundSize: "0% 100%" }}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSeek(-15)}
                aria-label="Seek backward 15 seconds"
                className="text-subtitle hover:text-paragraph transition-colors disabled:opacity-50"
                disabled={!duration}
              >
                <Rewind15SecondsBack className="w-7 h-7" />
              </button>
              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="bg-primary text-primary-text rounded-full p-3 hover:bg-primary-hover transition-colors disabled:opacity-50"
                disabled={!duration}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => handleSeek(15)}
                aria-label="Seek forward 15 seconds"
                className="text-subtitle hover:text-paragraph transition-colors disabled:opacity-50"
                disabled={!duration}
              >
                <Rewind15SecondsForward className="w-7 h-7" />
              </button>
            </div>
            <span className="text-sm font-mono text-subtitle">
              {formatTime(currentTime)}
            </span>
            <div className="flex-grow"></div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-subtitle">
                {formatTime(duration)}
              </span>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-subtitle hover:text-paragraph transition-colors"
              >
                {isMuted ? (
                  <Muted className="w-6 h-6" />
                ) : (
                  <VolumeLoud className="w-6 h-6" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-sm font-semibold w-14 h-8 rounded-lg bg-surface-2 hover:bg-surface-hover transition-colors disabled:opacity-50"
                    disabled={!duration}
                  >
                    {playbackRate}x
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-surface-1 border-surface-2 text-paragraph"
                >
                  {playbackRates.map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onSelect={() => changePlaybackRate(rate)}
                      className="hover:bg-surface-hover focus:bg-surface-hover"
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {transcript && (
          <div className="pt-4 mt-4 border-t border-surface-2">
            <div
              className={twMerge(
                "relative overflow-hidden transition-all duration-500 ease-in-out",
                isTranscriptExpanded ? "max-h-[400px]" : "max-h-20"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-subtitle">
                {transcript}
              </p>
              {!isTranscriptExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-surface-1 to-transparent pointer-events-none" />
              )}
            </div>
            <button
              onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              className="flex items-center gap-1 mt-2 text-sm font-semibold text-paragraph hover:text-primary transition-colors"
              aria-expanded={isTranscriptExpanded}
            >
              {isTranscriptExpanded ? "Show less" : "Show full transcript"}
              {isTranscriptExpanded ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
        <audio ref={audioRef} src={src} preload="metadata" muted={isMuted} />
      </div>
    );
  }
);

Player.displayName = "Player";

export default Player;
