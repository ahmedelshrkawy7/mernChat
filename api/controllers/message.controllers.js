import Message from "../models/message.model.js";
import getConv from "./getConv.js";

import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// https://plus10v2.alexondev.net/api/chat/message?contract_id=7

export const sendMessage = async (req, res) => {
  try {
    const { contract_id } = req.query;
    const x = await getConv(JSON.parse(contract_id));
    console.log("🚀 ~ sendMessage ~ x:", x);
    console.log("🚀 ~ sendMessage ~ contract_id:", contract_id);

    res.status(201).json({
      result: "success",
      code: 200,
      timestamp: "2024-09-19 08:32:50",
      message: "success",
      data: x,
    });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
