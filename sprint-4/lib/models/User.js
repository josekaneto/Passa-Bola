import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  nomeCompleto: {
    type: String,
    required: true,
    trim: true
  },
  
  dataNascimento: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Football Information
  nomeCamisa: {
    type: String,
    required: true,
    trim: true
  },
  
  numeroCamisa: {
    type: Number,
    required: true
  },
  
  altura: {
    type: Number,
    required: true
  },
  
  peso: {
    type: Number,
    required: true
  },
  
  posicao: {
    type: String,
    required: true,
    trim: true
  },
  
  pernaDominante: {
    type: String,
    required: true,
    enum: ['Direita', 'Esquerda']
  },
  
  // Authentication
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: '/fotoDePerfil.png'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Team Information
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  
  isTeamCaptain: {
    type: Boolean,
    default: false
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
      delete ret.senha;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.senha);
};

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
