import dayjs from 'dayjs';
import createAxiosInstance from 'lib/axiosInstance';
import { Context, Markup, Scenes } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

export const DirectoryScene = new Scenes.BaseScene<Scenes.SceneContext>('directory');
const downloadsData = [];
const ITEMS_PER_PAGE = 7;
let currentPageData = [];
let message_id: number;

DirectoryScene.enter(async (ctx) => {
  try {
    /** Initial Processing Message */
    message_id = (
      await ctx.reply(
        fmt`
${bold`[ Directory ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} 🔎 Fetching.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
        {
          reply_to_message_id: ctx.message.message_id,
          disable_web_page_preview: true,
        }
      )
    ).message_id;

    /** Fetch All The Previous 7 Days Data */
    const { data } = await createAxiosInstance<Array<DownloadedInterface>>().request({
      method: 'get',
      url: '/rest/1.0/downloads',
    });

    /** If Found Nothing Return Error */
    if (data.length == 0) {
      throw 'No Files Found';
    }

    /** Store Into GlobalArray */
    downloadsData.push(...data);

    /** On Start Page Index - 0 */
    let currentPageIndex = 0;

    /** Get The First 7 Data For The CurrentPage  */
    currentPageData = downloadsData.slice(currentPageIndex, currentPageIndex + ITEMS_PER_PAGE);
    const utils = await sendPage(ctx, currentPageData, currentPageIndex);

    /** Return Message */
    await ctx.telegram.editMessageText(ctx.chat.id, message_id, null, utils.message, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(utils.keyboard),
    });
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: directoryScene.enter() ~ Directory.ts ~ Scene ~ Debrid ~ commands
          error: ${error}
          at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
      `);

    /** Return Error Message */
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      null,
      fmt`
${bold`[ Directory ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`
    );
  }
});

const sendPage = async (ctx: Context, data: typeof downloadsData, pageIndex: number) => {
  /** Get Inline Markup Based On The CurrentPage */
  const keyboard = [];
  if (pageIndex > 0) {
    keyboard.push(Markup.button.callback('⬅️ Previous', 'previous_page'));
  }
  if (pageIndex + ITEMS_PER_PAGE < downloadsData.length) {
    keyboard.push(Markup.button.callback('Next ➡️', 'next_page'));
  }

  /** Map Data Into Message And Return */
  const message = `
<b>[ Directory - 7 Days ] :</b>
<b>Total Files :</b> ${downloadsData.length}
${data
  .map(
    (file) => `
🗂 ${file.filename}
<b>Size :</b> ${new Intl.NumberFormat('en-us', {
      maximumFractionDigits: 2,
    }).format(file.filesize / Math.pow(10, 9))}GB | <b>Generated At :</b> ${dayjs.tz(file.generated).format('DD-MM-YYYY hh:mm A')}
<b>Download :</b> <a href="${file.download}">Click To Download</a>`
  )
  .join('\n')}`;

  return {
    message,
    keyboard,
  };
};

/**
 * Action For Handling "Next" Button
 * @param ctx
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
DirectoryScene.action('next_page', async (ctx) => {
  await ctx.answerCbQuery();
  const currentPageIndex = downloadsData.indexOf(currentPageData[0]) + ITEMS_PER_PAGE;
  currentPageData = downloadsData.slice(currentPageIndex, currentPageIndex + ITEMS_PER_PAGE);
  const utils = await sendPage(ctx, currentPageData, currentPageIndex);
  await ctx.editMessageText(utils.message, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(utils.keyboard),
  });
});

/**
 * Action For Handling "Previous" Button
 * @param ctx
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
DirectoryScene.action('previous_page', async (ctx) => {
  await ctx.answerCbQuery();
  const currentPageIndex = downloadsData.indexOf(currentPageData[0]) - ITEMS_PER_PAGE;
  currentPageData = downloadsData.slice(currentPageIndex, currentPageIndex + ITEMS_PER_PAGE);
  const utils = await sendPage(ctx, currentPageData, currentPageIndex);
  await ctx.editMessageText(utils.message, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(utils.keyboard),
  });
});

export const DirectorySceneInvoke = async (ctx: Scenes.SceneContext) => {
  await ctx.scene.enter('directory');
};
