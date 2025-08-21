import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    customerPhone: { type: String, index: true },
    state: { type: String },
    lastMessage: { type: String }
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', ConversationSchema);


