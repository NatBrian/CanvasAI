# **App Name**: CanvasAI

## Core Features:

- Main UI: Renders a p5.js canvas for game display, and includes user input (prompt) and settings (API key) controls.
- API Key Management: Persists user's Gemini API key in local storage.
- Iterative Code Generation: Uses Gemini API to generate and iteratively modify p5.js game code based on user prompts.
- Dynamic Reloading: Hot-reloads p5.js game sketch based on updated code, and gracefully displays an error message if something goes wrong.
- Controls: Games include touch and keyboard support for control.

## Style Guidelines:

- Primary color: Slate blue (#7A89B3), evoking creativity.
- Background color: Off-white (#F5F4F9), which contrasts enough with dark text, but is still light.
- Accent color: Muted purple (#927FB3) for active states.
- Body and headline font: 'Inter' sans-serif for a neutral, contemporary design.
- Simple, geometric icons for settings and interactions.
- Clean, spacious layout to focus on the p5.js canvas and user input, in a responsive, single-page design.
- Subtle transition animations during game reloading and state changes.