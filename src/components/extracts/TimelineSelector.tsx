import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/theme-context';
import { cn } from '../../lib/utils';

interface TimelineSelectorProps {
  duration: number; // Total duration in minutes
  startTime: string;
  endTime: string;
  onTimeChange: (start: string, end: string) => void;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  duration,
  startTime,
  endTime,
  onTimeChange,
}) => {
  const { theme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  // Convert time string (MM:SS) to minutes
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [min, sec] = time.split(':').map(Number);
    return min + (sec || 0) / 60;
  };

  // Convert minutes to time string (MM:SS)
  const minutesToTime = (minutes: number): string => {
    const min = Math.floor(minutes);
    const sec = Math.round((minutes - min) * 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startPos = (timeToMinutes(startTime) / duration) * 100;
  const endPos = (timeToMinutes(endTime) / duration) * 100;

  const handleMouseDown = (type: 'start' | 'end') => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    const minutes = (percentage / 100) * duration;

    const newTime = minutesToTime(minutes);

    if (isDragging === 'start') {
      if (minutes < timeToMinutes(endTime)) {
        onTimeChange(newTime, endTime);
      }
    } else {
      if (minutes > timeToMinutes(startTime)) {
        onTimeChange(startTime, newTime);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startTime, endTime, duration]);

  return (
    <div className="space-y-4">
      {/* Timeline Track */}
      <div className="relative">
        <div
          ref={trackRef}
          className={cn(
            "h-16 rounded-xl relative cursor-pointer",
            theme === "dark" ? "bg-gray-800" : "bg-gray-200"
          )}
        >
          {/* Selected Range */}
          <div
            className={cn(
              "absolute top-0 h-full border-l-2 border-r-2",
              theme === "dark"
                ? "bg-purple-500/30 border-purple-500"
                : "bg-purple-500/30 border-purple-600"
            )}
            style={{
              left: `${startPos}%`,
              width: `${endPos - startPos}%`,
            }}
          />

          {/* Start Handle */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-12 rounded cursor-ew-resize transition-colors shadow-lg z-10",
              theme === "dark"
                ? "bg-purple-500 hover:bg-purple-400"
                : "bg-purple-600 hover:bg-purple-700"
            )}
            style={{ left: `${startPos}%` }}
            onMouseDown={() => handleMouseDown('start')}
          >
            <div className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap",
              theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-900 text-white"
            )}>
              {startTime}
            </div>
          </div>

          {/* End Handle */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-12 rounded cursor-ew-resize transition-colors shadow-lg z-10",
              theme === "dark"
                ? "bg-purple-500 hover:bg-purple-400"
                : "bg-purple-600 hover:bg-purple-700"
            )}
            style={{ left: `${endPos}%` }}
            onMouseDown={() => handleMouseDown('end')}
          >
            <div className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap",
              theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-900 text-white"
            )}>
              {endTime}
            </div>
          </div>

          {/* Time Markers */}
          <div className={cn(
            "absolute bottom-1 left-2 text-xs",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>00:00</div>
          <div className={cn(
            "absolute bottom-1 right-2 text-xs",
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          )}>
            {minutesToTime(duration)}
          </div>
        </div>
      </div>

      {/* Manual Time Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={cn(
            "block text-sm font-medium mb-1",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}>
            Début
          </label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => onTimeChange(e.target.value, endTime)}
            placeholder="00:00"
            className={cn(
              "w-full px-3 py-2 border-2 rounded-xl transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            )}
          />
        </div>
        <div>
          <label className={cn(
            "block text-sm font-medium mb-1",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}>
            Fin
          </label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => onTimeChange(startTime, e.target.value)}
            placeholder="00:00"
            className={cn(
              "w-full px-3 py-2 border-2 rounded-xl transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              theme === "dark"
                ? "bg-[#0a0a0f] border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            )}
          />
        </div>
      </div>

      {/* Duration Display */}
      <div className={cn(
        "text-sm text-center",
        theme === "dark" ? "text-gray-400" : "text-gray-600"
      )}>
        Durée sélectionnée: {minutesToTime(timeToMinutes(endTime) - timeToMinutes(startTime))}
      </div>
    </div>
  );
};

export default TimelineSelector;
