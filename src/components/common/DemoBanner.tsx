import React from 'react';
import { AlertCircle, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

interface DemoBannerProps {
  isDemo?: boolean;
  geminiConfigured?: boolean;
  modelName?: string;
}

export function DemoBanner({ isDemo, geminiConfigured, modelName }: DemoBannerProps) {
  return (
    <div className="bg-[#12362E] border-y border-[#1E4E42] px-4 py-2 text-xs text-[#A8B9A0] flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-[#7BB896]" />
        <span>
          <strong className="text-[#F7F6F0]">Active Model Engine:</strong> {modelName || 'Gemini 3.8 Flash Multimodal & BioSentinel-Vision v4.2'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {geminiConfigured ? (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Gemini API Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Bio-Simulated Pretrained Engine (Demo Mode Active)
          </span>
        )}
        <span className="flex items-center gap-1 text-[#C4D4BD]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#86AA90]" />
          Decision-Support Protocol Enforced
        </span>
      </div>
    </div>
  );
}
