import dayjs from 'dayjs';
import createAxiosInstance from 'lib/axiosInstance';
import { Context, Markup, Scenes } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

export const DirectoryScene = new Scenes.BaseScene<Scenes.SceneContext>('directory');
const downloadsData = [];

// Define a constant for the number of items per page
const ITEMS_PER_PAGE = 7;

// An array to store the current page data
let currentPageData = [];

DirectoryScene.enter(async (ctx) => {
  try {
    const { data } = await createAxiosInstance<Array<DownloadedInterface>>().request({
      method: 'get',
      url: '/rest/1.0/downloads',
    });

    if (data.length == 0) {
      throw 'No Files Found';
    }
    downloadsData.push(...data);
  } catch (error) {
    await ctx.reply(
      fmt`
${bold`[ Directory ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }

  // Initialize the page index
  let currentPageIndex = 0;

  // Slice the data for the current page
  currentPageData = downloadsData.slice(currentPageIndex, currentPageIndex + ITEMS_PER_PAGE);

  const utils = await sendPage(ctx, currentPageData, currentPageIndex);

  await ctx.replyWithHTML(utils.message, {
    ...Markup.inlineKeyboard(utils.keyboard),
    reply_to_message_id: ctx.message.message_id,
  });
});

const sendPage = async (ctx: Context, data: typeof downloadsData, pageIndex: number) => {
  if (data.length === 0) {
    await ctx.reply(
      fmt`
${bold`[ Directory ] :`}

${bold`User :`} ${ctx.from.first_name}
${bold`Status :`} Failed.
${bold`Error :`} No Files Found.
${bold`Time :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } else {
    const keyboard = [];
    if (pageIndex > 0) {
      keyboard.push(Markup.button.callback('⬅️ Previous', 'previous_page'));
    }
    if (pageIndex + ITEMS_PER_PAGE < downloadsData.length) {
      keyboard.push(Markup.button.callback('Next ➡️', 'next_page'));
    }

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
  }
};

// Action for handling "Next" button
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

// Action for handling "Previous" button
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
