"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
// FIREBASE SYNC: Uncomment the line below to import Firebase features.
// import { ref, onValue, set, serverTimestamp, Database } from "firebase/database";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";

import {
  Muted,
  VolumeLoud,
  Play,
  Pause,
  ArrowDown,
  ArrowUp,
  Maximize, // Icon for Fullscreen
  Minimize, // Icon for exiting Fullscreen
} from "@solar-icons/react/ssr";

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export interface VideoPlayerProps {
  src: string;
  className?: string;
  transcript?: string;
  poster?: string;
  // FIREBASE SYNC: Uncomment the props below to enable real-time features.
  // db?: Database;
  // playerId?: string;
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  ({ src, className, transcript, poster /*, db, playerId */ }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const progressBarRef = React.useRef<HTMLInputElement>(null);

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [isMuted, setIsMuted] = React.useState(false);
    const [playbackRate, setPlaybackRate] = React.useState(1);
    const [isTranscriptExpanded, setIsTranscriptExpanded] =
      React.useState(false);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [showControls, setShowControls] = React.useState(false);

    const playbackRates = [0.5, 0.75, 1, 1.5, 2];

    // --- Handlers ---
    // highlight-start
    // FIX 1: Simplified the play/pause handler.
    // It now only gives commands to the video element. The event listeners
    // will handle updating the React state, preventing conflicts.
    const togglePlayPause = () => {
      if (videoRef.current) {
        if (videoRef.current.paused || videoRef.current.ended) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    };
    // highlight-end

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;
      const newTime = Number(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const toggleMute = () => setIsMuted(!isMuted);

    const changePlaybackRate = (rate: number) => {
      if (videoRef.current) videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    };

    const toggleFullScreen = () => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    // --- Effects ---
    React.useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const setVideoData = () => setDuration(video.duration);
      const updateCurrentTime = () => setCurrentTime(video.currentTime);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("loadedmetadata", setVideoData);
      video.addEventListener("timeupdate", updateCurrentTime);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("loadedmetadata", setVideoData);
        video.removeEventListener("timeupdate", updateCurrentTime);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }, [src]);

    React.useEffect(() => {
      const handleFullScreenChange = () =>
        setIsFullScreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handleFullScreenChange);
      return () =>
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
    }, []);

    // highlight-start
    // FIX 2: Added this effect to update the progress bar's background color.
    React.useEffect(() => {
      const progressBar = progressBarRef.current;
      if (!progressBar || !duration) return;
      const progress = (currentTime / duration) * 100;
      progressBar.style.backgroundSize = `${progress}% 100%`;
    }, [currentTime, duration]);
    // highlight-end

    return (
      <div
        ref={ref}
        className={twMerge("w-full mx-auto flex flex-col", className)}
      >
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted={isMuted}
            onClick={togglePlayPause}
            className="w-full h-full object-contain"
          />

          <div
            className={twMerge(
              "absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              showControls && "opacity-100"
            )}
          >
            <div></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="bg-primary/80 text-primary-text rounded-full p-4 hover:bg-primary transition-transform transform hover:scale-110 pointer-events-auto"
                >
                  <Play className="w-10 h-10" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {/* highlight-start */}
              {/* FIX 2: Added gradient classes for the progress fill effect. */}
              <input
                type="range"
                ref={progressBarRef}
                value={currentTime}
                step="0.01"
                max={duration || 0}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-primary to-primary bg-no-repeat [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                style={{ backgroundSize: "0% 100%" }}
              />
              {/* highlight-end */}
              <div className="flex items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlayPause}>
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <button onClick={toggleMute}>
                    {isMuted ? (
                      <Muted className="w-6 h-6" />
                    ) : (
                      <VolumeLoud className="w-6 h-6" />
                    )}
                  </button>
                  <span className="text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-sm font-semibold w-14 h-8 rounded-lg hover:bg-white/20 transition-colors">
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
                  <button onClick={toggleFullScreen}>
                    {isFullScreen ? (
                      <Minimize className="w-6 h-6" />
                    ) : (
                      <Maximize className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {transcript && (
          <div className="bg-surface-1 rounded-b-2xl p-4">
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
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
