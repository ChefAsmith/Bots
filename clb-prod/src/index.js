const { Client, Collection, Partials, ActivityType, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('@colors/colors');

// Import Handlers
const { load: loadCommands } = require('./handlers/commandHandler');
const { load: loadEvents } = require('./handlers/eventHandler');
const deployCommands = require('./handlers/deployCommands');
const { errorHandler } = require('./utils/errorHandler');

// Import Scheduled Tasks
const performanceMonitor = require('./events/performanceMonitor');

// Intent and Partial configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message, 
    Partials.Channel, 
    Partials.Reaction, 
    Partials.GuildMember, 
    Partials.User
  ],
  allowedMentions: { repliedUser: false, parse: ['users', 'roles'] }
});

// Global Collections for interaction handling
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.cooldowns = new Collection();
client.musicPlayers = new Collection();

client.on('error', console.error);
client.on('warn', console.warn);

// --- Bot Startup ---

client.once('clientReady', async () => {
    const botName = client.user.username;
    console.log('[Discord API] '.green + botName + ' is logged in.');

    client.user.setPresence({
        activities: [{ name: process.env.BOT_STATUS || 'The Server', type: ActivityType.Watching }],
    });

    await deployCommands(client);

    performanceMonitor.execute(client);
});

// Run the core logic
(async () => {
    errorHandler(client, { 
      webhookUrl: process.env.ERROR_WEBHOOK_URL || process.env.FALLBACK_WEBHOOK_URL, 
      clientName: process.env.BOTNAME
    }); 
    
    loadCommands(client);
    loadEvents(client);

    await client.login(process.env.TOKEN);
})();
