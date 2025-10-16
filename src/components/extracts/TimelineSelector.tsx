import React, { useState, useRef, useEffect } from 'react';

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
          className="h-16 bg-gray-200 rounded-lg relative cursor-pointer"
        >
          {/* Selected Range */}
          <div
            className="absolute top-0 h-full bg-indigo-500 bg-opacity-30 border-l-2 border-r-2 border-indigo-600"
            style={{
              left: `${startPos}%`,
              width: `${endPos - startPos}%`,
            }}
          />

          {/* Start Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-12 bg-indigo-600 rounded cursor-ew-resize hover:bg-indigo-700 transition-colors shadow-lg z-10"
            style={{ left: `${startPos}%` }}
            onMouseDown={() => handleMouseDown('start')}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
              {startTime}
            </div>
          </div>

          {/* End Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-12 bg-indigo-600 rounded cursor-ew-resize hover:bg-indigo-700 transition-colors shadow-lg z-10"
            style={{ left: `${endPos}%` }}
            onMouseDown={() => handleMouseDown('end')}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
              {endTime}
            </div>
          </div>

          {/* Time Markers */}
          <div className="absolute bottom-1 left-2 text-xs text-gray-600">00:00</div>
          <div className="absolute bottom-1 right-2 text-xs text-gray-600">
            {minutesToTime(duration)}
          </div>
        </div>
      </div>

      {/* Manual Time Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => onTimeChange(e.target.value, endTime)}
            placeholder="00:00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => onTimeChange(startTime, e.target.value)}
            placeholder="00:00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Duration Display */}
      <div className="text-sm text-gray-600 text-center">
        Selected duration: {minutesToTime(timeToMinutes(endTime) - timeToMinutes(startTime))}
      </div>
    </div>
  );
};

export default TimelineSelector;
