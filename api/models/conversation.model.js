import mongoose from "mongoose";

const conversatoinSchema = mongoose.Schema(
  {
    participants: [
      {
        type: String,
        ref: "User",
      },
    ],
    messages: [
      {
        type: String,
        ref: "Message",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversatoinSchema);

export default Conversation;
