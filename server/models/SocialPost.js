const mongoose = require('mongoose');

const SocialPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true }, // Texto corto [cite: 30]
  imageUrl: { type: String }, // Foto opcional [cite: 30]
  likes: { type: Number, default: 0 }, // Contador simple [cite: 32]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SocialPost', SocialPostSchema);