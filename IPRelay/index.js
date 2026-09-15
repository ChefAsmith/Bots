const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { WebhookClient } = require('discord.js');

const bot1 = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
});

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes interval
let previousIP = null;

const WEBHOOK_URL = 'https://discord.com/api/webhooks/';
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

async function checkServerIP() {
    try {
        console.log('Checking server IP...');
        const response = await axios.get('https://api.ipify.org?format=json');
        console.log('Server IP fetched:', response.data.ip);
        return response.data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        return null;
    }
}

bot1.once('ready', async () => {
    console.log(`Bot1 logged in as ${bot1.user.tag}`);

    setInterval(async () => {
        console.log('Running scheduled IP check...');
        const currentIP = await checkServerIP();
        if (currentIP && currentIP !== previousIP) {
            console.log(`IP has changed from ${previousIP} to ${currentIP}`);
            previousIP = currentIP;

            await webhookClient.send(`The server IP has changed to: ${currentIP}`);
            console.log('IP sent to webhook.');
        } else {
            console.log('IP has not changed.');
        }
    }, CHECK_INTERVAL);
});

bot1.login('token');
