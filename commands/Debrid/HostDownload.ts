import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { db } from 'lib/db/connection';
import { users } from 'lib/db/schema';
import { type Context } from 'telegraf';
import { bold, fmt, link } from 'telegraf/format';
import type { Message, Update } from 'telegraf/typings/core/types/typegram';
import DebridCommandsUtilis from './DebridUtilites';

/**
 * download files from premium file hosters.
 * @param ctx Context
 */
export const hostDownload = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  let message_id: number;
  try {
    /** Initial Processing Message */
    message_id = (
      await ctx.reply(
        fmt`
${bold`[ FileHoster Download ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} 🔎 Processing.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
        {
          reply_to_message_id: ctx.message.message_id,
          disable_web_page_preview: true,
        }
      )
    ).message_id;

    const arg = ctx.message.text.split(' ').slice(1)[0];

    /** Check if user exists */
    const user = await db.query.users.findFirst({
      where: eq(users.telegram_id, ctx.from.id),
    });

    if (!user) {
      throw 'You are not a registered user.';
    }

    /** Check if user has enough points */
    if (user.points <= 2) {
      throw 'You have insufficient points to download.';
    }

    /** Unrestrict Link */
    const data = await DebridCommandsUtilis.unrestrictLink(arg);

    /** Update User Points By -2 */
    const updatedUser = await db
      .update(users)
      .set({ points: user.points - 2, updatedAt: new Date() })
      .where(eq(users.telegram_id, ctx.from.id))
      .returning({
        points: users.points,
      });

    /** Return Message */
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      null,
      fmt`
${bold`[ FileHoster Download ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Points Left :`} ${updatedUser[0].points}
${bold`FileName :`} ${data.filename}
${bold`Size :`} ${new Intl.NumberFormat('en-us', {
        maximumFractionDigits: 2,
      }).format(data.filesize / Math.pow(10, 9))}GB
${bold`Status :`} Completed.
${bold`Download :`} ${link('Click To Download', data.download)}
${bold`Hoster :`} ${data.host}
${bold`Generated At :`} ${dayjs(data.generated).format('DD-MM-YYYY hh:mm A')}`,
      {
        disable_web_page_preview: true,
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: hostDownload() ~ HostDownload.ts ~ Debrid ~ commands
          error: ${error}
          at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
      `);

    /** Return Error Message */
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      null,
      fmt`
${bold`[ FileHoster Download ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        disable_web_page_preview: true,
      }
    );
  }
};
