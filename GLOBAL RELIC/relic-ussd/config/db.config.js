const mongoose = require("mongoose")

async function connectDB() {
    try {
        await mongoose.connect(process.env.DEV_MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Database connected!!")
    }catch (error) {
        console.error(error)
    } 
}

connectDB()