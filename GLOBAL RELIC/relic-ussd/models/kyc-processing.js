const mongoose = require('mongoose')

const { Schema } = mongoose

const kycprocessingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    documentType: { type: Schema.Types.ObjectId, required: true, ref: 'KycDocumentType' },
    job_type: { type: String, required: true },
    job_status: { type: String, required: true, default: 'pending' },
    payload: { type: JSON},
    responseMessage: { type: String },
    createdAt: { type: Date, default: Date.now }
},{
    timestamps: true
})

module.exports = mongoose.model('KycProcessing', kycprocessingSchema)
