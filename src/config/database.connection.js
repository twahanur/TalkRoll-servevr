import mongoose from "mongoose";

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
    // await mongoose.connect("mongodb+srv://DoctorThoha:Twahanur@cluster0.566ly.mongodb.net/Test?retryWrites=true&w=majority");
    console.log("Database connected successfully");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
  }
}

export default connectToDatabase;
