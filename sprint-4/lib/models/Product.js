import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Product Information
  nome: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0.01, 'Preço deve ser maior que zero']
  },
  
  // Product Details
  imagem: {
    type: String,
    required: [true, 'Imagem é obrigatória']
  },
  
  imagens: [{
    type: String
  }],
  
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: {
      values: [
        'Camisas',
        'Chuteiras', 
        'Acessórios',
        'Equipamentos',
        'Lembranças',
        'Outros'
      ],
      message: 'Categoria inválida'
    }
  },
  
  // Size and Variants
  tamanhos: [{
    type: String,
    enum: ['PP', 'P', 'M', 'G', 'GG', 'XG', '34', '35', '36', '37', '38', '39', '40', '41', '42', 'Infantil', 'Adulto']
  }],
  
  cores: [{
    nome: String,
    codigo: String
  }],
  
  // Inventory
  estoque: {
    type: Number,
    default: 0,
    min: [0, 'Estoque não pode ser negativo']
  },
  
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Product Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isNewProduct: {
    type: Boolean,
    default: false
  },
  
  // SEO and Marketing
  tags: [{
    type: String,
    trim: true
  }],
  
  peso: {
    type: Number,
    min: [0, 'Peso não pode ser negativo']
  },
  
  dimensoes: {
    altura: Number,
    largura: Number,
    profundidade: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.disponivel = ret.estoque > 0;
      return ret;
    }
  }
});

// Virtual for availability
productSchema.virtual('disponivel').get(function() {
  return this.estoque > 0;
});

// Virtual for formatted price
productSchema.virtual('precoFormatado').get(function() {
  return `R$ ${this.preco.toFixed(2).replace('.', ',')}`;
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.categoria.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
