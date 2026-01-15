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

## 🧩 What Broke During the Port (and Why)

Porting this project to a modern browser stack surfaced several issues that were not bugs in the original implementation, but *assumptions tied to the era it was written in*.

### 1. Global Coordinate Assumptions
The original DHTML version relied heavily on `offsetLeft`, `offsetTop`, and window-relative mouse coordinates.

**Why it broke:**  
Modern layouts are responsive, nested, and often transformed. Window-relative input no longer maps cleanly to game-space.

**Fix:**  
All input and collision math was converted to **board-relative coordinates** using `getBoundingClientRect()`.

---

### 2. Fixed-Size Screen Expectations
The original game assumed a mostly fixed viewport and predictable aspect ratios.

**Why it broke:**  
Modern devices range from ultrawide monitors to mobile screens, and scrollable layouts introduce unexpected offsets.

**Fix:**  
The game board now enforces a **16:9 aspect ratio**, with clamped minimum and maximum widths and derived height.

---

### 3. Input Events Competing With the Browser
Arrow keys and mouse events were originally handled without considering default browser behavior.

**Why it broke:**  
Modern browsers aggressively bind keys (arrow keys scrolling, spacebar paging, etc.).

**Fix:**  
Input handling was tightened and normalized, and the game canvas now fully owns its input surface.

---

### 4. Audio Autoplay Restrictions
Sound effects were expected to play immediately on load or during game loop events.

**Why it broke:**  
Modern browsers require **explicit user interaction** before audio playback is allowed.

**Fix:**  
Audio initialization is deferred until the first user interaction.

---

### 5. Timing Model Drift
The original game loop used `setTimeout` with assumptions about consistent timing.

**Why it broke:**  
Modern browsers throttle timers aggressively, especially in background tabs.

**Fix:**  
The loop remains intentionally simple, but timing constants were adjusted and bounded to preserve gameplay feel.

---

### 6. Legacy Patterns That Aged Surprisingly Well
Not everything broke.

- Core collision math
- Paddle AI logic
- State transitions
- Separation of game logic from rendering

These survived largely intact, validating the original design.

---

### Takeaway

Most failures were not *bugs* — they were **environmental mismatches**.

This project demonstrates that long-lived software often fails not because it was poorly written, but because **the world around it changed**.

## 🏗️ Design Principles That Aged Well

Despite being written originally in 2009, several architectural decisions translated cleanly to modern environments with minimal change.

### 1. Clear Separation of Responsibilities
Game logic, rendering, input handling, and asset management were kept largely independent.

**Why it mattered:**  
This made it possible to modernize rendering and input layers without rewriting core gameplay logic.

---

### 2. Explicit Game State
The game loop passes state explicitly rather than relying on implicit global mutations.

**Why it mattered:**  
This allowed the game to pause, resume, and restore state cleanly — even across platform transitions.

---

### 3. Deterministic Collision Logic
Collision detection is based on explicit bounds and dimensions rather than frame-dependent heuristics.

**Why it mattered:**  
This logic remained correct across different resolutions, aspect ratios, and refresh rates.

---

### 4. Minimal Abstractions
The code avoids unnecessary indirection or overengineering.

**Why it mattered:**  
Fewer layers meant fewer assumptions tied to deprecated APIs, making the port more surgical than destructive.

---

### 5. Data-Driven Layout Math
Object sizes and positions are derived from board dimensions instead of hardcoded pixel values.

**Why it mattered:**  
This enabled smooth adaptation to widescreen and responsive layouts without rewriting gameplay rules.

---

### 6. Input as Intent, Not Position
The original design treated input as *directional intent* (up/down, left/right) rather than absolute positions.

**Why it mattered:**  
This made it easy to support keyboard, mouse, and touch inputs with shared logic.

---

### Takeaway

Good software architecture doesn’t depend on frameworks — it depends on **clarity of intent**.

The fact that these principles survived multiple platform shifts is not accidental; it is the result of designing systems, not scripts.

## 🧠 Why This Is Intentionally Not a Greenfield Rewrite

This project was deliberately **not** rewritten from scratch.

While a full rewrite may have been faster in the short term, it would have defeated the purpose of the exercise.

### The Goal Was Not Novelty
The goal was not to produce the most modern Pong implementation possible.

The goal was to:
- Preserve working logic
- Identify hidden assumptions
- Adapt real-world legacy code to modern constraints
- Ship something playable

---

### Greenfield Rewrites Hide Problems
Rewriting everything masks the very issues engineers are often paid to solve:
- Coordinate system drift
- Implicit timing assumptions
- Platform-specific input behavior
- Asset loading edge cases
- Browser security and autoplay restrictions

Fixing these issues **in-place** demonstrates understanding — not avoidance.

---

### Real Code Ages — And That’s Normal
Most production systems are:
- Evolved, not redesigned
- Patched, not replaced
- Carrying decisions made under different constraints

This project reflects how real software survives across time.

---

### Constraint-Driven Engineering
By keeping the original structure:
- Bugs became visible instead of disappearing
- Tradeoffs were explicit instead of abstract
- Fixes could be reasoned about instead of guessed

The resulting code is more honest — and more maintainable.

---

### Hiring Signal
This repository is not a showcase of trendy tools.

It is a demonstration of:
- Judgment over novelty
- Understanding over refactoring theater
- Shipping over perfection

If you can maintain and modernize legacy code, you can build anything.

---

### Takeaway

Greenfield projects are easy.

**Keeping something alive across platforms, APIs, and decades is the real work.**

