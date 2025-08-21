export function getWelcomeMessage() {
  return [
    '👋 Welcome to our Real Estate Concierge!',
    'We help you find premium residential, commercial, and mixed-use properties.',
    'How can we assist you today?'
  ].join('\n');
}

export function getMainMenuList() {
  return {
    header: 'Main Menu',
    body: 'Please choose an option:',
    sections: [
      {
        title: 'Explore',
        rows: [
          { id: 'company_info', title: '1) Company Information' },
          { id: 'projects', title: '2) Browse Projects' },
          { id: 'pricing', title: '3) Pricing & Offers' }
        ]
      }
    ]
  };
}

export function companyInfoTemplate() {
  return {
    website: process.env.COMPANY_WEBSITE || 'https://example.com',
    facebook: process.env.FACEBOOK_PAGE || 'https://facebook.com/example',
    hotline: process.env.HOTLINE_NUMBER || '+1000000000',
    hours: process.env.BUSINESS_HOURS || 'Sun-Thu 9:00-18:00, Fri-Sat Closed',
    address: process.env.COMPANY_ADDRESS || '123 Main Street, City, Country'
  };
}

export function listProjectsTemplate(projects) {
  const total = projects.length;
  const header = `We currently have ${total} projects. Browse below:`;
  const rows = projects.slice(0, 20).map((p) => ({
    id: `project_${p._id}`,
    title: `${p.name} • ${p.location}`,
    description: `${p.type} • ${p.status}`
  }));
  return {
    header,
    interactiveList: {
      header: 'Projects',
      body: 'Select a project to view details',
      sections: [{ title: 'Projects', rows }]
    }
  };
}

export function projectDetailsTemplate(project) {
  const features = (project.features || []).slice(0, 6).join(', ');
  const text = [
    `🏗️ ${project.name} — ${project.location}`,
    `Type: ${project.type} | Status: ${project.status}`,
    `Highlights: ${features || 'N/A'}`,
    `Timeline: ${project.timeline || 'See website for details'}`,
    project.websiteUrl ? `Website: ${project.websiteUrl}` : ''
  ].filter(Boolean).join('\n');
  return { text };
}

export function pricingTemplate() {
  return [
    '💰 Pricing & Financing Options',
    '• Starting prices vary by project',
    '• Flexible payment plans available',
    '• Financing options via partner banks',
    'Reply "brochure" for a detailed brochure or "visit" to schedule a site tour.'
  ].join('\n');
}


