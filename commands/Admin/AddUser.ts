import dayjs from 'dayjs';
import { db } from 'lib/db/connection';
import { users } from 'lib/db/schema';
import * as crypto from 'node:crypto';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import z from 'zod';

/**
 * Create new user in the database.
 * @param ctx Context
 * @returns Promise<Message.TextMessage>
 */
export const addUser = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  try {
    const t_id = ctx.message.text.split(' ').slice(1)[0];
    const points = ctx.message.text.split(' ').slice(1)[1];

    /** Zod Validation */
    const validatedArgs = z
      .object({
        id: z
          .string({
            required_error: 'Telegram Id is required.',
          })
          .refine((val) => Number(val), {
            message: 'Telegram Id must be valid number.',
          })
          .transform((val) => Number(val)),
        points: z
          .string({
            required_error: 'Points are required.',
          })
          .refine((val) => Number(val) && Number(val) > 2, {
            message: 'Points must be a number and greater than 2.',
          })
          .transform((val) => Number(val)),
      })
      .safeParse({
        id: t_id,
        points: points,
      });

    /** If Validation Failed, Throw Errors */
    if (validatedArgs.success == false) {
      throw validatedArgs.error.errors.map((err) => err.message).join(' ');
    }

    /** Otherwise, Create New User */
    const user = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        telegram_id: validatedArgs.data.id,
        points: validatedArgs.data.points,
      })
      .returning();

    /** Return Newly Created User */
    return await ctx.reply(
      fmt`
${bold`[ Add User ] :`}

${bold`User Id :`} ${user[0].telegram_id}
${bold`Points :`} ${user[0].points}
${bold`Status :`} User Created Successfully.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: addUser() ~ AddUser.ts ~ Admin ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Add User ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
