import { Customer } from '../models/Customer.js';

export async function upsertCustomerFromPayload(message) {
  const phone = message.from;
  const update = { phone };
  const customer = await Customer.findOneAndUpdate({ phone }, update, {
    new: true,
    upsert: true
  });
  return customer.toObject();
}


