import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { db } from 'lib/db/connection';
import { keys } from 'lib/db/schema';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import z from 'zod';

/**
 * Remove a key from the database.
 * @param ctx Context
 * @returns Promise<Message.TextMessage>
 */
export const removeKey = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  try {
    const arg = ctx.message.text.split(' ').slice(1)[0];

    /** Zod Validation */
    const validatedArgs = z
      .string({
        required_error: 'Key is required.',
      })
      .safeParse(arg);

    /** If Validation Failed, Throw Errors */
    if (validatedArgs.success == false) {
      throw validatedArgs.error.errors.map((err) => err.message).join(' ');
    }

    /** Otherwise, Remove The Key */
    const removedKey = await db.delete(keys).where(eq(keys.key, validatedArgs.data)).returning();

    /** Return Deleted Key */
    return await ctx.reply(
      fmt`
${bold`[ Remove Key ] :`}

${bold`Key :`} ${removedKey[0].key}
${bold`Status :`} Key Removed Successfully.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: removeKey() ~ RemoveKey.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Remove Key ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
