# Air Liquide Educational Solar System Journey

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![Sonauto AI](https://img.shields.io/badge/Music_by-Sonauto_AI-purple)

An interactive educational experience for Air Liquide employees' children to explore the solar system and discover how the gases their parents work with exist throughout the universe! Built with the [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) and featuring an AI-generated song with synchronized planetary tours.

This demo showcases voice interaction with a 3D scene (built with [Spline](https://spline.design/)), [Function Calling](https://platform.openai.com/docs/guides/realtime-model-capabilities#function-calling), and [Sonauto AI](https://sonauto.ai/) music generation integration.

![screenshot](./public/screenshot.jpg)

## ✨ Special Features

🎵 **AI-Generated Educational Song**: A custom French song about the solar system and Air Liquide's gases, generated with Sonauto AI

🚀 **Synchronized Planetary Tour**: Camera automatically focuses on planets as they're mentioned in the song

🏭 **Air Liquide Educational Content**: Connects planetary atmospheres to the gases Air Liquide produces

🌍 **Multilingual Support**: French educational content for Air Liquide's international workforce

🎨 **Professional Branding**: Air Liquide logo and company-themed educational experience

## How to use

### Running the application

1. **Set up the APIs:**

   - **OpenAI API**: [Sign up for an account](https://platform.openai.com/signup) and get your API key from the [Quickstart](https://platform.openai.com/docs/quickstart)
   - **Sonauto API**: [Get your API key](https://sonauto.ai/developers) for AI music generation

2. **Clone the Repository:**

   ```bash
   git clone https://github.com/nfsrules/realtime-solar-system-trip.git
   cd realtime-solar-system-trip
   ```

3. **Set your API keys:**

   Create a `.env` file at the root of the project and add:
   ```bash
   OPENAI_API_KEY=<your_openai_api_key>
   SONAUTO_API_KEY=<your_sonauto_api_key>
   ```

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Run the app:**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

**Note:** The first time you load the app, the 3D scene may take a while to load. Subsequent loads will be faster due to caching.

### Starting a session

1. Wait for the page to load completely
2. Click the wifi icon in the top right corner to start a Realtime session
3. Once it turns green, you can start talking to the AI guide
4. Use the mic icon to toggle your microphone on/off
5. The wifi icon stops the session and resets the conversation

## 🎓 Educational Experience

### For Air Liquide Families

The AI guide welcomes children as "space explorers" and explains how their parents' work at Air Liquide connects to gases found throughout the solar system:

- **Oxygen**: "Your parents work with oxygen that helps people breathe in hospitals!"
- **Nitrogen**: "Air Liquide makes nitrogen that keeps food fresh - just like on Titan!"
- **Hydrogen**: "The hydrogen your parents work with powers clean cars - same gas that makes Jupiter huge!"
- **Helium**: "Air Liquide's helium fills balloons and cools MRI machines - it's also on the Sun!"
- **CO2**: "The CO2 Air Liquide captures helps make sodas fizzy - Mars and Venus are full of it!"

### Interactive Features

🪐 **Planet Focus**: Ask about any planet to automatically zoom in and learn about its atmospheric composition

🎵 **Musical Journey**: Say "play the song" to start the synchronized planetary tour with educational music

📊 **Data Visualization**: Ask questions with numbers to see interactive charts (bar charts, pie charts)

🌕 **Moon Exploration**: Ask about moons to see them appear in the scene

🛰️ **ISS Tracking**: Ask about the International Space Station to see its real-time position

👋 **Natural Conversation**: The AI understands when you're done and naturally resets the view

### Example Educational Flow

1. "Hello! Can you tell me about space?"
2. "I want to learn about Mars" → *Camera focuses on Mars, explains CO2 atmosphere*
3. "What about Jupiter?" → *Camera focuses on Jupiter, explains hydrogen/helium composition*
4. "Can you play the special song?" → *Starts synchronized musical tour of all planets*
5. "Show me Jupiter's moons" → *Galilean moons appear*
6. "Thank you!" → *Returns to full solar system view*

## 🎵 Song Features

- **AI-Generated Music**: Custom song created with Sonauto AI about planetary gases
- **French Lyrics**: Educational content in French for international Air Liquide families
- **Synchronized Tour**: Camera automatically follows the song, focusing on planets as mentioned
- **Smooth Fade-Out**: Professional audio experience with gentle fade ending
- **Educational Content**: Each verse teaches about different gases and Air Liquide's role

## 🛠️ Technical Implementation

### Supported Planets in 3D Scene
The Spline 3D scene supports: **Sun, Mercury, Earth, Mars, Jupiter, Saturn, Neptune, Pluto**

*Note: Venus and Uranus are not available in the current 3D scene and are automatically skipped in tours*

### API Integrations

- **OpenAI Realtime API**: Voice interaction and function calling
- **Sonauto AI**: Music generation for educational content
- **ISS API**: Real-time International Space Station position

### Key Files

- `lib/config.ts` - AI instructions and tool definitions
- `lib/planetary-tour.ts` - Synchronized camera movements
- `components/scene.tsx` - 3D scene interaction logic
- `app/api/song/route.ts` - Sonauto AI integration
- `lib/default-lyrics.ts` - Fallback French educational lyrics

## 🎨 Customization

### Updating the 3D Scene

Change the scene URL in `components/scene.tsx`:
```typescript
<Spline
  scene="https://prod.spline.design/<your_scene_id>/scene.splinecode"
  onLoad={onLoad}
/>
```

### Customizing Educational Content

- **Instructions**: Update `lib/config.ts` to change AI behavior
- **Company Branding**: Replace `public/logo-air-liquide.png` with your logo
- **Song Content**: Modify `lib/default-lyrics.ts` for different educational themes
- **Planetary Data**: Update atmospheric composition data in `lib/config.ts`

### Adding New Tools

Add new function definitions to `lib/config.ts` and handle them in `components/scene.tsx`:

```typescript
{
  name: "your_new_tool",
  description: "Description of what this tool does",
  parameters: {
    // Tool parameters
  }
}
```

## 🚀 Deployment

The app is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service. Make sure to set your environment variables:

- `OPENAI_API_KEY`
- `SONAUTO_API_KEY`

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

*Built with ❤️ for Air Liquide families to explore the wonders of space and science together!*