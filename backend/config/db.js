const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it in Render environment variables.");
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      'Invalid MONGO_URI. It must start with "mongodb://" or "mongodb+srv://".'
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
};

module.exports = connectDB;
