import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080", { transports: ["websocket"] });

const App = () => {
  const [dataStream, setDataStream] = useState([]);
  const [successRate, setSuccessRate] = useState(0);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    socket.on("msg", (data) => {
      console.log(data);
      console.log("Connected to WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    socket.on("dataStream", (data) => {
      const newData = data.split("|");
      const receivedDataCount = newData.length;
      const successRatePercentage = (receivedDataCount / 11) * 100;
      setSuccessRate(successRatePercentage.toFixed(2));
      setDataStream(newData);
    });

    // Set up a timer to update every 10 seconds
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
      if (countdown === 1) {
        setCountdown(10);
      }
    }, 1000);

    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, [countdown]);

  // Custom CSS classes for the timer
  const timerStyle = {
    fontSize: "4rem",
    fontFamily: "monospace",
    color: "#4CAF50", // Green color
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">Data Display</h1>
      <p className="text-lg mb-2">Success Rate: {successRate}%</p>
      <p className="text-lg mb-4">Next Update in:</p>
      <div style={timerStyle}>
        {countdown}s
      </div>
      <ul className="list-disc pl-6">
        {dataStream.map((data, index) => (
          <li
            key={index}
            className="bg-gray-800 text-blue-300 border border-gray-600 p-4 my-4 rounded-lg shadow-md transition-transform transform hover:scale-105 text-xs font-bold"
          >
            {data}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
