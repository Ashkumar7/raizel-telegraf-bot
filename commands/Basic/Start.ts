import createAxiosInstance from '@lib/axiosInstance';
import { db } from '@lib/db/connection';
import { users } from '@lib/db/schema';
import APP_VERSION from 'APP_VERSION';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import os from 'node-os-utils';
import { Markup, Scenes } from 'telegraf';
import { bold, fmt } from 'telegraf/format';

export const StartScene = new Scenes.BaseScene<Scenes.SceneContext>('start');

/**
 * Start
 * @param ctx Scenes.SceneContext
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
StartScene.enter(async (ctx) => {
  /** Start Message */
  const startMessage = fmt`
${bold`Welcome To Raizel Bot ${APP_VERSION}`}

${bold`[ Your Info ] :`}
${bold`Your Name :`} ${ctx.from.first_name ?? ''} ${ctx.from.last_name ?? ''}
${bold`Your ID :`} ${ctx.from.id}
${bold`Chat ID :`} @${ctx.from.username ?? ''}

${bold`[ System Info ] :`}
${bold`System Status :`} Online
${bold`Owner :`} @Noblesse_Raizel
${bold`CPU (%) :`} ${isNaN(await os.cpu.usage()) ? '0' : await os.cpu.usage()}%
${bold`RAM (%) :`} ${(await os.mem.info()).usedMemPercentage}%
${bold`Time [IST] :`} ${dayjs.tz().format('DD-MM-YYYY hh:mm A')}
  `;

  /** For CallBack EditCaption
   * Otherwise Return The StartMessage
   */
  ctx.callbackQuery
    ? await ctx.editMessageCaption(startMessage, {
        ...Markup.inlineKeyboard(
          [
            Markup.button.callback('📝 Usecase ?', 'usecase'),
            Markup.button.callback('📚 Commands', 'commands'),
            Markup.button.callback('🧑🏼 Debrid Info', 'debrid_info'),
            Markup.button.callback('📊 Hosters', 'hoster_page'),
          ],
          {
            columns: 2,
          }
        ),
      })
    : await ctx.replyWithPhoto('https://i.pinimg.com/564x/20/be/dd/20beddba354a4e5eade803dd63d7f306.jpg', {
        caption: startMessage,
        ...Markup.inlineKeyboard(
          [
            Markup.button.callback('📝 Usecase ?', 'usecase'),
            Markup.button.callback('📚 Commands', 'commands'),
            Markup.button.callback('🧑🏼 Debrid Info', 'debrid_info'),
            Markup.button.callback('📊 Hosters', 'hoster_page'),
          ],
          {
            columns: 2,
          }
        ),
        reply_to_message_id: ctx.message.message_id,
      });
});

/**
 * Usecase
 * @param ctx Scenes.SceneContext
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
StartScene.action('usecase', async (ctx) => {
  await ctx.answerCbQuery();
  return await ctx.editMessageCaption(
    fmt`
${bold`[ Usecase ] :`}
- Raizel Bot is your go-to companion for optimizing your online streaming adventures, enabling lightning-fast access to premium links, so you can enjoy your preferred movies and TV shows with uninterrupted playback.

${bold`[ Features ] :`}
- You can use this bot to download files from file hosters.
- You can also use this bot to download files from torrent.
- You can get direct streamable links for your files.
      `,
    {
      ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
    }
  );
});

/**
 * Help
 * @param ctx Scenes.SceneContext
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
StartScene.action('commands', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();
  try {
    /** Validate User */
    const user = await db.query.users.findFirst({
      where: eq(users.telegram_id, ctx.from.id),
    });

    return await ctx.editMessageCaption(
      fmt`
${
  user.role == 'ADMIN'
    ? bold`[ Admin Commands ] :

${bold`[1] Files Directory :`}
${bold`Command :`} /dir

${bold`[2] Get Users :`}
${bold`Command :`} /users

${bold`[3] Add User :`}
${bold`Command :`} /adduser <telegram_id> <points>

${bold`[4] Remove User :`}
${bold`Command :`} /rmuser <telegram_id>

${bold`[5] Get Keys :`}
${bold`Command :`} /keys

${bold`[6] Add Key :`}
${bold`Command :`} /addkey

${bold`[7] Remove Key :`}
${bold`Command :`} /rmkey <key>
`
    : ''
}
${bold`[ Users Command ] :`}

${bold`[1] Torrent Download :`}
${bold`Command :`} /magnet <magnet_link>

${bold`[2] Host Download :`}
${bold`Command :`} /host <hoster_link>

${bold`[3] Magnet Status :`}
${bold`Command :`} /magnet_status <file_id>

${bold`[4] Redeem Key :`}
${bold`Command :`} /redeem <key>
`,
      {
        ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: StartScene.action('commands') ~ Start.ts ~ Basic ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}`);

    /** Return Error Message */
    await ctx.editMessageCaption(
      fmt`
${bold`[ Help ] :`}
${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
      {
        ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
      }
    );
  }
});

