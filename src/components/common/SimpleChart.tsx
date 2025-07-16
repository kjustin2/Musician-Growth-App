import React from 'react';
import './SimpleChart.css';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'bar' | 'line';
  height?: number;
  showValues?: boolean;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  title, 
  type = 'bar', 
  height = 200,
  showValues = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="simple-chart empty">
        <h4>{title}</h4>
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = height - 60; // Account for title and labels

  return (
    <div className="simple-chart">
      <h4 className="chart-title">{title}</h4>
      
      <div className="chart-container" style={{ height: `${height}px` }}>
        <div className="chart-content" style={{ height: `${chartHeight}px` }}>
          {type === 'bar' ? (
            <div className="bar-chart">
              {data.map((point, index) => (
                <div key={index} className="bar-item">
                  <div 
                    className="bar"
                    style={{ 
                      height: `${(point.value / maxValue) * chartHeight}px`,
                      backgroundColor: point.color || '#007bff'
                    }}
                  >
                    {showValues && (
                      <span className="bar-value">{point.value}</span>
                    )}
                  </div>
                  <span className="bar-label">{point.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="line-chart">
              <svg width="100%" height="100%">
                {data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - (point.value / maxValue) * 100;
                  
                  return (
                    <g key={index}>
                      {index > 0 && (
                        <line
                          x1={`${((index - 1) / (data.length - 1)) * 100}%`}
                          y1={`${100 - (data[index - 1]?.value || 0) / maxValue * 100}%`}
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="#007bff"
                          strokeWidth="2"
                        />
                      )}
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#007bff"
                      />
                      {showValues && (
                        <text
                          x={`${x}%`}
                          y={`${y - 5}%`}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#333"
                        >
                          {point.value}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="line-labels">
                {data.map((point, index) => (
                  <span key={index} className="line-label">
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;