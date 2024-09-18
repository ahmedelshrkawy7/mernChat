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
      room_id: 12,
      senderId: "11",
      receiverId: "55",
    });

    // Clean up the connection when the component unmounts
    return () => newSocket.close();
  }, []);

  // Listen for messages from the server
  // useEffect(() => {
  //   if (socket) {
  //     socket.on("message", (msg) => {
  //       setMessages((prevMessages) => [...prevMessages, msg]);
  //     });
  //   }
  // }, [socket]);

  const sendMessage = () => {
    if (socket && message) {
      socket.emit("sendMessage", {
        message,
        roomId: 1,
        senderId: "11",
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
