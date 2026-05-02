# Civics Companion 🇮🇳

Civics Companion is a premium, privacy-first AI assistant designed to guide citizens through the complexities of the Indian electoral process. Built for the modern voter, it provides localized, neutral, and accurate information entirely within the browser.

## 🏛️ Chosen Vertical: Civics & Democratic Participation
We chose the **Civics** vertical, specifically focusing on **Indian Elections**. Democracy thrives when citizens can easily navigate registration, understand their local schedules, and cast their ballots with confidence. Civics Companion turns complex procedural manuals into an interactive, supportive conversation.

## 🧠 Approach and Logic
Our approach prioritizes **Privacy** and **Contextual Accuracy**:
- **Privacy-First (Local LLM)**: By leveraging `@mlc-ai/web-llm`, we run the AI model (Llama-3.2) directly on the user's device using WebGPU. No conversation data or Personal Identifiable Information (PII) is sent to a server.
- **RAG (Retrieval-Augmented Generation)**: We use a state-aware logic engine to detect the user's location. This context is then injected into the AI's prompt to provide hyper-local election dates and registration rules sourced from verified data.
- **Strict Neutrality**: The system is hard-coded with constitutional principles of neutrality, refusing to engage in political advocacy or candidate ranking.

## ⚙️ How the Solution Works
1. **Landing Experience**: A sleek, premium landing page introduces the user to the app's core value propositions (Privacy, Location-Awareness, Accuracy).
2. **Location Detection**: As the user chats, the `location.js` utility parses messages for any mention of the 36 Indian states or UTs.
3. **Prompt Injection**: Once a location is identified, the app retrieves the specific election metadata (next election date, registration links) from `elections.json` and silently updates the AI's system prompt.
4. **Interactive Actions**: The UI dynamically renders "Quick Actions" like state-selection dropdowns or one-click links to the NVSP portal based on the AI's current guidance.

## 🛠️ Technology Stack
- **Frontend**: React (Vite)
- **AI Engine**: WebLLM (running Llama-3.2 1B locally)
- **Icons & UI**: Lucide-React + Vanilla CSS (Glassmorphism design)
- **Security**: DOMPurify for safe markdown rendering

## 📝 Assumptions Made
- **Hardware Support**: We assume the user's browser supports WebGPU (Chrome/Edge 113+) for the local LLM to run efficiently.
- **Data Freshness**: The app assumes the current assembly terms and election dates (sourced from Indian Express/ECI) remain the primary source of truth until the next sync.
- **Network for Setup**: While the AI runs locally, an initial ~1GB download is required to cache the model in the browser's storage.

## 🚀 Getting Started
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Ensure your browser supports WebGPU for the full AI experience.

---
*Built with ❤️ for a stronger democracy.*