## 📚 Lessons Learned Porting Legacy JavaScript in 2026

Porting JavaScript written in 2009–2013 to a modern framework and browser environment surfaced lessons that are difficult to learn in greenfield projects.

These are not theoretical — they were discovered through breakage.

---

### 1. Coordinate Systems Are Never “Global” Anymore
Legacy code often assumes:
- `window` == game surface
- `clientX / clientY` == usable input coordinates
- Fixed aspect ratios

Modern layouts are:
- Responsive
- Nested
- Scrollable
- Device-scaled

**Lesson:** Always convert input to *board-relative* coordinates using bounding rectangles.

---

### 2. Timing Assumptions Don’t Survive Modern Browsers
Older code assumes:
- Consistent `setTimeout` execution
- No background tab throttling
- Predictable frame cadence

Modern browsers:
- Throttle timers
- Pause inactive tabs
- Prioritize battery and responsiveness

**Lesson:** Game loops must tolerate irregular timing, not depend on it.

---

### 3. Audio Is Now a Privileged Action
In 2009:
- Audio could autoplay freely

In 2026:
- Audio requires explicit user interaction
- Playback can silently fail if triggered incorrectly

**Lesson:** Sound systems must be defensive and user-gesture-driven.

---

### 4. DOM Measurement Is Expensive — Cache It Thoughtfully
Repeated calls to:
- `offsetWidth`
- `offsetHeight`
- `getBoundingClientRect()`

Can cause layout thrashing on modern browsers.

**Lesson:** Measure once per frame when possible and reuse values.

---

### 5. Input Is No Longer Just Keyboard and Mouse
Legacy input models assumed:
- Keyboard focus
- Mouse-only interactions
- Desktop-first behavior

Modern users expect:
- Touch support
- Click + tap parity
- No accidental page scrolling

**Lesson:** Input must be abstracted and normalized across devices.

---

### 6. Legacy Patterns Can Still Be Correct
Despite its age, the original code:
- Used clear object boundaries
- Kept logic readable
- Avoided premature abstraction

**Lesson:** Code written with clarity often outlives frameworks.

---

### 7. Modernization Is About Alignment, Not Replacement
The biggest improvements came from:
- Aligning assumptions with reality
- Adjusting inputs and outputs
- Respecting the original structure

Not from:
- Rewriting everything
- Introducing heavy abstractions

**Lesson:** Most legacy code doesn’t need to be replaced — it needs to be *understood*.

---

### Final Thought

Porting legacy JavaScript is not about nostalgia.

It is about learning how systems fail, adapt, and survive.

The web changed.
The code adapted.
The game still plays.

## 🚀 How This Approach Scales Beyond Games

Although this project is a Pong-style game, the techniques used during the port apply directly to real-world software systems.

The same forces that break legacy games also break enterprise applications.

---

### 1. Legacy Code Exists Everywhere
Most production systems are not greenfield:
- Internal tools
- Admin dashboards
- Monitoring UIs
- Line-of-business applications
- Customer-facing portals

**The challenge is rarely writing new code.  
The challenge is integrating old assumptions into new environments.**

---

### 2. Event-Driven Systems Age Better Than Tight Coupling
This project relied on:
- Event listeners
- Explicit state transitions
- Decoupled input handling

These patterns translate directly to:
- Reactive UIs
- Micro-frontends
- Distributed systems
- Message-driven architectures

**Lesson:** Systems that respond to events adapt more easily than systems that assume control.

---

### 3. Visual Bugs Reveal Architectural Problems
Games make failure obvious:
- Objects disappear
- Physics break
- Input feels wrong

Enterprise software hides the same problems behind:
- “Weird edge cases”
- “Occasional glitches”
- “Hard-to-reproduce bugs”

**Lesson:** Games are honest systems — they expose architectural mistakes immediately.

---

### 4. Incremental Refactoring Beats Big Rewrites
This port succeeded because:
- Behavior was preserved
- Changes were localized
- Assumptions were corrected one at a time

This mirrors successful modernization efforts in:
- Legacy web platforms
- Monolith-to-module transitions
- Framework migrations

**Lesson:** Stability comes from continuity, not reinvention.

---

### 5. Separation of Concerns Still Wins
The original design separated:
- Rendering
- Input
- State
- Rules

That separation made it possible to:
- Swap environments
- Adjust timing models
- Fix input without breaking gameplay

**Lesson:** Good boundaries age better than trendy patterns.

---

### 6. Debuggability Is a Feature
This codebase is:
- Readable
- Inspectable
- Behaviorally traceable

That matters in:
- Incident response
- On-call rotations
- Performance investigations
- Root cause analysis

**Lesson:** Software that can be understood under pressure is professional software.

---

### 7. The Same Skills Transfer Directly
The skills exercised here apply to:
- Framework migrations
- Browser compatibility issues
- Mobile-to-web ports
- Desktop-to-web transitions
- Long-lived enterprise platforms

**Lesson:** The ability to safely move systems forward is more valuable than the ability to start over.

---

### Final Thought

Games do not trivialize engineering problems.

They concentrate them.

If you can port a legacy game correctly, you can modernize almost anything.

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
- Original Windows Store version (archived - however the legacy files are included in their original form in this repository for reference)

---

## 👤 Author

**David Cole**  
Senior Software Engineer  

Legacy systems • Debugging • Platform transitions • Game logic

## 📄 License

This project is licensed under the MIT License — see the [LICENSE.md](LICENSE.md) file for details.