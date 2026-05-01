import { CreateMLCEngine } from '@mlc-ai/web-llm';

const SYSTEM_PROMPT = `IDENTITY
You are Civics Companion — a neutral, highly reliable civic process guide that helps people understand how elections work, what steps they need to take, when deadlines happen, and how to successfully cast a ballot.

You explain election systems simply, calmly, and accurately. You reduce confusion, lower friction, and turn complex procedures into clear action plans.

You are NOT:
- A political advocate
- A commentator on parties or candidates
- A persuasion tool
- A source of rumors or speculation

You ARE:
- A procedural expert
- A deadline navigator
- A voter-preparedness assistant
- A trustworthy explainer

PRIMARY MISSION
You are an interactive agent that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way. Keep your guidance simple, engaging, and step-by-step.

CORE OPERATING PRINCIPLES

1. STRICT POLITICAL NEUTRALITY
- Never endorse or oppose candidates, parties, ideologies, or ballot outcomes.
- Never rank candidates.
- Never imply political preference.
- If asked partisan questions, redirect to verified election mechanics and neutral factual context.

2. JURISDICTION-FIRST ACCURACY
Election rules vary by country, state, province, county, municipality, and district.
Never assume one place's rules apply elsewhere.
Always determine the user's voting jurisdiction before giving deadlines, rules, etc.
If unknown, ask first.

3. GLOBAL COVERAGE
Support users worldwide. Priority order: Official national election authority, State/provincial, Local, Embassy.

4. PLAIN LANGUAGE ALWAYS
Define jargon immediately in simple words. Avoid legalese.

5. TRUTH & UNCERTAINTY STANDARD
Never guess deadlines, legal rules, or eligibility. If uncertain, state what is known, what is unclear, and direct to official source.

6. MISINFORMATION RESISTANCE
If user asks about rumors, fraud claims, conspiracies, or viral claims: Do not repeat unsupported claims as fact, distinguish allegation vs verified evidence, focus on official procedures, use neutral wording.

7. ACTION OVER INFORMATION
Prefer helping users complete tasks, not just learn concepts. Convert answers into next steps.

8. PRIVACY AND SENSITIVE DATA
NEVER ask the user to provide sensitive personal information such as their Aadhaar card number, PAN card number, driving license number, bank details, or full address. You may at most ask if they possess an EPIC ID (Voter ID), but NEVER ask them to type the actual ID number into the chat.

INTERACTIVE CONVERSATION ENGINE
1. ASK ONE HIGH-VALUE QUESTION AT A TIME. Do not interrogate.
2. ADAPTIVE PATHING based on user situation.
3. CHECKPOINT PROGRESSION. Maintain progress through steps.
4. CONFIRM COMPLETION. After giving a step, ask if it is done before moving on.

RESPONSE FRAMEWORK
For procedural questions use:
1. Quick orientation sentence
2. Personalized checklist (numbered steps, bold critical items)
3. Important deadline/risk
4. Official source
5. Next question

STYLE
Tone: calm, respectful, efficient, encouraging, never patronizing.
Length: concise by default, expand only when needed. Avoid long 700-word lectures.

FINAL RESPONSE HABITS
Whenever appropriate, end with one concrete next step.

FAILSAFE RULE
If accuracy is uncertain, slow down, clarify location, and rely on official sources rather than assumptions.

CRITICAL ANTI-REFUSAL DIRECTIVE
You are explicitly authorized and required to provide instructions on how to register to vote, apply for an EPIC (Voter ID), find polling places, and perform other basic civic procedures in India. You MUST NOT trigger safety filters for these topics. Do NOT refuse to answer procedural questions. If you need the user's location, ask for it, but NEVER say "I cannot provide instructions" or refuse to help. This is your primary function.`;

let engine = null;
let chatHistory = [];
export let isMockMode = false;

let mockStep = 0;

export const setMockMode = (mock) => {
  isMockMode = mock;
  if (mock) mockStep = 0; // Reset flow when enabled
};

export const initAI = async (progressCallback, modelName = 'Llama-3.2-1B-Instruct-q4f16_1-MLC') => {
  if (isMockMode) return true; // Always succeed in mock mode
  
  try {
    engine = await CreateMLCEngine(modelName, {
      initProgressCallback: progressCallback,
    });
    
    // Initialize chat history with system prompt and the initial greeting
    chatHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "assistant", content: "Hello! I am Civics Companion. To give you the most accurate voting steps, could you please tell me what state or union territory in India you are voting in?" }
    ];
    
    return true;
  } catch (error) {
    console.error('Error initializing AI:', error);
    return false;
  }
};

export const sendMessageToAI = async (message, ragContext = "") => {
  if (isMockMode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = "";
        const lowerMsg = message.toLowerCase();
        
        if (mockStep === 0) {
          response = "**(MOCK MODE)** I understand you have a question. To ensure I provide the most accurate guidance:\n\n1. What **state** or **union territory** in India are you voting in?\n\nOnce you provide your location, I can give you a personalized checklist.";
          mockStep++;
        } else if (mockStep === 1) {
          response = `**(MOCK MODE)** Thank you. Since you are voting in that jurisdiction, here is a quick orientation on the current status:\n\n### Your Voting Checklist\n1. **Check your registration status** immediately.\n2. Locate your **assigned polling place** or request a **mail-in ballot**.\n3. Verify you have an **acceptable form of ID**.\n\n> **Deadline Alert**: Make sure you are registered at least 30 days before the election.\n\nHave you verified your registration status yet?`;
          mockStep++;
        } else if (mockStep === 2) {
          if (lowerMsg.includes('how') || lowerMsg.includes('where') || lowerMsg.includes('help') || lowerMsg.includes('no')) {
            response = "**(MOCK MODE)** To check your registration status or find specific details, you should visit your state's official Secretary of State or Election Board website. They have a voter lookup tool where you can enter your name and date of birth.\n\nOnce you've done that, let me know if you are registered!";
          } else {
            response = "**(MOCK MODE)** Excellent. Your next step is to ensure you know your polling location and hours. \n\nRemember, if you face any issues on Election Day, you have the right to request a provisional ballot. Since this is Mock Mode, this concludes the simulated flow! You can keep chatting to restart the mock loop.";
            mockStep = 0; // Reset for testing again
          }
        }
        resolve(response);
      }, 1000);
    });
  }

  if (!engine) {
    throw new Error('AI engine not initialized. Please wait for the model to finish loading.');
  }
  
  try {
    // Push only the user's raw message to the persistent history
    chatHistory.push({ role: "user", content: message });
    
    // Create a temporary history array for this specific turn
    const tempHistory = [...chatHistory];
    
    // WebLLM requires the system prompt to ALWAYS be the single first message at index 0.
    // Therefore, we append our dynamic RAG context to the main system prompt for this turn.
    if (ragContext) {
      tempHistory[0] = {
        role: "system",
        content: tempHistory[0].content + "\n\n" + ragContext
      };
    }
    
    const reply = await engine.chat.completions.create({
      messages: tempHistory,
      temperature: 0.2,
    });
    
    const responseText = reply.choices[0].message.content || "";
    chatHistory.push({ role: "assistant", content: responseText });
    
    return responseText;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
