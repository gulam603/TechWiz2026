import { answer } from '../services/assistant.js';

// POST /api/assistant  { message }
export async function chat(req, res) {
  res.json(await answer(req.body?.message, req.user));
}
