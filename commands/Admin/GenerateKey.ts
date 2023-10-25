import dayjs from 'dayjs';
import { db } from 'lib/db/connection';
import { keys } from 'lib/db/schema';
import * as crypto from 'node:crypto';
import { Context } from 'telegraf';
import { bold, code, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import z from 'zod';

/**
 * Generate new key in database.
 * @param ctx Context
 * @returns Promise<Message.TextMessage>
 */
export const generateKey = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  try {
    const pointsForKey = ctx.message.text.split(' ').slice(1)[0];
    const newKey = crypto.randomBytes(16).toString('hex').toLocaleUpperCase();

    /** Zod Validation */
    const validatedArgs = z
      .string({
        required_error: 'PointsForKey is required.',
      })
      .refine((val) => Number(val) && Number(val) > 2, {
        message: 'PointsForKey should be a number and greater than 1.',
      })
      .transform((val) => Number(val))
      .safeParse(pointsForKey);

    /** If Validation Failed, Throw Errors */
    if (validatedArgs.success == false) {
      throw validatedArgs.error.errors.map((err) => err.message).join(' ');
    }

    /** Add Key To Database */
    const key = await db
      .insert(keys)
      .values({
        id: crypto.randomUUID(),
        key: newKey,
        points: validatedArgs.data,
      })
      .returning();

    /** Return Newly Created Key */
    return await ctx.reply(
      fmt`
${bold`[ Generate Key ] :`}

${bold`Key :`} ${code`${key[0].key}`}
${bold`Points :`} ${key[0].points}
${bold`Status :`} Key Created Successfully.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: generateKey() ~ GenerateKey.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Generate key ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
