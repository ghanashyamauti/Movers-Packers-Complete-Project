const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

router.post('/message', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.json({ success: false, reply: 'Please type a message.' });

    const vehicles = await pool.query('SELECT * FROM vehicles WHERE is_active=true ORDER BY sort_order');
    const services = await pool.query('SELECT * FROM services WHERE is_active=true ORDER BY sort_order');
    const settingsRows = await pool.query('SELECT * FROM labour_settings');
    const settings = {};
    settingsRows.rows.forEach(s => { settings[s.setting_key] = parseFloat(s.setting_value); });

    const vehicleList = vehicles.rows.map(v =>
      `${v.name} (capacity: ${v.capacity_kg}kg, base fare: ₹${v.base_fare}, ₹${v.per_km_rate}/km)`
    ).join('\n');

    const serviceList = services.rows.map(s => `${s.name}`).join(', ');

    const prompt = `You are a helpful customer support assistant for Kalyani Packers and Movers. You ONLY answer questions related to Kalyani Packers and Movers business. If someone asks anything unrelated to moving, packing, services, pricing or booking, say "I can only help with questions about Kalyani Packers and Movers."

BUSINESS INFORMATION:
- Name: Kalyani Packers and Movers
- Phone & WhatsApp: +91 8975032310
- Email: kalyani@gmail.com
- Working Hours: Monday to Sunday, 8:00 AM to 8:00 PM
- Service Area: All India

OUR SERVICES: ${serviceList}

OUR VEHICLES:
${vehicleList}

PRICING:
- Minimum charge: ₹300 up to 4km
- 4 to 10 km: ₹300 + (distance - 4) x ₹63
- Above 10 km: rates increase further
- Labour: ₹${settings.labour_rate_per_person || 400} per person
- Packing charges: ${settings.packing_charge_percent || 10}% of base price

RULES:
- Never discuss competitors
- If unsure, say "Please call us at +91 8080477512"
- Keep answers short and clear
- For booking always direct to website or call +91 8080477512
- Answer in English or Hindi based on customer language

Customer question: ${message}
Answer:`;

    const response = await cohere.chat({
  model: 'command-r7b-12-2024',
  message: message,
  preamble: `You are a helpful customer support assistant for Kalyani Packers and Movers. You ONLY answer questions related to Kalyani Packers and Movers business. If someone asks anything unrelated say "I can only help with questions about Kalyani Packers and Movers."

BUSINESS INFORMATION:
- Phone & WhatsApp: +91 8080477512
- Email: kalyani@gmail.com
- Working Hours: Monday to Sunday, 8:00 AM to 8:00 PM
- Service Area: All India

OUR SERVICES: ${serviceList}

OUR VEHICLES:
${vehicleList}

PRICING:
- Minimum charge: ₹300 up to 4km
- 4 to 10 km: ₹300 + (distance - 4) x ₹63
- Above 10 km: rates increase further
- Labour: ₹${settings.labour_rate_per_person || 400} per person
- Packing charges: ${settings.packing_charge_percent || 10}% of base price

RULES:
- Never discuss competitors
- If unsure say "Please call us at +91 8080477512"
- Keep answers short and clear
- For booking direct to website or call +91 8080477512`,
  chatHistory: (history || []).slice(-6).map(h => ({
    role: h.role === 'user' ? 'USER' : 'CHATBOT',
    message: h.message
  }))
});

const reply = response.text.trim();

    res.json({ success: true, reply });

  } catch (err) {
console.error('Cohere full error:', JSON.stringify(err, null, 2));
console.error('Cohere error message:', err.message);
console.error('Cohere error status:', err.status);
console.error('Cohere error body:', err.body);
    res.json({
      success: false,
      reply: 'Sorry, I am having trouble right now. Please call us at +91 8080477512.'
    });
  }
});

module.exports = router;