// Required packages
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const schedule = require('node-schedule');
const Client = require('ssh2-sftp-client');

// SFTP Configuration
const sftpConfig = {
    host: '',
    port: 5657,
    password: '',
};

// List of usernames for the SFTP servers
const usernames = [''];

// SFTP folder and local backup directory
const sftpFolder = 'plugins/eBackup/backups';
const localBackupDirectory = path.join(__dirname, 'Backups');

// Webhook Configuration
const webhookUrl = 'https://discord.com/api/webhooks/';

// Function to ensure the local backup directory exists
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Function to download files from an SFTP server
async function downloadFromSFTP(username) {
    const sftp = new Client();
    try {
        console.log(`Connecting to SFTP server as ${username}...`);
        await sftp.connect({ ...sftpConfig, username });
        console.log(`Connected as ${username}. Fetching files...`);

        // Ensure local backup directory exists
        ensureDirectoryExists(localBackupDirectory);

        // Get list of files in the remote directory
        const fileList = await sftp.list(sftpFolder);
        console.log(`Found ${fileList.length} file(s) in ${sftpFolder}.`);

        // Download each file
        for (const file of fileList) {
            const remoteFilePath = `${sftpFolder}/${file.name}`;
            const localFilePath = path.join(localBackupDirectory, file.name);
            console.log(`Downloading ${file.name}...`);
            await sftp.get(remoteFilePath, localFilePath);
        }
        console.log(`Downloaded all files for ${username}.`);
        return fileList.map(file => file.name);
    } catch (err) {
        console.error(`Error downloading files for ${username}:`, err.message);
        return [];
    } finally {
        await sftp.end();
    }
}

// Function to process all SFTP servers
async function processAllSFTPs() {
    const downloadedFiles = [];
    for (const username of usernames) {
        const files = await downloadFromSFTP(username);
        downloadedFiles.push(...files);
    }
    return downloadedFiles;
}

// Function to send a Discord webhook
async function sendDiscordWebhook(files) {
    if (files.length === 0) return;

    const embed = {
        title: 'Backup Notification',
        description: `The following files have been successfully backed up to an off-site location:\n\n${files.join('\n')}`,
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
    };

    try {
        await axios.post(webhookUrl, { embeds: [embed] });
        console.log('Notification sent successfully.');
    } catch (error) {
        console.error('Error sending webhook:', error.message);
    }
}

// Function to delete old files
function deleteOldFiles(directory, ageLimitDays) {
    const files = fs.readdirSync(directory).filter(file => fs.statSync(path.join(directory, file)).isFile());
    const now = Date.now();
    const ageLimit = ageLimitDays * 24 * 60 * 60 * 1000;

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > ageLimit) {
            console.log(`Deleting old file: ${file}`);
            fs.unlinkSync(filePath);
        }
    });
}

// Main function
async function checkAndNotify() {
    console.log('Running backup check...');
    const downloadedFiles = await processAllSFTPs();

    if (downloadedFiles.length > 0) {
        console.log(`Downloaded ${downloadedFiles.length} file(s):`, downloadedFiles);
        await sendDiscordWebhook(downloadedFiles);
        deleteOldFiles(localBackupDirectory, 2); // Delete files older than 2 days
        console.log('Notification sent and old files deleted.');
    } else {
        console.log('No new files found.');
    }
}

// Schedule the job to run at 1AM daily
schedule.scheduleJob('0 1 * * *', async () => {
    await checkAndNotify();
});

// Debug function to manually trigger the check
async function debugCheck() {
    console.log('Debug mode: Manually triggering backup check.');
    await checkAndNotify();
}

// Uncomment the line below to test the debug function
// debugCheck();

console.log('File monitor scheduled to run at 1AM daily.');
