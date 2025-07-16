import React from 'react';
import './SimpleChart.css';

interface ProgressRingProps {
  value: number;
  maxValue: number;
  label: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  maxValue,
  label,
  color = '#007bff',
  size = 120,
  strokeWidth = 8
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference - (progress * circumference);
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div 
      className="progress-ring" 
      style={{ 
        '--progress-ring-size': `${size}px`,
        width: size, 
        height: size,
        maxWidth: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      } as React.CSSProperties}
    >
      <svg 
        className="progress-ring-svg"
        width={size}
        height={size}
        style={{
          display: 'block',
          maxWidth: `${size}px`,
          maxHeight: `${size}px`
        }}
      >
        <circle
          className="progress-ring-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="progress-ring-text">
        <p className="progress-ring-value">{percentage}%</p>
        <p className="progress-ring-label">{label}</p>
      </div>
    </div>
  );
};

export default ProgressRing;