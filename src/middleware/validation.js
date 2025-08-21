import Joi from 'joi';

export function validateMetaWebhook(req, res, next) {
  const schema = Joi.object({ object: Joi.string().valid('whatsapp_business_account').required() });
  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) return res.status(400).json({ error: 'Invalid webhook payload' });
  return next();
}


