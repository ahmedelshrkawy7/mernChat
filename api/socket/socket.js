import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";

import moment from "moment";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on(
    "join-room",
    async ({ message, user_id, receiverId, room_id, ...data }) => {
      console.log("🚀 ~ socket.on ~ data:", data);
      console.log("🚀 ~ socket.on ~ receiverId:", receiverId);
      console.log("🚀 ~ socket.on ~ user_id:", user_id);
      console.log("🚀 ~ socket.on ~ message:", message);
      console.log("🚀 ~ socket.on ~ room_id:", room_id);
      socket.join(room_id);
      let conversation = await Conversation.findOne({
        participants: { $all: [user_id, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [user_id, receiverId],
          contract_id: room_id,
        });
      }
      socket.on(
        "new-message",
        async ({
          message,
          userId,
          receiverId,
          file_name,
          file,
          message_type = "text",
        }) => {
          console.log("🚀 ~ socket.on ~ message:", message);

          try {
            const newMessage = new Message({
              senderId: user_id,
              message,
              roomId: room_id,
              messageType: message_type,
            });

            if (message_type !== "text") {
              console.log("first");
              const imagePath = uuidv4() + "-" + file_name;

              // const writeStream = fs.createWriteStream(
              //   `uploads/${message_type}/${imagePath}`
              // );
              // writeStream.write(file, (err) => {
              //   if (err) {
              //     console.error("Error saving the file:", err);
              //   } else {
              //     console.log("File saved successfully:", file_name);
              //   }
              // });
              // writeStream.end();

              fs.writeFileSync(
                `uploads/${message_type}/${imagePath}`,
                file,
                (err) => {
                  if (err) {
                    console.error("Error saving the file:", err);
                  } else {
                    console.log("File saved successfully:", file_name);
                    // console.log("🚀 ~ newMessage:", newMessage);
                  }
                }
              );
              newMessage.file = {
                file_url: `https://server.alexonsolutions.net/${message_type}/${imagePath}`, // Example file URL, replace with actual
                file_type: message_type, // Example file type
                file_mimes_type: "webp", // Example MIME type
                file_size: "10.23 KB", // Example file size
                file_name: file_name, // Example file name
              };
            }

            if (newMessage) {
              console.log("🚀 ~ newMessage:", newMessage);
              conversation.messages.push(newMessage._id);
            }

            Promise.all([conversation.save(), newMessage.save()]);

            const response = {
              result: "success",
              code: 200,
              timestamp: moment().format("YYYY-MM-DD HH:mm:ss"), // Current time
              message: "success",
              data: {
                message: {
                  id: newMessage._id, // MongoDB document ID
                  message: newMessage.message, // Message content
                  status: "sent", // Update status as needed
                  file: newMessage.file,
                  message_type: newMessage.messageType, // Assuming this is a message with a file
                  contract_id: newMessage.roomId, // Contract ID from message
                  room_id: newMessage.roomId, // Room ID from message
                  sender: {
                    id: user_id, // Sender's ID
                    image_url:
                      newMessage?.imageUrl ||
                      "https://plus10v2.alexondev.net/assets/images/users/default.jpg", // Replace with actual image URL or default
                  },
                  time: {
                    timestamp: moment().format(), // Unix timestamp
                    formatted: moment(newMessage.createdAt).format(
                      "MMM D, YYYY | h:mm A"
                    ), // Formatted time
                  },
                },
              },
            };

            io.to(room_id).emit("new-message", response);
          } catch (error) {
            console.log("Error in sendMessage controller: ", error.message);
          }
        }
      );

      socket.on("leave-room", () => {
        socket.leave(room_id);
        console.log("leaving room " + room_id);
      });
    }
  );

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

// {
//   code = 201;
//   data =     {
//       message =         {
//           "contract_id" = 53;
//           id = 1314;
//           message = hhhh;
//           "message_type" = text;
//           "room_id" = 27;
//           sender =             {
//               id = 21;
//               "image_url" = "https://plus10v2.alexondev.net/storage/uploads/users/photos/1726688199download (1).jpeg";
//           };
//           status = "";
//           time =             {
//               formatted = "Sep 19, 2024 | 7:18 AM";
//               timestamp = 1726730310;
//           };
//       };
//   };
//   message = success;
//   result = success;
// time = "5.50"
// date = "2020/5/15"
//   timestamp = "2024-09-19 07:18:30";
// }
