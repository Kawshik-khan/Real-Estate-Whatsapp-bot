import { sendTextMessage, sendInteractiveButtons } from '../services/whatsappService.js';
import { companyInfoTemplate } from '../services/messageTemplates.js';

export async function handleCompanyInfoFlow(customer, message) {
  const info = companyInfoTemplate();
  const parts = [
    `Our Website: ${info.website}`,
    `Facebook: ${info.facebook}`,
    `Hotline: ${info.hotline}`,
    `Business Hours: ${info.hours}`,
    `Location: ${info.address}`
  ];

  await sendTextMessage(customer.phone, parts.join('\n'));

  await sendInteractiveButtons(customer.phone, {
    header: 'Company Info',
    body: 'Would you like to visit our website or view projects?',
    buttons: [
      { id: 'open_website', title: 'Open Website' },
      { id: 'view_projects', title: 'View Projects' },
      { id: 'back_menu', title: 'Back to Menu' }
    ]
  });
}


