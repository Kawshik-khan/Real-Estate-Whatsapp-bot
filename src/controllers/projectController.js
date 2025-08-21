import { Project } from '../models/Project.js';
import { sendTextMessage, sendInteractiveList, sendInteractiveButtons, sendMediaCarousel } from '../services/whatsappService.js';
import { listProjectsTemplate, projectDetailsTemplate, pricingTemplate, getMainMenuList } from '../services/messageTemplates.js';

export const handleProjectFlow = {
  async list(customer, _message) {
    const projects = await Project.find({}).limit(50).lean();
    const summary = listProjectsTemplate(projects);
    await sendTextMessage(customer.phone, summary.header);
    await sendInteractiveList(customer.phone, summary.interactiveList);
  },

  async details(customer, projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) {
      await sendTextMessage(customer.phone, 'Project not found.');
      await sendInteractiveList(customer.phone, getMainMenuList());
      return;
    }

    const card = projectDetailsTemplate(project);
    await sendTextMessage(customer.phone, card.text);

    if (project.images && project.images.length > 0) {
      await sendMediaCarousel(customer.phone, project.images);
    }

    await sendInteractiveButtons(customer.phone, {
      header: project.name,
      body: 'Choose an action',
      buttons: [
        { id: `open_${project._id}`, title: 'Open Website' },
        { id: `pricing_${project._id}`, title: 'Pricing' },
        { id: 'back_menu', title: 'Back to Menu' }
      ]
    });
  },

  async pricing(customer, _message) {
    const text = pricingTemplate();
    await sendTextMessage(customer.phone, text);
    await sendInteractiveButtons(customer.phone, {
      header: 'Next steps',
      body: 'Would you like a brochure or schedule a site visit?',
      buttons: [
        { id: 'request_brochure', title: 'Request Brochure' },
        { id: 'schedule_visit', title: 'Schedule Visit' },
        { id: 'back_menu', title: 'Back to Menu' }
      ]
    });
  },

  async route(customer, message, sessionKey, conversationStates) {
    const text = (message.text || '').trim().toLowerCase();
    const choiceId = message.interactiveId || '';

    if (choiceId.startsWith('project_')) {
      const id = choiceId.replace('project_', '');
      return this.details(customer, id);
    }
    if (choiceId.startsWith('pricing_')) {
      return this.pricing(customer, message);
    }
    if (choiceId.startsWith('open_')) {
      const id = choiceId.replace('open_', '');
      const project = await Project.findById(id).lean();
      if (project?.websiteUrl) {
        await sendTextMessage(customer.phone, `Website: ${project.websiteUrl}`);
      }
      return;
    }

    if (text.startsWith('project ')) {
      const id = text.split(' ')[1];
      return this.details(customer, id);
    }
    if (text === 'back' || text === 'menu' || text === 'main' || choiceId === 'back_menu') {
      await sendInteractiveList(customer.phone, getMainMenuList());
      return;
    }

    // Default: re-show list
    return this.list(customer, message);
  }
};


