import Message from "../models/message.model.js";

export const sendMessage = (req, res) => {
  const { message } = req.body;
  try {
    Message.create({
      message,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "internal server error",
    });
  }
};
