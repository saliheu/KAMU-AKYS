import React from 'react';
import { Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { OccupancyData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OccupancyChartProps {
  data: OccupancyData[];
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  const hospitalData = data.reduce((acc, item) => {
    const hospitalName = item.hospital.name;
    if (!acc[hospitalName]) {
      acc[hospitalName] = {
        totalBeds: 0,
        occupiedBeds: 0,
      };
    }
    acc[hospitalName].totalBeds += item.occupancy.totalBeds;
    acc[hospitalName].occupiedBeds += item.occupancy.occupiedBeds;
    return acc;
  }, {} as Record<string, { totalBeds: number; occupiedBeds: number }>);

  const hospitals = Object.keys(hospitalData).slice(0, 10);
  const occupancyRates = hospitals.map((hospital) => {
    const { totalBeds, occupiedBeds } = hospitalData[hospital];
    return totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  });

  const chartData = {
    labels: hospitals,
    datasets: [
      {
        label: 'Doluluk Oranı (%)',
        data: occupancyRates,
        backgroundColor: occupancyRates.map((rate) => {
          if (rate >= 90) return 'rgba(244, 67, 54, 0.8)';
          if (rate >= 75) return 'rgba(255, 152, 0, 0.8)';
          return 'rgba(76, 175, 80, 0.8)';
        }),
        borderColor: occupancyRates.map((rate) => {
          if (rate >= 90) return 'rgb(244, 67, 54)';
          if (rate >= 75) return 'rgb(255, 152, 0)';
          return 'rgb(76, 175, 80)';
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Doluluk: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <Box sx={{ height: 300 }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default OccupancyChart;