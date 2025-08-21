import mongoose from 'mongoose';

const PricingSchema = new mongoose.Schema(
  {
    startingPrice: { type: Number },
    currency: { type: String, default: 'USD' },
    paymentPlans: [{ type: String }]
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['residential', 'commercial', 'mixed-use'], required: true },
    status: { type: String, enum: ['upcoming', 'under construction', 'ready for handover', 'completed'], required: true },
    description: { type: String },
    features: [{ type: String }],
    pricing: { type: PricingSchema },
    images: [{ type: String }],
    websiteUrl: { type: String },
    brochureUrl: { type: String },
    timeline: { type: String }
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);


