import { generateVideoScript } from "@/lib/ai/langchain";
import dotenv from "dotenv";

dotenv.config();

// npx ts-node --project tsconfig.scripts.json -r tsconfig-paths/register ./src/scripts/prompt.ts

// const userPrompt = `generate a video for an electric motorcycle company highlighting the three main benefits:

//   1. Very affordable to buy
//   2. Zero maintenance
//   3. Environmentally friendly

//   Set the scene to be a coastal highway between the mountains and sea

// `;

const userPrompt = `generate a video for a korean bbq resturant with the following benefits highlighted

  1. High quality beef
  2. Clean and modern interior
  3. 4.6 stars on google reviews


  Set the scene to focus on a group of friends enjoying a meal together

`;

const run = async () => {
  await generateVideoScript(userPrompt);
};

run();
