import { Telegraf } from 'telegraf';

import { about, start } from './commands';
import { query } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { message, callbackQuery } from 'telegraf/filters';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { callbackRouter } from './callback';
import * as constants from './constants';
import * as amplitude from '@amplitude/analytics-node';

Sentry.init({
  dsn: constants.SENTRY_DSN,
  integrations: [new ProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 0.2, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
amplitude.init(constants.AMPLITUDE_KEY);

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.command('about', about());
bot.start(start());
bot.on(message('text'), query());
bot.on(callbackQuery('data'), callbackRouter());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
