# Sui Wallet Tracker - Telegram MiniApp

A Telegram MiniApp that allows users to track wallet addresses and assets on the Sui blockchain without requiring wallet connection.

## Features

- Add wallet addresses manually
- Scan QR codes to add wallet addresses
- Track Sui assets in added wallets
- View transaction history
- Monitor token balances and NFTs
- View detailed NFT information

## Technology Stack

- Frontend: HTML, CSS, JavaScript, Telegram MiniApp SDK
- Blockchain: Sui Network API
- Storage: Local storage for wallet addresses

## Project Structure

```
tracker/
├── frontend/                  # Frontend MiniApp code
│   ├── index.html            # Main entry point
│   ├── css/                  # Styling
│   ├── js/                   # JavaScript code
│   │   ├── app.js           # Main application logic
│   │   ├── telegram.js      # Telegram MiniApp integration
│   │   ├── wallet.js        # Wallet management
│   │   └── sui.js           # Sui blockchain data fetching
│   └── assets/              # Images and other static assets
└── README.md                 # Project documentation
```

## Telegram Bot Setup

### Bot Information
- **Bot Token:** `7830993411:AAEhMOgc9Y5f7S3cyKdUPS2uEQC1yrXx-ew`
- **Bot Username:** Contact @BotFather to get your bot's username

### Setting Up the MiniApp

1. **Host the Frontend Files:**
   - Deploy the contents of the `frontend` directory to a web server with HTTPS support
   - You can use services like GitHub Pages, Netlify, or Vercel for free hosting

2. **Configure the Bot with BotFather:**
   - Open Telegram and search for @BotFather
   - Send the command `/mybots` and select your bot
   - Click on "Bot Settings" > "Menu Button" > "Configure Menu Button"
   - Set the button text (e.g., "Open Wallet Tracker")
   - Set the URL to your hosted frontend (e.g., `https://your-domain.com/tracker/frontend/`)

3. **Add Web App to Bot Commands:**
   - In BotFather, select "Edit Commands"
   - Add a command like: `track - Open Sui Wallet Tracker`
   - Configure the command to open your web app

## Local Development

1. Clone this repository
2. Start a local server in the frontend directory:
   ```
   cd frontend
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser

## Testing in Telegram

1. Host the frontend files on a public HTTPS server
2. Configure your bot with BotFather to use the hosted URL
3. Open your bot in Telegram and start the MiniApp

## Development Notes

- The app currently uses mock data for development purposes
- To use real Sui blockchain data, set `useMockData: false` in `sui.js`
- The app works both in Telegram and in regular browsers (with fallbacks)

## Resources

- [Sui Developer Documentation](https://docs.sui.io/)
- [Telegram MiniApp Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
