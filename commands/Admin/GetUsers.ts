import dayjs from 'dayjs';
import { db } from 'lib/db/connection';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

/**
 * Get all users from the database.
 * @param ctx Context
 * @returns Promise<Message.TextMessage>
 */
export const getUsers = async (ctx: Context) => {
  try {
    /** Query Database For Users */
    const users = await db.query.users.findMany();

    if (users.length == 0) {
      throw 'No users found.';
    }

    /** Return Users List In Message */
    return await ctx.replyWithHTML(
      `<b>[ Users ] :</b>
          ${users
            .map((user) => {
              return `
<b>ID:</b> <code>${user.telegram_id}</code> | <b>Points:</b> ${user.points}
<b>Added On:</b> ${dayjs(user.createdAt as string).format('DD-MM-YYYY hh:mm A')}`;
            })
            .join('\n')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: getUsers() ~ GetUser.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Users ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
