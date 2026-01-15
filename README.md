# Asteroid Bounce (Vue Port)

**Asteroid Bounce** is a modern Vue.js port of a DHTML Pong-style game engine originally written in **2009**, later adapted for the **Windows 8 / WinJS** platform, and now fully revived for the modern web.

What began as a college project evolved into a case study in **legacy code modernization**, **browser input handling**, and **game loop architecture** across multiple generations of web platforms.

This repository demonstrates how older JavaScript codebases can be **safely ported, stabilized, and modernized** without unnecessary rewrites.

---

## 🎮 Features

- Classic Pong-style gameplay with a modern widescreen layout (16:9)
- Keyboard controls (arrow keys) and mouse/touch input
- AI-controlled right paddle
- Dynamic ball speed escalation
- Retro sound effects
- Responsive board sizing with aspect-ratio enforcement
- Fully playable in modern browsers

---

## 🧠 Technical Highlights

This project intentionally preserves much of the original architecture to demonstrate **real-world porting challenges**, including:

- Legacy coordinate systems → modern DOM-relative math
- DHTML-era event handling → modern browser input normalization
- Manual game loop timing (`setTimeout`) instead of `requestAnimationFrame` (by design)
- Absolute positioning + collision detection using DOM measurements
- Asset path normalization for modern bundlers
- Fixing browser behaviors that did not exist in 2009 (scroll capture, focus, autoplay audio rules)

Rather than rewriting from scratch, the goal was to **adapt, not erase**, the original design.

---

## 🛠️ Tech Stack

- Vue.js (host framework)
- Vanilla JavaScript (game engine)
- HTML5 + CSS
- DOM-based rendering (no `<canvas>`)
- Audio via `<audio>` elements

No external game libraries were used.

---

## ⌨️ Controls

| Input | Action |
|------|--------|
| ↑ Arrow | Move left paddle up |
| ↓ Arrow | Move left paddle down |
| Mouse / Touch (left side) | Paddle up/down |
| Click / Tap | Start / Continue |
| Play/Pause button | Pause or resume |

---

## 🚀 Running the Project

```bash
npm install
npm run dev
```
Then open your browser to the local dev URL.
|
| Note: Audio playback requires user interaction due to modern browser autoplay restrictions.

## 📜 Project History

- **2009** – Original DHTML Pong engine written as a college project  
- **2012–2013** – Ported to WinJS during the Windows 8 app era  
- **2026** – Fully modernized and ported to Vue.js for the web  

This repo exists because **good code doesn’t expire — platforms do**.

---

## 🎯 Why This Project Exists

This project serves as a practical demonstration of:

- Legacy JavaScript maintenance  
- Porting UI-driven logic across platforms  
- Debugging coordinate math and collision systems  
- Adapting old assumptions to modern browser realities  
- Shipping a complete, playable artifact  

It is intentionally **not** a greenfield rewrite.

---

## 🔗 Related

- CodeProject article (coming soon)  
- Original Windows Store version (archived)

---

## 👤 Author

**David Cole**  
Senior Software Engineer  

Legacy systems • Debugging • Platform transitions • Game logic