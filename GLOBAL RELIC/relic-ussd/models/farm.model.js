const mongoose = require('mongoose')
const { Schema } = mongoose

const farmSchema = new Schema({
    farmName: { type: String, required: true },
    farmOwner: { type: String, required: true },
    farmLocation: { type: String, required: true },
    farmSize: { type: String, required: true },
    farmType: { type: Boolean, required: true }, // true = organic, false = inorganic
    farmDescription: { type: String, required: true },
    farmProduceType: { type: String, required: true },
})


module.exports = mongoose.model('Farm', farmSchema)