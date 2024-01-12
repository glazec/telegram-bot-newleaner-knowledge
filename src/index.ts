import { Telegraf } from 'telegraf';

import { about, start } from './commands';
import { query } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { message, callbackQuery } from 'telegraf/filters';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { callbackRouter } from './callback';
import * as amplitude from '@amplitude/analytics-node';
import { createClient } from '@supabase/supabase-js';
import { debug } from 'console';

const SENTRY_DSN = process.env.SENTRY_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const AMPLITUDE_KEY = process.env.AMPLITUDE_KEY || '';
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
Sentry.init({
  dsn: 'https://bd7a72fde91f5db205dd1dbfd3de4028@o262884.ingest.sentry.io/4506548060749824',
  integrations: [new ProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 20% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
amplitude.init(AMPLITUDE_KEY);

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);
try {
  bot.command('about', about());
  bot.start(start());
  bot.on(message('text'), query());
  bot.on(callbackQuery('data'), callbackRouter());
} catch (e) {
  Sentry.captureException(e);
}

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
