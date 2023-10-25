import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { db } from 'lib/db/connection';
import { users } from 'lib/db/schema';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import z from 'zod';

export const removeUser = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  try {
    const t_id = ctx.message.text.split(' ').slice(1)[0];

    /** Zod Validation */
    const validatedArgs = z
      .string({
        required_error: 'Telegram Id is required.',
      })
      .refine((val) => Number(val), {
        message: 'Telegram Id must be valid number.',
      })
      .transform((val) => Number(val))
      .safeParse(t_id);

    /** If Validation Failed, Throw Errors */
    if (validatedArgs.success == false) {
      throw validatedArgs.error.errors.map((err) => err.message).join(' ');
    }

    /** Otherwise, Remove The User */
    const user = await db.delete(users).where(eq(users?.telegram_id, validatedArgs.data)).returning();

    /** Return Deleted User */
    return await ctx.reply(
      fmt`
${bold`[ Remove User ] :`}

${bold`User Id :`} ${user[0].telegram_id}
${bold`Status :`} User Removed Successfully.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: removeUser() ~ RemoveUser.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Remove User ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
