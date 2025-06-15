import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['submitted', 'assigned', 'in-progress', 'resolved'],
        default: 'submitted'
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    complaintNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String
    },
    qrCode: {
        type: String
    },
    createdBy: {
        type: String,
        required: true
    },

    // to be assigned by the manager
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        unique: true
    }

}, {timestamps: true});


const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;