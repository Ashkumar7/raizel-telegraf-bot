import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { db } from 'lib/db/connection';
import { keys, users } from 'lib/db/schema';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import z from 'zod';

export const redeemKey = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  try {
    /** Check If User Is Registered */
    const user = await db.query.users.findFirst({
      where: eq(users.telegram_id, ctx.from.id),
    });

    if (user) {
      const providedKey = ctx.message.text.split(' ').slice(1)[0];

      /** Zod Validation */
      const validatedArg = z.string({ required_error: 'Key is required.' }).safeParse(providedKey);

      if (validatedArg.success == false) {
        throw validatedArg.error.errors.map((err) => err.message).join(' ');
      }

      /** Check If the Key Is Valid */
      const key = await db.query.keys.findFirst({
        where: eq(keys.key, validatedArg.data),
      });

      if (key) {
        /** Redeem Key For User And Extend Points */
        await db
          .update(users)
          .set({
            points: user.points + key.points,
            updatedAt: new Date(),
          })
          .where(eq(users.telegram_id, ctx.from.id))
          .returning();

        /** Delete Key After One-Time User */
        await db.delete(keys).where(eq(keys.key, validatedArg.data));

        /** Return Message */
        return await ctx.reply(
          fmt`
${bold`[ Redeem key ] :`}

${bold`Status :`} Redeemed Successfully.
${bold`Time :`} ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
          {
            reply_to_message_id: ctx.message.message_id,
          }
        );
      }

      /** Return Message */
      throw 'Key is not valid.';
    }

    /** Return Error Message */
    throw 'You are not registered.';
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: redeemKey() ~ RedeemKey.ts ~ User ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.reply(
      fmt`
${bold`[ Redeem key ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
};