/**
 * Debrid Info
 * @param ctx Scenes.SceneContext
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
StartScene.action('debrid_info', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();
  try {
    /** Validate Admin */
    const user = await db.query.users.findFirst({
      where: eq(users.telegram_id, ctx.from.id),
    });

    if (user.role != 'ADMIN') {
      throw 'You are not an Admin.';
    }

    /** Get Debrid Account Details */
    const { data } = await createAxiosInstance<UserInterface>().request({
      url: '/rest/1.0/user',
      method: 'GET',
    });

    /** Return User Details */
    return await ctx.editMessageCaption(
      fmt`
${bold`[ Debrid Info ] :`}
${bold`Your ID :`} ${data.id}
${bold`UserName :`} ${data.username}
${bold`Email :`} ${data.email}
${bold`Fidelity Points :`} ${data.points}
${bold`Locales :`} ${data.locale.toLocaleUpperCase()}
${bold`Premium :`} ${data.type == 'premium' ? 'Yes' : 'No'}
${bold`Expired On :`} ${dayjs(data.expiration).format('DD-MM-YYYY hh:mm A')}
      `,
      {
        ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
      }
    );
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: StartScene.action('debrid_info') ~ Start.ts ~ Basic ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.editMessageCaption(
      fmt`
${bold`[ Debrid Info ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
      {
        ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
      }
    );
  }
});

/**
 * Hoster Page
 * @param ctx Scenes.SceneContext
 * @returns Promise<Scenes.SceneContextMessageUpdate>
 */
let hosterData: Array<{
  page_number: number;
  data: Array<{
    id: string;
    name: string;
    check_time: string;
  }>;
}> = [];
let currentPageIndex = 1;
let dataPerPage = 10;
let inlineKeyboard = [
  Markup.button.callback('⬅️ Previous', `previous_page`),
  Markup.button.callback('Next ➡️', `next_page`),
  Markup.button.callback('🏡 Back To Home', 'back_to_start'),
];

const createMessage = (data: typeof hosterData, pageIndex: number) => {
  const currentPageData = data.find((host) => host.page_number === pageIndex).data ?? [];

  /** If FirstPage Then Remove previous_button */
  if (currentPageIndex == 1) {
    inlineKeyboard = [Markup.button.callback('Next ➡️', `next_page`), Markup.button.callback('🏡 Back To Home', 'back_to_start')];
  } else {
    inlineKeyboard = [
      Markup.button.callback('⬅️ Previous', `previous_page`),
      Markup.button.callback('Next ➡️', `next_page`),
      Markup.button.callback('🏡 Back To Home', 'back_to_start'),
    ];
  }

  /** If LastPage Then Remove next_button */
  if (currentPageIndex == hosterData[hosterData.length - 1].page_number) {
    inlineKeyboard = [Markup.button.callback('⬅️ Previous', `previous_page`), Markup.button.callback('🏡 Back To Home', 'back_to_start')];
  }

  if (currentPageData.length == 0) {
    return fmt`
<b>[ Hoster Status ] :</b>
<b>Status :</b> Failed.
<b>Error :</b> No Hosters Found.
<b>Time IST :</b> ${dayjs().format('DD-MM-YYYY hh:mm A')}
        `;
  } else {
    return fmt`
<b>[ Hoster Status - ${pageIndex} ] :</b>
${currentPageData
  .map(
    (host) => `
📊 <b>${host.name}</b>
<b>Status :</b> 🟢 | <b>LastChecked :</b> ${dayjs(host.check_time).format('DD-MM-YYYY')}`
  )
  .join('\n')}`;
  }
};

StartScene.action('hoster_page', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();
  let dataInArray: (typeof hosterData)[0]['data'] = [];
  hosterData = [];
  currentPageIndex = 1;

  try {
    /** Get All Status */
    const { data } = await createAxiosInstance<HostStatus>().request({
      url: '/rest/1.0/hosts/status',
      method: 'GET',
    });

    /** Push All The Data Into `dataInArray` */
    Object.entries(data).forEach(([key, value]) => {
      if (value.status === 'up') {
        dataInArray.push({
          id: value.id,
          name: value.name,
          check_time: value.check_time,
        });
      }
    });

    /** Split Data For `HosterData` Where Each page_number Contains 10 Array Of Data */
    for (let i = 0; i < dataInArray.length; i += dataPerPage) {
      hosterData.push({
        page_number: hosterData.length + 1,
        data: dataInArray.slice(i, i + dataPerPage),
      });
    }

    /** Edit the message with the current page's content and pagination */
    await ctx.editMessageCaption(createMessage(hosterData, 1), {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(inlineKeyboard, {
        columns: 2,
      }),
    });
  } catch (error) {
    /** Log Error */
    console.log(`LOG: 🚀 ~ error ~ file: StartScene.action('hoster_page') ~ Start.ts ~ Basic ~ commands
              error: ${error}
              at: ${dayjs.tz().format('DD-MM-YYYY hh:mm:ss A')}
          `);

    /** Return Error Message */
    await ctx.editMessageCaption(
      fmt`
${bold`[ Hoster Status ] :`}

${bold`Status :`} Failed.
${bold`Error :`} ${error?.response?.data ? error?.response?.data?.error : error}
${bold`Time :`} ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
      {
        ...Markup.inlineKeyboard([Markup.button.callback('🏡 Back To Home', 'back_to_start')]),
      }
    );
  }
});

StartScene.action('next_page', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();

  /** Increment the page index */
  currentPageIndex++;

  /** Edit the message with the current page's content and pagination */
  await ctx.editMessageCaption(createMessage(hosterData, currentPageIndex), {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(inlineKeyboard, {
      columns: 2,
    }),
  });
});

StartScene.action('previous_page', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();

  /** Decrement the page index */
  currentPageIndex--;

  /** Edit the message with the current page's content and pagination */
  await ctx.editMessageCaption(createMessage(hosterData, currentPageIndex), {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(inlineKeyboard, {
      columns: 2,
    }),
  });
});

StartScene.action('back_to_start', async (ctx: Scenes.SceneContext) => {
  await ctx.answerCbQuery();
  await ctx.scene.enter('start');
});

export const startSceneInvoke = async (ctx: Scenes.SceneContext) => {
  await ctx.scene.enter('start');
};
