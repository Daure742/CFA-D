// models/User.js - Utilisateur de la plateforme (ÉTUDIANT, FORMATEUR, ADMIN)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'formateur', 'etudiant', 'tuteur', 'entreprise'],
      default: 'etudiant'
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    refreshToken: String,

    // Contact / verification
    telephone: { type: String, trim: true },
    phoneVerified: { type: Boolean, default: false },

    // Champs spécifiques ÉTUDIANT
    formationChoisie: String,
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte' },

    // Champs spécifiques FORMATEUR
    matieres: [{ type: String }],

    // Account flags
    isOnLeave: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,

    // Status workflow
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'active',
      description: 'Status workflow for waitlisted users: pending -> active'
    },

    // Réinitialisation mot de passe (tokens pour reset via email)
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Temporary code for password change / verification (SMS or email)
    passwordChangeCode: String,
    passwordChangeExpires: Date,

    // Notification preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Index pour les recherches
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
});

// Méthode de comparaison des mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);
