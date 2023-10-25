import dayjs from 'dayjs';
import { db } from 'lib/db/connection';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

/**
 * Get all keys from database.
 * @param ctx Context
 * @returns Promise<Message.TextMessage>
 */
export const getKeys = async (ctx: Context) => {
  try {
    /** Query Database For Keys */
    const keys = await db.query.keys.findMany();

    if (keys.length == 0) {
      throw 'No keys found.';
    }

    /** Return Keys List In Message */
    return await ctx.replyWithHTML(
      `<b>[ Keys ] :</b>
        ${keys
          .map((key) => {
            return `
<b>Key:</b> <code>${key.key}</code>
<b>Points:</b> ${key.points}
<b>Added On:</b> ${dayjs(key.createdAt as string).format('DD-MM-YYYY hh:mm A')}`;
          })
          .join('\n')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: getKeys() ~ GetKeys.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Keys ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
