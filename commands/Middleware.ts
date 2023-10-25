import { db } from '@lib/db/connection';
import { users } from '@lib/db/schema';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { Context } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

class Middleware {
  static ValidateUser = async (ctx: Context, next: any) => {
    try {
      /** Check if user is registered */
      const user = await db.query.users.findFirst({
        where: eq(users.telegram_id, ctx.from.id),
      });

      if (user) {
        return next();
      }

      /** Return Error Message */
      throw 'You are not a registered user.';
    } catch (error) {
      /** Log Error Message */
      console.log(`LOG: 🚀 ~ file: Middleware.ts ~ commands ~ ValidateUser ~ error
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}`);

      /** Return Error Message */
      ctx.reply(
        fmt`
${bold`[ Validate User ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
        {
          reply_to_message_id: ctx.message.message_id,
        }
      );
    }
  };

  static ValidateAdmin = async (ctx: Context, next: any) => {
    try {
      /** Check if user is admin */
      const user = await db.query.users.findFirst({
        where: eq(users.telegram_id, ctx.from.id),
      });

      if (!user) {
        throw 'You are not a registered user.';
      }

      if (user.role !== 'ADMIN') {
        throw 'You are not an admin.';
      }

      /** Return Error Message */
      return next();
    } catch (error) {
      /** Log Error Message */
      console.log(`LOG: 🚀 ~ file: Middleware.ts ~ commands ~ ValidateAdmin ~ error
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}`);

      /** Return Error Message */
      ctx.reply(
        fmt`
${bold`[ Validate Admin ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
        {
          reply_to_message_id: ctx.message.message_id,
        }
      );
    }
  };
}

export default Middleware;
