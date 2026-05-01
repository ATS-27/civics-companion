# 🏛️ Civics Companion (India Edition)

An interactive, locally-running AI agent designed to help Indian citizens navigate the electoral process, understand timelines, and take action on civic duties like voter registration. 

This project prioritizes **Privacy, Accessibility, and Action**. It runs entirely in your web browser without requiring external API keys or sending your data to cloud servers.

## ✨ Key Features

- **100% Local & Private:** Powered by WebLLM running the `Llama-3.2-1B-Instruct` model locally via WebGPU. No API keys needed. Your data never leaves your browser.
- **RAG-Powered Accuracy:** Uses a local Retrieval-Augmented Generation (RAG) pipeline to inject real-time election dates and deadlines for specific states (e.g., Tamil Nadu, West Bengal, UP, Maharashtra) directly into the AI's context.
- **Interactive UI:** Replaces tedious manual typing with dynamic "Quick Action" dropdowns and chips for state selection and answering common questions.
- **Action-Oriented:** Automatically detects when users need to register and provides prominent, actionable links to the official Election Commission of India (ECI) Voters' Services Portal (NVSP Form 6).
- **Strict Privacy Guardrails:** The AI is strictly instructed to never request sensitive personal information like Aadhaar, PAN, or Bank Details in the chat.

## 🚀 Getting Started

### Prerequisites
- A modern web browser with WebGPU support (Chrome, Edge).
- Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ATS-27/civics-companion.git
   ```
2. Navigate to the project directory:
   ```bash
   cd civics-companion
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`. 
   > **Note:** On the first run, the application will download a ~1GB AI model directly into your browser's cache. Subsequent loads will be nearly instant.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, CSS Modules
- **AI Engine:** [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) (Running Llama-3.2 via WebGPU)
- **Icons:** Lucide React
- **Markdown:** marked, DOMPurify

## 💡 How It Works
1. **Location Detection:** The app intercepts user messages and scans them for Indian state names or abbreviations using regular expressions.
2. **Context Injection:** If a state is detected, the app pulls corresponding election data from a local JSON database and prepends it to the AI's system prompt for that specific conversational turn.
3. **Local Inference:** The AI processes the user's question alongside the factual system context to generate an accurate, localized response without hallucinating dates.

## 📄 License
This project is open-source. Feel free to fork and modify!
