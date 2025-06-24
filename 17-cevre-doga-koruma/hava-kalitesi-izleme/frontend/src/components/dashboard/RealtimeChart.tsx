import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, FormControl, Select, MenuItem } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatPollutantName, getPollutantUnit } from '../../utils/aqi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RealtimeChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  title?: string;
  pollutant?: string;
  onPollutantChange?: (pollutant: string) => void;
  availablePollutants?: string[];
  height?: number;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({
  data,
  title = 'Gerçek Zamanlı Ölçümler',
  pollutant = 'pm25',
  onPollutantChange,
  availablePollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'],
  height = 300,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = getPollutantUnit(pollutant);
            return `${label}: ${value} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Zaman',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: `${formatPollutantName(pollutant)} (${getPollutantUnit(pollutant)})`,
        },
      },
    },
  };

  useEffect(() => {
    // Update chart when data changes
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {onPollutantChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={pollutant} onChange={(e) => onPollutantChange(e.target.value)}>
              {availablePollutants.map((p) => (
                <MenuItem key={p} value={p}>
                  {formatPollutantName(p)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box sx={{ height }}>
        <Line ref={chartRef} data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default RealtimeChart;