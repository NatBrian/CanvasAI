# CanvasAI

CanvasAI is an interactive 2D game development sandbox that allows you to create and modify games using the power of Google's Gemini AI. Just describe the game you want to build, and watch it come to life on the canvas in real-time.

To get started, you will need a Google Gemini API key. All AI processing happens on the server.

## Features

- **AI-Powered Game Generation:** Create new p5.js games from a simple text prompt.
- **Iterative Development:** Modify your game by giving new instructions to the AI.
- **Real-Time Canvas:** See your game updates instantly.
- **Simple & Clean UI:** A minimalist interface to keep you focused on creating.

## Getting Started

### 1. Get a Gemini API Key

You need a Google Gemini API key to use this application.

1.  Visit the [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google account.
3.  Click on **"Get API key"** in the top left corner.
4.  Create a new API key in a new or existing Google Cloud project.
5.  Copy your new API key.

### 2. Set up your Environment

1.  Create a file named `.env` in the root of the project.
2.  Add your API key to the `.env` file like this:
    ```
    GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
    ```
3.  Replace `YOUR_API_KEY_HERE` with the key you copied from Google AI Studio.

### 3. Using CanvasAI

1.  Run the application.
2.  Type a description of a game you want to create (e.g., "A simple pong game") into the text box.
3.  Click **"Generate Game"**.
4.  The AI will generate the code and your game will appear on the canvas.
5.  To change the game, type a new prompt (e.g., "make the ball faster") and click **"Update Game"**.

Enjoy creating!
