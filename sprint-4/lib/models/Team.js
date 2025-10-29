import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  // Basic Team Information
  nome: {
    type: String,
    required: [true, 'Nome do time é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome do time não pode ter mais de 50 caracteres'],
    unique: true
  },
  
  descricao: {
    type: String,
    required: [true, 'Descrição do time é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  
  // Visual Identity
  cor1: {
    type: String,
    required: [true, 'Cor principal é obrigatória'],
    match: [/^#[0-9A-F]{6}$/i, 'Formato de cor inválido']
  },
  
  cor2: {
    type: String,
    required: [true, 'Cor secundária é obrigatória'],
    match: [/^#[0-9A-F]{6}$/i, 'Formato de cor inválido']
  },
  
  imagem: {
    type: String,
    default: '/time-feminino.png'
  },
  
  // Team Management
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Capitã do time é obrigatória']
  },
  
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    position: {
      type: String,
      required: true
    },
    jerseyNumber: {
      type: Number,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  maxMembers: {
    type: Number,
    default: 15,
    min: [5, 'Time deve ter pelo menos 5 jogadoras'],
    max: [20, 'Time não pode ter mais de 20 jogadoras']
  },
  
  // Tournament Information
  isRegistered: {
    type: Boolean,
    default: false
  },
  
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null
  },
  
  // Team Stats
  wins: {
    type: Number,
    default: 0
  },
  
  losses: {
    type: Number,
    default: 0
  },
  
  draws: {
    type: Number,
    default: 0
  },
  
  goalsFor: {
    type: Number,
    default: 0
  },
  
  goalsAgainst: {
    type: Number,
    default: 0
  },
  
  points: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
      ret.memberCount = ret.members ? ret.members.length : 0;
      return ret;
    }
  }
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Check if team is full
teamSchema.virtual('isFull').get(function() {
  return this.members && this.members.length >= this.maxMembers;
});

// Update timestamp on save
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add member to team
teamSchema.methods.addMember = function(userId, position, jerseyNumber) {
  if (this.isFull) {
    throw new Error('Time está completo');
  }
  
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('Jogadora já está no time');
  }
  
  this.members.push({
    userId,
    position,
    jerseyNumber
  });
  
  return this.save();
};

// Remove member from team
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team;
