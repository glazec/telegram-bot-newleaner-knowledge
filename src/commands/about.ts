import { Context } from 'telegraf';
import createDebug from 'debug';
import * as amplitude from '@amplitude/analytics-node';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  debug(`Triggered "about" command`);
  amplitude.track('Start', undefined, {
    user_id: ctx.message?.from.id.toString(),
    extra: {
      username: ctx.message?.from.username,
    },
  });
  await ctx.reply(
    '欢迎使用 Newlearner 知识库助手，Newlearner 基于混合搜索技术开发，帮助用户通过模糊的关键词找到相关推送。\n\n目前知识库更新至 2023 年 8 月。\n\n我们非常重视您的反馈，欢迎您随时与我们分享您的想法。如有任何意见或询问，请通过 Telegram 联系 @glazecl',
  );
};

export { about };
