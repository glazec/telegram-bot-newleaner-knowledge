import { Context } from 'telegraf';
import createDebug from 'debug';
import * as constants from '../constants';
import * as Sentry from '@sentry/node';
import * as amplitude from '@amplitude/analytics-node';

const debug = createDebug('bot:review_callback');

const callbackRouter = () => async (ctx: any) => {
  //   debug(ctx.callbackQuery);
  const userId = ctx.callbackQuery.message?.chat.id;
  const username = ctx.callbackQuery.message?.chat.username;
  const callbackData = ctx.callbackQuery.data;
  const originData = ctx.callbackQuery.message?.text;

  //   callbackData: dislike;;;index;;;relevant score; query
  const parts = callbackData.split(';;;');

  amplitude.track('Review', undefined, {
    user_id: userId.toString(),
    extra: {
      username: username,
      action: parts[0],
    },
  });
  //   debug(parts);
  const review_data = {
    query: parts[3],
    result: originData.split('=========')[2],
    review: parts[0],
    userid: userId,
    username: username,
    rank: parseInt(parts[1]),
    relevant_score: parseFloat(parts[2]),
  };
  debug(review_data);
  const { data, error } = await constants.supabase
    .from('review')
    .insert(review_data);
  if (error) {
    console.error(error);
    Sentry.setContext('review_data', review_data);
    Sentry.captureException(error);
  }

  ctx.answerCbQuery('我们已收到您的反馈，感谢您的支持！');
};

export { callbackRouter };
