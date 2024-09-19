import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import moment from "moment";

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
        });
      }
      socket.on("new-message", async ({ message, userId, receiverId }) => {
        console.log("🚀 ~ socket.on ~ message:", message);
        try {
          const newMessage = new Message({
            senderId: user_id,
            message,
            roomId: room_id,
          });

          if (newMessage) {
            conversation.messages.push(newMessage._id);
          }

          // await conversation.save();
          // await newMessage.save();

          Promise.all([conversation.save(), newMessage.save()]);

          // SOCKET IO FUNCTIONALITY WILL GO HERE

          //   {
          //     code = 201;
          //     data =     {
          //         message =         {
          //             "contract_id" = 53;
          //             id = 1314;
          //             message = hhhh;
          //             "message_type" = text;
          //             "room_id" = 27;
          //             sender =             {
          //                 id = 21;
          //                 "image_url" = "https://plus10v2.alexondev.net/storage/uploads/users/photos/1726688199download (1).jpeg";
          //             };
          //             status = "";
          //             time =             {
          //                 formatted = "Sep 19, 2024 | 7:18 AM";
          //                 timestamp = 1726730310;
          //             };
          //         };
          //     };
          //     message = success;
          //     result = success;
          //     timestamp = "2024-09-19 07:18:30";
          // }
          // const response = {
          //   code: 201,
          //   data: {
          //     message: {
          //       contract_id: newMessage.contractId,
          //       id: newMessage._id, // MongoDB document ID
          //       message,
          //       message_type: newMessage.messageType,
          //       room_id: newMessage.roomId,
          //       // sender: {
          //       //   id: sender._id, // Sender's ID
          //       //   image_url: sender.imageUrl || "default_image_url", // Replace with actual field
          //       // },
          //       status: "", // Add your own status logic here if needed
          //       time: {
          //         formatted: moment(newMessage.createdAt).format(
          //           "MMM D, YYYY | h:mm A"
          //         ), // Sep 19, 2024 | 7:18 AM
          //         // timestamp: Math.floor(newMessage.createdAt.getTime() / 1000), // Unix timestamp
          //       },
          //     },
          //   },
          //   message: "success",
          //   result: "success",
          //   timestamp: moment().format("YYYY-MM-DD HH:mm:ss"), // Current time
          // };

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
                // file: {
                //   file_url:
                //     "https://plus10v2.alexondev.net/storage/chat/17265713711.sm.webp", // Example file URL, replace with actual
                //   file_type: "image", // Example file type
                //   file_mimes_type: "webp", // Example MIME type
                //   file_size: "10.23 KB", // Example file size
                //   file_name: "1.sm.webp", // Example file name
                // },
                message_type: "text", // Assuming this is a message with a file
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
      });

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
