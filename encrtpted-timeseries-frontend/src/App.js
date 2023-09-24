// Import necessary React hooks and libraries
import React, { useState, useEffect } from "react";

// Import the Socket.io client library
import io from "socket.io-client";

// Create a WebSocket connection to the server
const socket = io("https://encrypt-ou7n.onrender.com/", {
  transports: ["websocket"]
});

// Define the main React component
const App = () => {
  // Define state variables using the useState hook
  const [dataStream, setDataStream] = useState([]); // Store received data
  const [successRate, setSuccessRate] = useState(0); // Calculate success rate
  const [countdown, setCountdown] = useState(10); // Display countdown timer

  // useEffect hook to set up event listeners when the component mounts
  useEffect(() => {
    // Event listeners for WebSocket connections
    const handleMsg = (data) => {
      // console.log(data);
      console.log("Connected to WebSocket");
    };

    const handleError = (error) => {
      console.error("WebSocket connection error:", error);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from WebSocket");
    };

    const handleEncrypted = (data) => {
      // Emit a "listen_request" event to the server with received data
      socket.emit("listen_request", data);
      console.log("useeffect", data);
    };

    const handleDecoded = (data) => {
      console.log(data);
      // Update the dataStream state with the received data
      setDataStream((prev) => [...prev, data]);
    };

    // Attach event listeners to WebSocket events
    socket.on("msg", handleMsg);
    socket.on("connect_error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("encrypted", handleEncrypted);
    socket.on("decoded", handleDecoded);

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("msg", handleMsg);
      socket.off("connect_error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("encrypted", handleEncrypted);
      socket.off("decoded", handleDecoded);
    };
  }, []); // The empty dependency array means this effect runs only once, on mount

  // useEffect hook to calculate success rate based on dataStream length
  useEffect(() => {
    const newSuccessRate = dataStream.length > 0 ? 100 : 0;
    setSuccessRate(newSuccessRate);
  }, [dataStream]);

  // useEffect hook to set up a countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          return 10;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, [countdown]);

  // Render the component JSX
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white min-h-screen p-6">
      <h1 className="text-center text-3xl md:text-5xl font-bold mb-4">
        Data Display
      </h1>
      <div className="flex justify-between items-center mb-4">
        <p className="text-green-400 font-bold">
          Success Rate:{" "}
          <span
            className={`text-sm md:text-lg mb-2 ml-5 ${
              successRate >= 90
                ? "text-green-400"
                : successRate >= 70
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {successRate}%
          </span>
        </p>

        <p className="text-sm md:text-lg mb-2 text-blue-400 font-bold">
          Next Update in:{" "}
          <span
            className={`${
              countdown <= 3 ? "text-red-500" : "text-green-500"
            } text-2xl font-bold`}
          >
            {countdown}s
          </span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="px-6 py-4">S. No.</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">From</th>
              <th className="px-6 py-4">To</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {/* Map and render received data in table rows */}
            {dataStream.map((user, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-gray-600" : "bg-gray-700"}
              >
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.origin}</td>
                <td className="px-6 py-4">{user.destination}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Export the App component as the default export
export default App;
