const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384'
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
