# 🐺 Beowulf File Retriever Bot 🐺
----

<img alt="image" src="https://github.com/m-fol/beowulf-bot/assets/139060140/47852ea0-11ce-4d72-bd58-fc78f8def404">

---
<p> <img src="https://github.com/m-fol/beowulf-bot/assets/139060140/cff59273-d8f6-4b83-815a-114f522cc0f0" alt="Image" height="20">
Beowulf-Bot is a Discord bot that features Beowulf, a character from the fighting game Skullgirls <i>(cause he's my favorite, there's really not much thought here)</i>. It's designed to retrieve Google Drive file status and provide updates to your team about the last time a file was edited. With commands like `!fileinfo` and `!last`, it helps keep track of file activity within specified folders. <img src="https://github.com/m-fol/beowulf-bot/assets/139060140/cff59273-d8f6-4b83-815a-114f522cc0f0" alt="Image"  height="20"> </p>


## Features

- `!fileinfo`: Displays the folder name, the last file added in it, and when it was last edited.
- `!last`: Shows the last edited folder, indicating the folder with the most recently added file.

## Usage

To use Beowulf Bot and run it from your computer, follow these steps:

1. **Set Up Google Cloud Project:**
   - Create a project in the Google Cloud Console.
   - Obtain the `clientId` and `clientSecret` for authentication.

2. **Configure Discord Bot:**
   - Create a Discord bot account and obtain the bot token.
   - Invite the bot to your Discord server.

3. **Configuration:**
   - Clone the repository and navigate to the project directory.
   - Add the Google Drive folder IDs, Discord bot token, `clientId`, and `clientSecret` to the appropriate configuration files.

4. **Running the Bot:**
   - Start the bot using `node Beowulf-code.js` while being in the same directory.
  
5. **Setting it up:**
   - While it is running, go to `http://localhost:3000` in your browser, connect it with the account that contains the project.
   - The token should be initialized and now will not need any interference.

6. **Interacting with the Bot:**
   - Use the `!fileinfo` and `!last` commands in Discord to retrieve file status updates.
   - Other available commands include `!refreshtoken`, which manually refreshes the token incase something goes wrong.

## Configuration

In order to run Beowulf, you need to provide the following configurations:

- Google Drive Folder IDs: Specify the folder IDs for the folders you want to monitor.
- Discord Bot Token: Token obtained from Discord for your bot account.
- Google Cloud Project Credentials:
  - `clientId`: Client ID obtained from the Google Cloud Console.
  - `clientSecret`: Client secret obtained from the Google Cloud Console.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or improvements, feel free to submit a pull request or open an issue.

## License

This project is licensed under the [MIT License](LICENSE).

**Disclaimer:** Beowulf-Bot is a fan-made project and is not affiliated with or endorsed by Skullgirls or its developers.
