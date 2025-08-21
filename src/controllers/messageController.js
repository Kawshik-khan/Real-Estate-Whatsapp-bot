import { verifyWebhookToken, extractIncomingMessage } from '../services/whatsappService.js';
import { getWelcomeMessage, getMainMenuList, companyInfoTemplate } from '../services/messageTemplates.js';
import { sendTextMessage, sendInteractiveList } from '../services/whatsappService.js';
import { upsertCustomerFromPayload } from '../services/customerService.js';
import { handleCompanyInfoFlow } from './companyController.js';
import { handleProjectFlow } from './projectController.js';
import { redisClient } from '../config/redis.js';

const conversationStates = {
  WELCOME: 'welcome',
  MAIN_MENU: 'main_menu',
  COMPANY_INFO: 'company_info',
  PROJECT_LIST: 'project_list',
  PROJECT_DETAILS: 'project_details',
  PRICING_INQUIRY: 'pricing_inquiry'
};

export async function validateWebhook(req, res) {
  try {
    const challenge = verifyWebhookToken(req);
    if (challenge) return res.status(200).send(challenge);
    return res.sendStatus(403);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function handleIncomingMessage(req, res) {
  try {
    const message = extractIncomingMessage(req.body);
    if (!message) return res.sendStatus(200);

    // Persist customer and conversation
    const customer = await upsertCustomerFromPayload(message);
    const sessionKey = `session:${customer.phone}`;
    const sessionState = (await redisClient.get(sessionKey)) || conversationStates.WELCOME;
    const choiceId = message.interactiveId || null;

    // First touch -> welcome and main menu
    if (sessionState === conversationStates.WELCOME) {
      await sendTextMessage(customer.phone, getWelcomeMessage());
      await sendInteractiveList(customer.phone, getMainMenuList());
      await redisClient.set(sessionKey, conversationStates.MAIN_MENU, 'EX', 60 * 30);
      return res.sendStatus(200);
    }

    // Route according to session and user input
    const text = (message.text || '').trim().toLowerCase();

    // Quick keyword shortcuts
    if (['menu', 'main', 'start', 'back'].includes(text)) {
      await sendInteractiveList(customer.phone, getMainMenuList());
      await redisClient.set(sessionKey, conversationStates.MAIN_MENU, 'EX', 60 * 30);
      return res.sendStatus(200);
    }

    // From main menu selection
    if (sessionState === conversationStates.MAIN_MENU) {
      if (choiceId === 'company_info' || ['1', 'company', 'info'].includes(text)) {
        await redisClient.set(sessionKey, conversationStates.COMPANY_INFO, 'EX', 60 * 30);
        await handleCompanyInfoFlow(customer, message);
        return res.sendStatus(200);
      }
      if (choiceId === 'projects' || ['2', 'projects', 'project'].includes(text)) {
        await redisClient.set(sessionKey, conversationStates.PROJECT_LIST, 'EX', 60 * 30);
        await handleProjectFlow.list(customer, message);
        return res.sendStatus(200);
      }
      if (choiceId === 'pricing' || ['3', 'pricing', 'price'].includes(text)) {
        await redisClient.set(sessionKey, conversationStates.PRICING_INQUIRY, 'EX', 60 * 30);
        await handleProjectFlow.pricing(customer, message);
        return res.sendStatus(200);
      }
      // Fallback
      await sendTextMessage(customer.phone, 'Sorry, I did not recognize that. Please choose an option from the menu.');
      await sendInteractiveList(customer.phone, getMainMenuList());
      return res.sendStatus(200);
    }

    // Subflows
    if (sessionState === conversationStates.COMPANY_INFO) {
      if (choiceId === 'open_website') {
        const info = companyInfoTemplate();
        await sendTextMessage(customer.phone, `Website: ${info.website}`);
        await sendInteractiveList(customer.phone, getMainMenuList());
        await redisClient.set(sessionKey, conversationStates.MAIN_MENU, 'EX', 60 * 30);
        return res.sendStatus(200);
      }
      if (choiceId === 'view_projects') {
        await redisClient.set(sessionKey, conversationStates.PROJECT_LIST, 'EX', 60 * 30);
        await handleProjectFlow.list(customer, message);
        return res.sendStatus(200);
      }
      if (choiceId === 'back_menu') {
        await sendInteractiveList(customer.phone, getMainMenuList());
        await redisClient.set(sessionKey, conversationStates.MAIN_MENU, 'EX', 60 * 30);
        return res.sendStatus(200);
      }
      await handleCompanyInfoFlow(customer, message);
      return res.sendStatus(200);
    }
    if (sessionState === conversationStates.PROJECT_LIST || sessionState === conversationStates.PROJECT_DETAILS || sessionState === conversationStates.PRICING_INQUIRY) {
      await handleProjectFlow.route(customer, message, sessionKey, conversationStates);
      return res.sendStatus(200);
    }

    // Default fallback
    await sendInteractiveList(customer.phone, getMainMenuList());
    await redisClient.set(sessionKey, conversationStates.MAIN_MENU, 'EX', 60 * 30);
    return res.sendStatus(200);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook handling error:', err);
    return res.sendStatus(200);
  }
}

export { conversationStates };


