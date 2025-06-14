import mongoose from 'mongoose'

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    workerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    tokens: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);

export default Worker;