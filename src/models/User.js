const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        // Check if date is not in the future
        return value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  }
}, {
  timestamps: true
});

// Create unique index on email
userSchema.index({ email: 1 }, { unique: true });

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to check if today is user's birthday
userSchema.methods.isBirthdayToday = function() {
  const today = new Date();
  const birthDate = new Date(this.dob);
  
  return today.getMonth() === birthDate.getMonth() && 
         today.getDate() === birthDate.getDate();
};

module.exports = mongoose.model('User', userSchema);
