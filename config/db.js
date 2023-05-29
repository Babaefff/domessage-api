const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongoose baglandi ${conn.connection.host}`);
  } catch (error) {
    console.log(`error ${error.message}`)
    process.exit();
  }
};
module.exports = connectDB;