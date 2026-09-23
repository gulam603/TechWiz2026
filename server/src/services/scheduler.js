import { Farmer, User } from '../models/index.js';
import { USER_STATUS } from '../utils/constants.js';
import { isoWeekKey } from '../utils/dates.js';
import { applyWeeklyTemplate } from './stock.js';

/**
 * Runs once an hour. At the start of every new week it re-applies the weekly stock
 * template for farmers who enabled "auto apply".
 */
export async function runWeeklyTemplates() {
  const week = isoWeekKey();
  const farmers = await Farmer.find({ autoApplyTemplate: true, templateLastAppliedWeek: { $ne: week } });
  let count = 0;
  for (const farmer of farmers) {
    const user = await User.findById(farmer.user).select('status');
    if (user?.status !== USER_STATUS.ACTIVE) continue;
    await applyWeeklyTemplate(farmer);
    count += 1;
  }
  if (count) console.log(`[scheduler] Weekly stock template applied for ${count} farmer(s) (${week})`);
}

export function startScheduler() {
  const run = () => runWeeklyTemplates().catch((err) => console.error('[scheduler]', err.message));
  setTimeout(run, 5000);
  return setInterval(run, 60 * 60 * 1000);
}
