import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    contractId: {
      type: Number, // Assuming contract_id is a number
    },
    roomId: {
      type: Number, // Assuming room_id is a number
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video"], // You can adjust the types as needed
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
