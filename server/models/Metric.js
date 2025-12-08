const mongoose = require('mongoose');

const PurchaseIntentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  interestedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now } // Fecha exacta del clic
});

module.exports = mongoose.model('PurchaseIntent', PurchaseIntentSchema);