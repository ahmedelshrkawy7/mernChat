import Conversation from "../models/conversation.model.js";

async function getConversationByContractId(contract_id) {
  try {
    // Find the conversation by contract_id and populate the messages
    const conversation = await Conversation.findOne({ contract_id })
      .select("messages")
      .populate("messages")
      .lean()
      .exec();

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // id: newMessage._id, // MongoDB document ID
    // message: newMessage.message, // Message content
    // status: "sent", // Update status as needed
    // file: newMessage.file,
    // message_type: newMessage.messageType, // Assuming this is a message with a file
    // contract_id: newMessage.roomId, // Contract ID from message
    // room_id: newMessage.roomId, // Room ID from message
    conversation.messages = conversation.messages.map((message) => {
      return {
        id: message._id, // Replace _id with id
        message_type: message.message,
        status: "sent",
        message_type: message.messageType,
        file: message.file,
        time: message.time,
        contract_id: message.roomId,
        room_id: message.roomId,
        sender: message.sender,
      };
    });

    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error.message);
    throw error; // or handle the error as needed
  }
}

export default getConversationByContractId;

// {
//   "result": "success",
//   "code": 200,
//   "timestamp": "2024-09-22 08:00:46",
//   "message": "success",
//   "data": {
//       "messages": [
//           {
//               "id": 1270,
//               "message": "This is a test message",
//               "status": "sent",
//               "file": {
//                   "file_url": "https://plus10v2.alexondev.net/storage/chat/17265713711.sm.webp",
//                   "file_type": "image",
//                   "file_mimes_type": "webp",
//                   "file_size": "10.23 KB",
//                   "file_name": "1.sm.webp"
//               },
//               "message_type": "messageWithFile",
//               "contract_id": 7,
//               "room_id": 17,
//               "sender": {
//                   "id": 41,
//                   "image_url": "https://plus10v2.alexondev.net/assets/images/users/default.jpg"
//               },
//               "time": {
//                   "timestamp": 1726571371,
//                   "formatted": "Sep 17, 2024 | 11:09 AM"
//               }
//           },
//           {
//               "id": 1211,
//               "message": "Hello, world!",
//               "status": "sent",
//               "message_type": "text",
//               "contract_id": 7,
//               "room_id": 17,
//               "sender": {
//                   "id": 27,
//                   "image_url": "https://plus10v2.alexondev.net/assets/images/users/default.jpg"
//               },
//               "time": {
//                   "timestamp": 1725959362,
//                   "formatted": "Sep 10, 2024 | 9:09 AM"
//               }
//           }
// ]
// }
// }
