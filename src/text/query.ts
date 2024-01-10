import { Context } from 'telegraf';
import createDebug from 'debug';
import axios from 'axios';
import { Message } from 'telegraf/typings/core/types/typegram';
import * as Sentry from '@sentry/node';
import * as amplitude from '@amplitude/analytics-node';

const debug = createDebug('bot:query_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_to_message_id: messageId,
  });

const query = () => async (ctx: Context) => {
  debug('Triggered "query text command');

  const messageId = ctx.message?.message_id;
  const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`;
  //   message{
  //   message_id: 271,
  //   from: {
  //     id: 828090678,
  //     is_bot: false,
  //     first_name: 'glaze',
  //     last_name: 'c',
  //     username: 'glazecl',
  //     language_code: 'en',
  //     is_premium: true
  //   },
  //   chat: {
  //     id: 828090678,
  //     first_name: 'glaze',
  //     last_name: 'c',
  //     username: 'glazecl',
  //     type: 'private'
  //   },
  //   date: 1704862119,
  //   text: 'd'
  // }
  debug(ctx.message);

  const message = ctx.message as Message.TextMessage;

  if (ctx.message && ctx.chat && message) {
    Sentry.setContext('message', ctx.message);
    amplitude.track('Query', undefined, {
      user_id: ctx.message?.from.id.toString(),
      extra: {
        username: ctx.message?.from.username,
        query: message.text,
      },
    });
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    try {
      const response = await search(message.text);
      for (let i = 0; i < response.matches.length; i++) {
        var searchResult = response.matches[i].text;
        // not sure if need to escape =_
        searchResult = searchResult.replace(/[*~]/g, '\\$&');

        debug(searchResult);
        await ctx.replyWithMarkdownV2(
          `=========结果 ${i + 1} 相关性 ${
            response.matches[i].score
          }=========\n` + searchResult,
          {
            parse_mode: 'Markdown',
            // reply_to_message_id: msg.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '点赞',
                    callback_data:
                      'like;;;' +
                      `${i + 1};;;` +
                      `${response.matches[i].score};;;` +
                      message.text.substring(0, 20),
                  },
                  {
                    text: '差评',
                    callback_data:
                      'dislike;;;' +
                      `${i + 1};;;` +
                      `${response.matches[i].score};;;` +
                      message.text.substring(0, 20),
                  },
                ],
              ],
            },
          },
        );
        // wait for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // add action button to the message
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      Sentry.captureException(error);
      await replyToMessage(
        ctx,
        messageId as number,
        '反馈开发者 @glazecl \nchatid: ' + messageId,
      );
    }
  }
};

async function search(message: string) {
  try {
    const response = await axios.get(
      'https://newlearnersearch.inevitable.tech/api/query',
      {
        params: {
          query: message,
        },
      },
    );

    if (response.data && Object.keys(response.data).length > 0) {
      console.log(response.data);
      return response.data;
    } else {
      return "Sorry, I don't understand";
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return 'Sorry, an error occurred';
  }
}

export { query };
