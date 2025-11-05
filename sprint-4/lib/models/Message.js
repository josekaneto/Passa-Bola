import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Mensagem muito longa']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ teamId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;

