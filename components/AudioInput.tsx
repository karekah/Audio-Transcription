
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AudioInputProps {
  onAudioReady: (base64: string, mimeType: string, url: string) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const AudioInput: React.FC<AudioInputProps> = ({ onAudioReady, onReset, isProcessing }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = useCallback(async () => {
    onReset();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onAudioReady(base64String, audioBlob.type, url);
        };
        
        // Stop all media tracks to turn off the microphone indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  }, [onAudioReady, onReset]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onReset();
      const url = URL.createObjectURL(file);
      setAudioURL(url);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onAudioReady(base64String, file.type, url);
      };
    }
  }, [onAudioReady, onReset]);

  const handleLocalReset = () => {
      onReset();
      setAudioURL('');
      if(isRecording) handleStopRecording();
  }

  return (
    <div className="bg-slate-700/50 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
      {audioURL ? (
        <div className="w-full flex flex-col items-center space-y-4">
            <audio src={audioURL} controls className="w-full" />
            <button
                onClick={handleLocalReset}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors disabled:bg-slate-600"
            >
                <TrashIcon />
                Clear Audio
            </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-full sm:w-1/2 flex items-center justify-center gap-3 px-6 py-3 font-bold rounded-lg transition-all duration-200 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isRecording ? <><StopIcon /> Stop Recording</> : <><MicrophoneIcon /> Record Audio</>}
          </button>
          <div className="w-full sm:w-auto text-center text-slate-400 font-semibold">OR</div>
          <label className="w-full sm:w-1/2 cursor-pointer flex items-center justify-center gap-3 px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors">
            <UploadIcon />
            Upload File
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}
    </div>
  );
};
