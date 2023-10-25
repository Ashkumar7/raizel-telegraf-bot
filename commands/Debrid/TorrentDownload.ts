import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import createAxiosInstance from 'lib/axiosInstance';
import { db } from 'lib/db/connection';
import { users } from 'lib/db/schema';
import { Context } from 'telegraf';
import { bold, code, fmt } from 'telegraf/format';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import DebridCommandsUtilis from './DebridUtilites';

/**
 * download files from torrent via adding magnet_link.
 * @param ctx Context
 */
export const torrentDownload = async (ctx: Context<Update.MessageUpdate<Message.TextMessage>>) => {
  let message_id: number;
  try {
    /** Initial Processing Message */
    message_id = (
      await ctx.reply(
        fmt`
${bold`[ Torrent Download ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} 🔎 Processing.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
        {
          reply_to_message_id: ctx.message.message_id,
          disable_web_page_preview: true,
        }
      )
    ).message_id;

    /** Arg Validation */
    const arg = ctx.message.text.split(' ').slice(1)[0];
    const magnetRegex = /^(magnet:\?xt=urn:btih:)([a-zA-Z0-9]{40})/;
    if (!arg || RegExp(magnetRegex).test(arg) === false) {
      throw 'Invalid or no magnet link was provided.';
    }

    /** Check if User Exists */
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

    /** Add MagnetLink */
    const addMagnetReq = await DebridCommandsUtilis.addMagnet(arg);
    let torrentInfoReq: TorrentInterface = await DebridCommandsUtilis.torrentInfo(addMagnetReq.id);

    /** Edit Below Message Every 10 Sec */
    const progress = setInterval(async () => {
      if (torrentInfoReq.status === 'waiting_files_selection') {
        /** Select All Files And Start Download */
        await createAxiosInstance().request({
          method: 'post',
          url: `/rest/1.0/torrents/selectFiles/${addMagnetReq.id}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: { files: 'all' },
        });
      }

      /** Get Torrent Information */
      torrentInfoReq = await DebridCommandsUtilis.torrentInfo(addMagnetReq.id);

      /** Stop The Torrent Based On Conditions Mentioned Below */
      if (torrentInfoReq.status == 'dead' || torrentInfoReq.status == 'error' || torrentInfoReq.status == 'magnet_error') {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          message_id,
          null,
          fmt`
${bold`(Torrent Download) :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${torrentInfoReq.status}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`
        );
        clearInterval(progress);
        return;
      }

      /** Stop The Torrent If It Is Completed */
      if (torrentInfoReq.status === 'downloaded') {
        /** Unrestrict Links */
        const download_links: Array<string> = [];
        const unrestrictLinkPromises = torrentInfoReq.links.map(async (link) => {
          return await DebridCommandsUtilis.unrestrictLink(link);
        });
        const unrestrictLinkResults = await Promise.allSettled(unrestrictLinkPromises);
        unrestrictLinkResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            download_links.push(result.value.download);
          }
        });

        /** Edit And Send DownloadCompleted Message */
        const downloadCompletedMessage = `
<b>(Torrent Download) :</b>

<b>┌ ${DebridCommandsUtilis.progressBar(torrentInfoReq.progress)}</b>
<b>├ ID :</b> <code>${torrentInfoReq.id}</code>
<b>├ Downloaded :</b> ${new Intl.NumberFormat('en-us', {
          maximumFractionDigits: 2,
        }).format((torrentInfoReq?.original_bytes * torrentInfoReq.progress) / 100 / Math.pow(10, 9))}GB
<b>├ Size :</b> ${new Intl.NumberFormat('en-us', {
          maximumFractionDigits: 2,
        }).format(torrentInfoReq?.original_bytes / Math.pow(10, 9))}GB
<b>└ Added On :</b> ${dayjs.tz(torrentInfoReq.added).format('DD-MM-YYYY hh:mm:ss A')}

<b>┌ User Name :</b> ${ctx.from.first_name}
<b>├ File Name :</b> ${torrentInfoReq.filename}
<b>├ Files :</b> ${
          download_links.length
            ? download_links
                .map((link, index) => {
                  return `<a href="${link}">${index + 1}</a>`;
                })
                .join(' ')
            : 'No Files.'
        }
<b>├ Status :</b> ${torrentInfoReq.status}.
<b>└ Time IST :</b> ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}`;

        await ctx.telegram.editMessageText(ctx.chat.id, message_id, null, downloadCompletedMessage, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
        });

        clearInterval(progress);
        return;
      }

      const torrentInfoMessage = fmt`
${bold`[ Torrent Download ] :`}

${bold`┌ ${DebridCommandsUtilis.progressBar(torrentInfoReq.progress)}`}
${bold`├ File ID :`} ${code`${torrentInfoReq.id}`}
${bold`├ Downloaded :`} ${new Intl.NumberFormat('en-us', {
        maximumFractionDigits: 2,
      }).format((torrentInfoReq?.original_bytes * torrentInfoReq.progress) / 100 / Math.pow(10, 9))}GB | ${bold`Seeders :`} ${
        torrentInfoReq.seeders ?? 0
      }
${bold`├ Speed :`} ${
        torrentInfoReq.speed
          ? `${new Intl.NumberFormat('en-us', {
              maximumFractionDigits: 2,
            }).format(torrentInfoReq.speed / 1000)}KB/s`
          : '0KB/s'
      } | ${bold`ETA :`} ${DebridCommandsUtilis.calculateETA(torrentInfoReq.progress, torrentInfoReq?.original_bytes, torrentInfoReq.speed)}
${bold`└ Added On :`} ${dayjs.tz(torrentInfoReq.added).format('DD-MM-YYYY hh:mm:ss A')}

${bold`┌ User Name :`} ${ctx.from.first_name}
${bold`├ File Name :`} ${torrentInfoReq.filename}
${bold`├ Size :`} ${new Intl.NumberFormat('en-us', {
        maximumFractionDigits: 2,
      }).format(torrentInfoReq?.original_bytes / Math.pow(10, 9))}GB
${bold`├ Status :`} ${torrentInfoReq.status}.
${bold`└ Time IST :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}`;

      /** Edit And Send Message */
      await ctx.telegram.editMessageText(ctx.chat.id, message_id, null, torrentInfoMessage, {
        disable_web_page_preview: true,
      });
    }, 7000);
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: torrentDownload() ~ TorrentDownload.ts ~ Debrid ~ commands
            error: ${error}
            at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
        `);

    /** Return Error Message */
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      null,
      fmt`
${bold`[ Torrent Download ] :`}

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
