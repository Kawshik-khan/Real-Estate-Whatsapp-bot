import dotenv from 'dotenv';
import { connectToDatabase } from '../src/config/database.js';
import { Project } from '../src/models/Project.js';

dotenv.config();

async function main() {
  await connectToDatabase();
  await Project.deleteMany({});

  const docs = [
    {
      name: 'Skyline Residences',
      location: 'Uptown',
      type: 'residential',
      status: 'under construction',
      description: 'Premium apartments with city views',
      features: ['Infinity Pool', 'Gym', '24/7 Security', 'Rooftop Garden'],
      pricing: { startingPrice: 120000, currency: 'USD', paymentPlans: ['30/70', '40/60'] },
      images: [
        'https://images.unsplash.com/photo-1501183638710-841dd1904471',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
      ],
      websiteUrl: 'https://yourcompany.com/projects/skyline',
      brochureUrl: 'https://yourcompany.com/brochures/skyline.pdf',
      timeline: 'Completion Q4 2026'
    },
    {
      name: 'Harbor Plaza',
      location: 'Waterfront',
      type: 'commercial',
      status: 'ready for handover',
      description: 'Grade-A office spaces',
      features: ['LEED Gold', 'Smart Access', 'Cafeteria'],
      pricing: { startingPrice: 250000, currency: 'USD', paymentPlans: ['50/50'] },
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'
      ],
      websiteUrl: 'https://yourcompany.com/projects/harbor-plaza',
      brochureUrl: 'https://yourcompany.com/brochures/harbor-plaza.pdf',
      timeline: 'Completed 2024'
    }
  ];

  await Project.insertMany(docs);
  // eslint-disable-next-line no-console
  console.log('Seed completed.');
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


