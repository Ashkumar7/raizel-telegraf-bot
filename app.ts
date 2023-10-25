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
Bot.command('magnet_status', Middleware.ValidateUser, torrentStatus);
Bot.command('magnet', Middleware.ValidateUser, torrentDownload);
Bot.command('host', Middleware.ValidateUser, hostDownload);

/** Bot UserCommands */
Bot.command('redeem', redeemKey);

/** Bot AdminCommands */
Bot.command('dir', Middleware.ValidateAdmin, DirectorySceneInvoke);
Bot.command('users', Middleware.ValidateAdmin, getUsers);
Bot.command('adduser', Middleware.ValidateAdmin, addUser);
Bot.command('rmuser', Middleware.ValidateAdmin, removeUser);
Bot.command('keys', Middleware.ValidateAdmin, getKeys);
Bot.command('addkey', Middleware.ValidateAdmin, generateKey);
Bot.command('rmkey', Middleware.ValidateAdmin, removeKey);

/** Bot Launch */
Bot.launch({ dropPendingUpdates: true }).then((_) => console.log('Bot started'));
