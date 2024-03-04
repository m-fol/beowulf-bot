const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
const http = require('http');
const fs = require('fs').promises;
const { URLSearchParams } = require('url');
const moment = require('moment');

const credentialsPath = 'make a credential json file and put the path here'; 
const tokenPath = 'make a token json file and put the path here';
const folderIds = ['id1', 'id2']; //put ids from google drive, by choosing the file and then copying the id in the link


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const oAuth2Client = new google.auth.OAuth2({ //replace these here with your own data
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  redirectUri: 'http://localhost:3000',
});

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/auth/google/callback')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const code = urlParams.get('code');

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log('Tokens:', tokens);
      await saveToken(tokens); // Await the saveToken function
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Authorization successful!');
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error exchanging code for tokens');
    }
  } else {
    res.writeHead(302, { 'Location': authUrl });
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, async () => { 
  console.log(`Server running at http://localhost:${PORT}/`);
  await loadToken(); // Await the loadToken function
});

async function loadToken() {
  try {
    const token = await fs.readFile(tokenPath);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('Token loaded successfully.');
  } catch (err) {
    console.error('Error loading token:', err);
  }
}

async function saveToken(tokens) {
  try {
    await fs.writeFile(tokenPath, JSON.stringify(tokens));
    console.log('Token saved successfully.');
  } catch (err) {
    console.error('Error saving token:', err);
  }
}

async function refreshAccessToken() {
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);
    console.log('Access token refreshed successfully.');
    await saveToken(credentials);
  } catch (error) {
    console.error('Error refreshing access token:', error);
    // No need to throw error here, just log it
  }
}

const refreshTokenInterval = setInterval(async () => {
  try {
    if (oAuth2Client.isTokenExpiring()) {
      await refreshAccessToken();
    }
  } catch (error) {
    console.error('Error during token refresh check:', error);
  }
}, 3600000);

process.on('SIGINT', () => {
  clearInterval(refreshTokenInterval);
  loadToken();
  process.exit(0);
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!fileinfo')) {
    try {
      if (oAuth2Client.isTokenExpiring()) { //refresh that token!
        await refreshAccessToken();
      }

      const folderPromises = folderIds.map(async (folderId) => {
        try {
          const folderMetadata = await drive.files.get({
            fileId: folderId,
            fields: 'name',
          });

          const randomColor = Math.floor(Math.random()*16777215).toString(16);

          const folderName = folderMetadata.data.name;

          const { data } = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, createdTime)',
            orderBy: 'createdTime desc',
            pageSize: 1,
          });

          const latestFile = data.files[0];

          const embed = {
            color: parseInt(randomColor, 16), // Use the decimal representation of the color
            title: 'File Information',
            fields: [{ name: 'Folder Name', value: folderName }],
          };

          if (latestFile) {
            const fileId = latestFile.id;
            const createdTime = moment(latestFile.createdTime).format('YYYY-MM-DD HH:mm:ss');
            const fileName = latestFile.name;

            embed.fields.push({ name: 'New File Name', value: fileName, inline: true });
            embed.fields.push({ name: 'Last Added Time', value: createdTime, inline: true });
          } else {
            embed.fields.push({ name: 'New File Name', value: 'No files in the folder' });
            embed.fields.push({ name: 'Last Added Time', value: '-' });
          }

          return embed;
        } catch (folderError) {
          console.error(`Error fetching folder information for folder ID ${folderId}:`, folderError);
          return `Error fetching folder information for folder ID: ${folderId}. Details: ${folderError.message}`;
        }
      });

      const folderEmbeds = await Promise.all(folderPromises);

      for (const embed of folderEmbeds) {
        message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Top-level error:', error);
      message.channel.send(`Error fetching folder information. Details: ${error.message}`);
    }
  }
  else if (message.content.startsWith('!last')) {
    try {

      if (oAuth2Client.isTokenExpiring()) { //fix it!!!
        await refreshAccessToken();
      }

      const latestFolderId = await findLatestFolderId(folderIds);

      if (!latestFolderId) {
        message.channel.send('No folders found.');
        return;
      }

      const folderMetadata = await drive.files.get({
        fileId: latestFolderId,
        fields: 'name',
      });

      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      const folderName = folderMetadata.data.name;

      const { data } = await drive.files.list({
        q: `'${latestFolderId}' in parents`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 1,
      });

      const latestFile = data.files[0];

      const embed = {
        color: parseInt(randomColor, 16),
        title: 'File Information',
        fields: [{ name: 'Folder Name', value: folderName }],
      };

      if (latestFile) {
        const fileId = latestFile.id;
        const createdTime = moment(latestFile.createdTime).format('YYYY-MM-DD HH:mm:ss');
        const fileName = latestFile.name;

        embed.fields.push({ name: 'New File Name', value: fileName, inline: true });
        embed.fields.push({ name: 'Last Added Time', value: createdTime, inline: true });
      } else {
        embed.fields.push({ name: 'New File Name', value: 'No files in the folder' });
        embed.fields.push({ name: 'Last Added Time', value: '-' });
      }

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Top-level error:', error);
      message.channel.send(`Error fetching folder information. Details: ${error.message}`);
    }
  }
  else if (message.content === '!refreshtoken') {
    try {
      await refreshAccessToken();
      message.channel.send('Woof! :3');
    } catch (error) {
      message.channel.send('Woof...? :Ε');
    }
  }
}
);

//Extra function that shows from all your files the last one edited. Interesting but will not use it for now.
/*async function findLatestFolderId() {
  try {
    const { data } = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 1,
    });

    const latestFolder = data.files[0];
    return latestFolder ? latestFolder.id : null;
  } catch (error) {
    console.error('Error finding the latest folder:', error);
    return null;
  }
}*/
async function findLatestFolderId(folderIds) {
  let latestFolderId = null;
  let latestModifiedTime = 0;

  for (const folderId of folderIds) {
    try {
      console.log(`Fetching information for folder ID: ${folderId}`);

      const { data } = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 1,
      });

      console.log(`API response for folder ID ${folderId}:`, data);

      const files = data.files;

      if (files && files.length > 0) {
        const latestFile = files[0];

        if (new Date(latestFile.modifiedTime) > new Date(latestModifiedTime)) {
          latestModifiedTime = latestFile.modifiedTime;
          latestFolderId = folderId;
        }
      }
    } catch (error) {
      console.error(`Error fetching folder information for folder ID ${folderId}:`, error);
    }
  }

  console.log('Final result - Latest folder ID:', latestFolderId);
  return latestFolderId;
}





client.login('BOT_TOKEN'); // Replace with your actual bot token

