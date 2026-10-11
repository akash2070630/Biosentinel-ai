import React, { useState } from 'react';
import { BoundingBox } from '../../types';
import { Eye, EyeOff, Tag, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BoundingBoxCanvasProps {
  imageUrl: string;
  boxes: BoundingBox[];
  alt?: string;
  className?: string;
}

export function BoundingBoxCanvas({ imageUrl, boxes, alt = 'Wildlife detection', className = '' }: BoundingBoxCanvasProps) {
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  return (
    <div className={`relative overflow-hidden rounded-lg bg-[#0D2420] border border-[#1E4E42] group ${className}`}>
      {/* Action controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#102C27]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#2D6A4F]/60 text-xs text-[#F7F6F0] shadow-lg">
        <button
          onClick={() => setShowBoxes(!showBoxes)}
          className="flex items-center gap-1.5 hover:text-[#7BB896] transition-colors cursor-pointer"
          title={showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
        >
          {showBoxes ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{showBoxes ? 'Hide Overlays' : 'Show Overlays'}</span>
        </button>
        <span className="text-[#2D6A4F]">|</span>
        <span className="text-[#A8B9A0]">
          {boxes.length} {boxes.length === 1 ? 'Target' : 'Targets'}
        </span>
      </div>

      {/* Main image container */}
      <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-contain max-h-[640px] select-none block"
        />

        {/* Bounding box overlays */}
        {showBoxes && boxes.map((box) => {
          // Box coordinates are normalized 0 to 1000
          const top = `${(box.ymin / 1000) * 100}%`;
          const left = `${(box.xmin / 1000) * 100}%`;
          const width = `${((box.xmax - box.xmin) / 1000) * 100}%`;
          const height = `${((box.ymax - box.ymin) / 1000) * 100}%`;
          const isActive = activeBoxId === box.id;
          const isDistressed = box.distressAnomalyFlag;

          return (
            <div
              key={box.id}
              style={{ top, left, width, height }}
              onMouseEnter={() => setActiveBoxId(box.id)}
              onMouseLeave={() => setActiveBoxId(null)}
              className={`absolute transition-all duration-150 pointer-events-auto border-2 rounded-xs ${
                isDistressed
                  ? 'border-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : isActive
                  ? 'border-[#8AE3A6] bg-[#2D6A4F]/25 shadow-[0_0_15px_rgba(138,227,166,0.3)]'
                  : 'border-[#4E9F76] bg-[#1E4E42]/15 hover:border-[#8AE3A6]'
              }`}
            >
              {/* Badge on top left of bounding box */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-[#102C27]/95 border border-[#2D6A4F] px-2 py-0.5 rounded text-[11px] font-mono text-[#F7F6F0] shadow-md whitespace-nowrap z-10">
                {isDistressed ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#7BB896]" />
                )}
                <span className="font-semibold text-white">{box.label}</span>
                <span className="text-[#8AE3A6]">{(box.confidence * 100).toFixed(0)}%</span>
                {box.individualName && (
                  <span className="text-amber-300 font-bold border-l border-[#2D6A4F] pl-1.5 ml-0.5">
                    ID: {box.individualName}
                  </span>
                )}
              </div>

              {/* Expanded detail tooltip on hover */}
              {isActive && (
                <div className="absolute -bottom-16 left-0 z-30 bg-[#0E2420]/95 backdrop-blur-md border border-[#2D6A4F] p-2 rounded shadow-2xl text-[11px] text-[#E0E7DC] min-w-[240px] pointer-events-none">
                  {box.scientificName && (
                    <div className="italic text-[#A8B9A0] mb-0.5">{box.scientificName}</div>
                  )}
                  {box.reIdConfidence && (
                    <div className="text-amber-300 font-semibold mb-1">
                      Probabilistic Re-ID: {(box.reIdConfidence * 100).toFixed(1)}% match
                    </div>
                  )}
                  {box.visualFeatures && box.visualFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {box.visualFeatures.map((feat, idx) => (
                        <span key={idx} className="bg-[#173F35] text-[#9FD8B8] px-1.5 py-0.2 rounded text-[10px]">
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer bar with coordinate bounds */}
      <div className="bg-[#0B1E1A] px-4 py-2 border-t border-[#1A453A] flex flex-wrap items-center justify-between text-xs text-[#7E9685]">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-[#7BB896]" />
          <span>Local Object Coordinates:</span>
          <span className="font-mono text-[#A8B9A0]">
            {boxes.length > 0
              ? `[Y: ${boxes[0].ymin}–${boxes[0].ymax}, X: ${boxes[0].xmin}–${boxes[0].xmax}]`
              : 'Full frame analysis'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#A8B9A0]/70">Normalized Scale: 1000 × 1000 px</span>
      </div>
    </div>
  );
}
