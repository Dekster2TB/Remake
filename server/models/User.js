const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // [cite: 10]
  email: { type: String, required: true, unique: true }, // [cite: 9]
  password: { type: String, required: true }, // [cite: 9]
  role: { 
    type: String, 
    enum: ['comprador', 'vendedor'], // [cite: 11]
    required: true 
  },
  createdAt: { type: Date, default: Date.now } // Para contar usuarios [cite: 35]
});

module.exports = mongoose.model('User', UserSchema);