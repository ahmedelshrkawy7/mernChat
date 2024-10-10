import moment from "moment";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      id: {
        type: Number,
      },
      image_url: {
        type: String,
        default:
          "https://plus10v2.alexondev.net/assets/images/users/default.jpg",
      },
    },
    message: {
      type: String,
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
      // enum: ["text", "image", "video"], // You can adjust the types as needed
      default: "text",
    },
    file: {
      file_url: {
        type: String, // Store the URL or path of the uploaded file
      },
      file_type: {
        type: String, // E.g., "image" or "video"
      },
      file_mimes_type: {
        type: String, // E.g., "image/webp", "video/mp4"
      },
      file_size: {
        type: String, // E.g., "10.23 KB"
      },
      file_name: {
        type: String, // E.g., "example.webp"
      },
    },
    time: {
      timestamp: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000), // Current time in seconds since Unix epoch
      },
      formatted: {
        type: String,
        default: () => moment().format("MMM D, YYYY | h:mm A"), // Format the time
      },
    },
  }
  // { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
