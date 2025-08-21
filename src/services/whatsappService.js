import axios from 'axios';

const baseUrl = 'https://graph.facebook.com/v20.0';
const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

export function verifyWebhookToken(req) {
  const mode = req.query['hub.mode'];
  const tokenParam = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && tokenParam === process.env.WEBHOOK_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export function extractIncomingMessage(body) {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message) return null;
    const from = message.from;
    const interactiveId = message.interactive?.list_reply?.id || message.interactive?.button_reply?.id || null;
    const text =
      message.interactive?.list_reply?.title ||
      message.interactive?.button_reply?.title ||
      message.text?.body ||
      message.button?.text ||
      '';
    return { from, text, interactiveId };
  } catch {
    return null;
  }
}

async function send(payload) {
  if (!token || !phoneNumberId) {
    // eslint-disable-next-line no-console
    console.warn('WhatsApp credentials missing; skipping send.');
    return;
  }
  await axios.post(`${baseUrl}/${phoneNumberId}/messages`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

export async function sendTextMessage(to, text) {
  return send({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  });
}

export async function sendInteractiveList(to, listData) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: listData.header },
      body: { text: listData.body },
      action: { sections: listData.sections, button: 'Choose' }
    }
  };
  return send(payload);
}

export async function sendInteractiveButtons(to, { header, body, buttons }) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: header },
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({ type: 'reply', reply: { id: b.id, title: b.title } }))
      }
    }
  };
  return send(payload);
}

export async function sendMediaCarousel(to, imageUrls) {
  // WhatsApp Cloud API does not support a single "carousel" call.
  // Send multiple image messages sequentially.
  for (const url of imageUrls.slice(0, 5)) {
    // eslint-disable-next-line no-await-in-loop
    await send({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: url }
    });
  }
}


