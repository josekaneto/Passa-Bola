import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  nome: {
    type: String,
    required: true
  },
  
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  
  quantidade: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
  tamanho: {
    type: String,
    default: null
  },
  
  imagem: {
    type: String,
    required: true
  },
  
  cartItemId: {
    type: String,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  items: [cartItemSchema],
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamp on save
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;

