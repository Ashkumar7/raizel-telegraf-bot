import { addUser, generateKey, getKeys, getUsers, removeKey, removeUser } from '@commands/Admin';
import { StartScene, startSceneInvoke } from '@commands/Basic';
import { DirectoryScene, DirectorySceneInvoke, hostDownload, torrentDownload, torrentStatus } from '@commands/Debrid';
import Middleware from '@commands/Middleware';
import { redeemKey } from '@commands/User';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import DotEnv from 'dotenv';
import { Context, Scenes, Telegraf, session } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

/** DayJS Configurations */
dayjs.extend(utc);
dayjs.extend(timezone);

/** Set Default Timezone */
dayjs.tz.setDefault('Asia/Kolkata');

/** Load Environment Variables */
DotEnv.config({ path: '.env.local' });

/** Bot Configurations */
const Bot = new Telegraf<Context & SceneContext>(process.env.TELEGRAM_BOT_TOKEN as string);
const stage = new Scenes.Stage<Scenes.SceneContext>([StartScene, DirectoryScene]);
Bot.use(session());
Bot.use(stage.middleware());

/** Bot BasicCommands */
Bot.command('start', startSceneInvoke);

/** Bot DebridCommands */
Bot.use(Middleware.ValidateUser);
Bot.command('magnet_status', torrentStatus);
Bot.command('magnet', torrentDownload);
Bot.command('host', hostDownload);

/** Bot UserCommands */
Bot.command('redeem', redeemKey);

/** Bot AdminCommands */
Bot.use(Middleware.ValidateAdmin);
Bot.command('dir', DirectorySceneInvoke);
Bot.command('users', getUsers);
Bot.command('adduser', addUser);
Bot.command('rmuser', removeUser);
Bot.command('keys', getKeys);
Bot.command('addkey', generateKey);
Bot.command('rmkey', removeKey);

/** Bot Launch */
Bot.launch({ dropPendingUpdates: true }).then((_) => console.log('Bot started'));
