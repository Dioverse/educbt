import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamTimer({ initialTime, onTimeUp }) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 300) return 'text-red-600 bg-red-50 border-red-200'; // 5 minutes
    if (timeRemaining <= 600) return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // 10 minutes
    return 'text-primary-600 bg-primary-50 border-primary-200';
  };

  const isLowTime = timeRemaining <= 300;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getTimerColor()}`}>
      {isLowTime ? (
        <AlertTriangle size={20} className="animate-pulse" />
      ) : (
        <Clock size={20} />
      )}
      <span className="font-mono font-semibold text-lg">
        {formatTime(timeRemaining)}
      </span>
      {isLowTime && (
        <span className="text-xs">remaining</span>
      )}
    </div>
  );
}