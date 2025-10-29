import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
    min: 1
  },
  
  tamanho: {
    type: String,
    default: null
  },
  
  cor: {
    type: String,
    default: null
  },
  
  imagem: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  // Order Information
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Customer Information
  customerInfo: {
    nomeCompleto: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    telefone: {
      type: String,
      required: true
    }
  },
  
  // Shipping Information
  shippingAddress: {
    rua: {
      type: String,
      required: true
    },
    numero: {
      type: String,
      required: true
    },
    complemento: {
      type: String,
      default: ''
    },
    bairro: {
      type: String,
      required: true
    },
    cidade: {
      type: String,
      required: true
    },
    estado: {
      type: String,
      required: true
    },
    cep: {
      type: String,
      required: true
    }
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Coupon Information
  couponCode: {
    type: String,
    default: null
  },
  
  couponDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'pix', 'boleto'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentId: {
    type: String,
    default: null
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Tracking
  trackingNumber: {
    type: String,
    default: null
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [500, 'Notas não podem ter mais de 500 caracteres']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Delivery
  estimatedDelivery: {
    type: Date,
    default: null
  },
  
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.itemCount = ret.items ? ret.items.reduce((sum, item) => sum + item.quantidade, 0) : 0;
      return ret;
    }
  }
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.reduce((sum, item) => sum + item.quantidade, 0) : 0;
});

// Virtual for formatted total
orderSchema.virtual('totalFormatado').get(function() {
  return `R$ ${this.total.toFixed(2).replace('.', ',')}`;
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `PAB-${timestamp.slice(-6)}-${random}`;
  }
  next();
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    this.total = this.subtotal - this.discount - this.couponDiscount + this.shippingCost;
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
