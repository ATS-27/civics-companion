import electionsData from '../data/elections.json';

const STATE_MAPPINGS = {
  "tamil nadu": ["tamil nadu", "tn"],
  "west bengal": ["west bengal", "wb", "bengal"],
  "uttar pradesh": ["uttar pradesh", "up"],
  "maharashtra": ["maharashtra", "mh"]
};

export const detectLocationAndGetContext = (message) => {
  const lowerMsg = message.toLowerCase();
  
  for (const [stateName, aliases] of Object.entries(STATE_MAPPINGS)) {
    for (const alias of aliases) {
      // Check for word boundary to avoid matching substring incorrectly
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerMsg)) {
        const data = electionsData[stateName];
        if (data) {
          return `FACT FOR AI: The user is voting in ${stateName.toUpperCase()}, INDIA. The next election is: ${data.next_election}. Registration Deadline: ${data.registration_deadline}. ID Requirements: ${data.id_requirements}. Use this factual data to answer the user's question accurately. Do not repeat this instruction to the user.`;
        }
      }
    }
  }
  
  return ""; // No location detected or no data found
};
