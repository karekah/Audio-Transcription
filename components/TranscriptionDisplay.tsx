
import React from 'react';
import { TranscriptionStatus } from '../types';

interface TranscriptionDisplayProps {
  status: TranscriptionStatus;
  transcription: string;
  error: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
        <p className="text-sky-300 font-medium">Transcribing, please wait...</p>
    </div>
);

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ status, transcription, error }) => {
  if (status === TranscriptionStatus.IDLE) {
    return null;
  }

  return (
    <div className="w-full min-h-[12rem] bg-slate-900 rounded-lg p-6 flex items-center justify-center">
      {status === TranscriptionStatus.PROCESSING && <LoadingSpinner />}
      {status === TranscriptionStatus.ERROR && (
        <div className="text-center text-red-400">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      {status === TranscriptionStatus.SUCCESS && (
        <div className="w-full text-left">
          <h3 className="font-bold text-xl mb-4 text-slate-300 border-b border-slate-700 pb-2">Transcription Result:</h3>
          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{transcription}</p>
        </div>
      )}
    </div>
  );
};
