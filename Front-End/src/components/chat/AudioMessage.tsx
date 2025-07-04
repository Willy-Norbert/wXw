
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface AudioMessageProps {
  audioUrl: string;
  duration?: number;
  isCurrentUser: boolean;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl, duration = 0, isCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg max-w-xs ${
        isCurrentUser 
          ? 'bg-purple-500 text-white ml-auto' 
          : 'bg-white border border-gray-200'
      }`}
    >
      <Button
        onClick={togglePlayback}
        variant="ghost"
        size="sm"
        className={`rounded-full p-2 ${
          isCurrentUser 
            ? 'hover:bg-purple-600 text-white' 
            : 'hover:bg-gray-100'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        {/* Waveform visualization (simplified as progress bar) */}
        <div className={`w-full h-1 rounded-full mb-1 ${
          isCurrentUser ? 'bg-purple-400' : 'bg-gray-200'
        }`}>
          <div 
            className={`h-full rounded-full transition-all duration-100 ${
              isCurrentUser ? 'bg-white' : 'bg-purple-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className={`text-xs ${
          isCurrentUser ? 'text-purple-100' : 'text-gray-500'
        }`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className={`text-xs ${
        isCurrentUser ? 'text-purple-100' : 'text-gray-400'
      }`}>
        🎵
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AudioMessage;
