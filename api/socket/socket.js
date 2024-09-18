import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join-room", async ({ message, senderId, receiverId, room_id }) => {
    console.log("🚀 ~ socket.on ~ room_id:", room_id);
    socket.join(room_id);
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    socket.on("sendMessage", async ({ message, senderId, receiverId }) => {
      console.log("🚀 ~ socket.on ~ message:", message);
      try {
        const newMessage = new Message({
          senderId,
          receiverId,
          message,
        });

        if (newMessage) {
          conversation.messages.push(newMessage._id);
        }

        // await conversation.save();
        // await newMessage.save();

        // this will run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        // SOCKET IO FUNCTIONALITY WILL GO HERE

        io.to(room_id).emit("newMessage", newMessage);
      } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
      }
    });

    socket.on("leave-room", () => {
      socket.leave(room_id);
      console.log("leaving room " + room_id);
    });
  });

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
