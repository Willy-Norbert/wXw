
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { mic, MicOff, Square, Play, Pause } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AudioData {
  url: string;
  duration: number;
  blob: Blob;
  file: File;
}

interface AudioRecorderProps {
  onAudioReady: (audioData: AudioData) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Get audio duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    try {
      const timestamp = Date.now();
      const audioFile = new File([audioBlob], `audio-${timestamp}.webm`, { type: 'audio/webm' });
      
      // Upload to Supabase
      const uploadResult = await uploadFile(audioFile, 'ecommerce');
      
      const audioData: AudioData = {
        url: uploadResult.url,
        duration,
        blob: audioBlob,
        file: audioFile,
      };

      onAudioReady(audioData);
      
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setIsPlaying(false);
      
      toast({
        title: "Audio sent",
        description: "Your voice message has been sent",
      });

    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Error",
        description: "Failed to send audio message",
        variant: "destructive",
      });
    }
  };

  const discardAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {!audioBlob ? (
        // Recording controls
        <div className="flex items-center space-x-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="rounded-full p-2"
              title="Record audio message"
            >
              <mic className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="sm"
                className="rounded-full p-2"
                title="Stop recording"
              >
                <Square className="w-4 h-4" />
              </Button>
              <span className="text-sm text-red-600 font-mono">
                {formatTime(recordingTime)}
              </span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      ) : (
        // Playback and send controls
        <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-2">
          <Button
            onClick={isPlaying ? pauseAudio : playAudio}
            variant="ghost"
            size="sm"
            className="rounded-full p-1"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <span className="text-sm font-mono">
            {formatTime(Math.floor(duration))}
          </span>
          
          <Button
            onClick={discardAudio}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </Button>
          
          <Button
            onClick={sendAudio}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-3"
          >
            Send
          </Button>
          
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
