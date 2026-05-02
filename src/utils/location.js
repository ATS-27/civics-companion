import electionsData from '../data/elections.json';

const STATE_MAPPINGS = {
  "andaman and nicobar islands": ["andaman and nicobar islands", "andaman", "nicobar"],
  "andhra pradesh": ["andhra pradesh", "ap", "andhra"],
  "arunachal pradesh": ["arunachal pradesh", "arunachal"],
  "assam": ["assam"],
  "bihar": ["bihar"],
  "chandigarh": ["chandigarh"],
  "chhattisgarh": ["chhattisgarh", "cg"],
  "dadra and nagar haveli and daman and diu": ["dadra and nagar haveli", "daman and diu", "dadra", "daman", "diu"],
  "delhi": ["delhi", "new delhi", "nct"],
  "goa": ["goa"],
  "gujarat": ["gujarat", "gj"],
  "haryana": ["haryana", "hr"],
  "himachal pradesh": ["himachal pradesh", "hp", "himachal"],
  "jammu and kashmir": ["jammu and kashmir", "j&k", "jammu", "kashmir"],
  "jharkhand": ["jharkhand", "jh"],
  "karnataka": ["karnataka", "ka"],
  "kerala": ["kerala", "kl"],
  "ladakh": ["ladakh"],
  "lakshadweep": ["lakshadweep"],
  "madhya pradesh": ["madhya pradesh", "mp"],
  "maharashtra": ["maharashtra", "mh"],
  "manipur": ["manipur"],
  "meghalaya": ["meghalaya"],
  "mizoram": ["mizoram"],
  "nagaland": ["nagaland"],
  "odisha": ["odisha", "orissa"],
  "puducherry": ["puducherry", "pondicherry"],
  "punjab": ["punjab", "pb"],
  "rajasthan": ["rajasthan", "rj"],
  "sikkim": ["sikkim"],
  "tamil nadu": ["tamil nadu", "tn"],
  "telangana": ["telangana", "ts", "tg"],
  "tripura": ["tripura"],
  "uttar pradesh": ["uttar pradesh", "up"],
  "uttarakhand": ["uttarakhand", "uk", "uttaranchal"],
  "west bengal": ["west bengal", "wb", "bengal"]
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
