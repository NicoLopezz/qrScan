import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from: String,
    body: String,
    status: {
        type: String,
        enum: ['en espera', 'completado'],
        default: 'en espera',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
