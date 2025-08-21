import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String, required: true, index: true, unique: true },
    email: { type: String },
    preferences: {
      locations: [{ type: String }],
      types: [{ type: String }],
      budgetRange: { min: Number, max: Number }
    },
    flags: {
      highIntent: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customer', CustomerSchema);


