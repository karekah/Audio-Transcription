import React, { useState, useCallback } from 'react';
import { AudioInput } from './components/AudioInput';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { transcribeAudio } from './services/geminiService';
import { TranscriptionStatus } from './types';
import { Logo } from './components/icons/Logo';

interface AudioData {
  base64: string;
  mimeType: string;
  url: string;
}

const App: React.FC = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [error, setError] = useState<string>('');

  const handleAudioReady = (base64: string, mimeType: string, url: string) => {
    setAudioData({ base64, mimeType, url });
    setStatus(TranscriptionStatus.IDLE);
    setTranscription('');
    setError('');
  };

  const handleReset = () => {
    setAudioData(null);
    setTranscription('');
    setStatus(TranscriptionStatus.IDLE);
    setError('');
  };

  const handleTranscribe = useCallback(async () => {
    if (!audioData) return;

    setStatus(TranscriptionStatus.PROCESSING);
    setError('');
    setTranscription('');

    try {
      const result = await transcribeAudio(audioData.base64, audioData.mimeType);
      setTranscription(result);
      setStatus(TranscriptionStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Transcription failed: ${errorMessage}`);
      setStatus(TranscriptionStatus.ERROR);
    }
  }, [audioData]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
             <Logo />
             <h1 className="text-4xl font-bold text-sky-400">Audio Transcriber</h1>
          </div>
          <p className="text-lg text-slate-400">
            Upload an audio file or record your voice to get a high-quality transcription powered by Gemini.
          </p>
        </header>

        <main className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 space-y-6 border border-slate-700">
          <AudioInput 
            onAudioReady={handleAudioReady} 
            onReset={handleReset} 
            isProcessing={status === TranscriptionStatus.PROCESSING}
          />

          {/* 
            Fix: Removed redundant 'disabled' attribute and related styles from the button below.
            The button is only rendered when not in a 'PROCESSING' state, so the disabled check was always false and caused a TypeScript error.
          */}
          {audioData && status !== TranscriptionStatus.PROCESSING && (
            <div className="flex justify-center">
              <button
                onClick={handleTranscribe}
                className="w-full sm:w-auto px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 active:bg-sky-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Transcribe Audio
              </button>
            </div>
          )}
          
          <TranscriptionDisplay 
            status={status}
            transcription={transcription}
            error={error}
          />
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;