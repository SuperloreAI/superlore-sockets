import OpenAISingleton from "@/lib/ai/initOpenAI";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import axios from "axios";

const tikTokTemplate = `
Write a scene by scene video script for a TikTok video based on the below request.
Please provide the script in the following HTML-like format. sid means sceneID. Keep the video to max 20 seconds.

<Scene sid=[N]>
  <TextOverlay sid=[N]>text goes here</TextOverlay>
  <VisualDescription sid=[N]>visual description goes here</VisualDescription>
</Scene>

Please make sure you always close a scene with </Scene>

Request:
{userPrompt}
`;
const baseTikTokPrompt = new PromptTemplate({
  template: tikTokTemplate,
  inputVariables: ["userPrompt"],
});

export const generateVideoScript = async (userPrompt: string) => {
  console.log(`Retreiving the LLM model...`);
  const model = await OpenAISingleton.getOpenAIModel();
  const chain = new LLMChain({ llm: model, prompt: baseTikTokPrompt });
  console.log(`About to call it...`);
  try {
    console.log(userPrompt);
    const res = await chain.call({ userPrompt });
    console.log(res.text);
    return res.text;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
