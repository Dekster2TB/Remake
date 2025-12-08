const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true }, // [cite: 15]
  price: { type: Number, required: true }, // [cite: 16]
  description: { type: String }, // [cite: 17]
  imageUrl: { type: String, required: true }, // URL de Cloudinary [cite: 14]
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }, // Para mostrar el nombre del vendedor [cite: 23]
  createdAt: { type: Date, default: Date.now } // Para contar productos subidos [cite: 36]
});

module.exports = mongoose.model('Product', ProductSchema);