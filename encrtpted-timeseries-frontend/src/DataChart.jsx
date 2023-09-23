// DataChart.js
import React from "react";
import { Bar } from "react-chartjs-2";

const DataChart = ({ dataStream }) => {
  const data = {
    labels: dataStream.map((data, index) => `Data ${index + 1}`),
    datasets: [
      {
        label: "Success Rate",
        data: dataStream.map((_, index) => (index + 1) * 10), // Modify this based on your data
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div>
      <h2>Data Visualization</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DataChart;
