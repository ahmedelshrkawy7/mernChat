// App.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Connect to the Socket.IO server
  useEffect(() => {
    const newSocket = io("http://localhost:7000"); // Replace with your server's address
    setSocket(newSocket);
    newSocket.emit("join-room", {
      room_id: 53,
      user_id: "11",
      receiverId: "55",
    });

    fetch("http://localhost:1023/products", {
      method: "POSt",
    })
      .then((res) => res.json())
      .then((res) => console.log(res));

    // Clean up the connection when the component unmounts
    return () => newSocket.close();
  }, []);

  // Listen for messages from the server
  useEffect(() => {
    console.log("first");

    if (socket) {
      socket.on("new-message", (msg) => {
        console.log("🚀 ~ socket.on ~ msg:", msg);
        console.log("first");
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && message) {
      socket.emit("new-message", {
        message,
        roomId: 1,
        user_id: "11",
        receiverId: "55",
      });
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <div>
      <h1>Socket.IO React Chat</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
