import React from 'react';

interface ChartData {
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartData[];
  type?: 'bar' | 'line' | 'pie';
  xField?: string;
  yField?: string;
  height?: number;
}

export function Chart({
  data,
  type = 'bar',
  xField = 'x',
  yField = 'y',
  height = 300
}: ChartProps) {
  // In a real application, you would use a chart library like recharts, Chart.js, or D3.js
  // This is just a placeholder showing how we might structure the component

  // Find the maximum value in the data for scaling
  const maxValue = Math.max(...data.map(item => Number(item[yField] || 0)));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <div className="text-center text-sm mb-2">
        {type.charAt(0).toUpperCase() + type.slice(1)} Chart
      </div>

      {type === 'bar' && (
        <div className="flex items-end h-[calc(100%-2rem)] w-full gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary rounded-t"
                style={{
                  height: `${item[yField] ? (Number(item[yField]) / maxValue) * 180 : 0}px`
                }}
              ></div>
              <div className="mt-2 text-xs truncate w-full text-center">
                {item[xField]}
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'line' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Line chart type is not implemented in this placeholder
          </p>
        </div>
      )}

      {type === 'pie' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Pie chart type is not implemented in this placeholder
          </p>
        </div>
      )}
    </div>
  );
}
