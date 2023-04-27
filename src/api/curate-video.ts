import {
  extractSceneInfo,
  getVideosByCue,
  parseScenesFromScreenplay,
} from "@/lib/ai/extractScenes";
import { generateVideoScript } from "@/lib/ai/langchain";

// const genesisPrompt =
//   "write me 10 different scripts for a korean BBQ restaurants TikTok. please have them be diverse and viral with good hooks.";

// const createdPrompts = `/**
// * Script 1: "Secret Sauce Challenge"
// Hook: "Can you guess our secret sauce ingredient?"
// Description: Challenge customers to guess the secret ingredient in the restaurant's BBQ sauce. Record their reactions as they taste the sauce and make their guesses.

// Script 2: "BBQ Dance Off"
// Hook: "When Korean BBQ meets dance battles! 🔥"
// Description: Employees and customers have a dance-off while grilling their BBQ. The winner gets a discount on their meal.

// Script 3: "Grill Master Showdown"
// Hook: "Who will be the ultimate Grill Master? 🏆"
// Description: Host a competition between two customers, each grilling their own Korean BBQ. Other customers vote on who did it better.

// Script 4: "K-Pop BBQ Party"
// Hook: "Join our K-Pop BBQ party! 🎉"
// Description: Host a K-Pop themed night at the restaurant with K-Pop music and dancing. Record the fun atmosphere and happy customers.

// Script 5: "Spicy Food Challenge"
// Hook: "Can you handle the heat? 🌶️"
// Description: Dare customers to try the spiciest dish on the menu. Record their reactions as they attempt to conquer the spice.

// Script 6: "BBQ Food Art"
// Hook: "Unleashing our inner Picasso! 🎨"
// Description: Customers create food art with their BBQ meats and vegetables. Share the most creative and impressive designs.

// Script 7: "Speed Grilling"
// Hook: "How fast can you grill? ⏱️"
// Description: Have customers race to cook their BBQ dishes as quickly as possible. Share the most impressive time records.

// Script 8: "BBQ Taste Test"
// Hook: "Can you guess the meat? 🍖"
// Description: Blindfold customers and have them guess which type of meat they're tasting (pork, beef, or chicken). Record their reactions and guesses.

// Script 9: "Korean BBQ 101"
// Hook: "Master the art of Korean BBQ! 🥢"
// Description: Teach viewers the basics of Korean BBQ, including essential ingredients, cooking techniques, and popular dishes. Share mouth-watering footage of the food being prepared.

// Script 10: "International BBQ Fusion"
// Hook: "Korean BBQ meets the world! 🌍"
// Description: Showcase dishes that combine Korean BBQ with other popular cuisines, like Korean BBQ tacos, kimchi burgers, or bulgogi pizza. Share the process of making these unique dishes and customers' reactions.
// */`;

// const synopsis = `Script 10: "International BBQ Fusion" Hook: "Korean BBQ meets the world! 🌍Description: Showcase dishes that combine Korean BBQ with other popular cuisines, like Korean BBQ tacos, kimchi burgers, or bulgogi pizza. Share the process of making these unique dishes and customers' reactions.`

// GET /storytime
export const generateCuratedVideo = async (synopsis: string) => {
  /**
   * Synopsis = `
Script 10: "International BBQ Fusion"
Hook: "Korean BBQ meets the world! 🌍"
Description: Showcase dishes that combine Korean BBQ with other popular cuisines, like Korean BBQ tacos, kimchi burgers, or bulgogi pizza. Share the process of making these unique dishes and customers' reactions.
   * `
   */
  console.log(`Creating screenplay...
  
  
  
  --------------`);
  const screenplay = await generateVideoScript(synopsis);
  console.log(screenplay);

  // Screenplay:
  // const story = `<Story>
  // <Scene sid=1>
  //   <TextOverlay sid=1>text goes here</TextOverlay>
  //   <VisualDescription sid=1>visual description goes here</VisualDescription>
  // </Scene>
  // <Scene sid=2>
  //   <TextOverlay sid=2>text goes here</TextOverlay>
  //   <VisualDescription sid=2>visual description goes here</VisualDescription>
  // </Scene>
  // </Story>`;

  console.log(`----------- SCREENPLAY CREATED ----------`);
  const parsedScenes = await parseScenesFromScreenplay(screenplay, [
    "TextOverlay",
    "VisualDescription",
  ]);
  console.log(parsedScenes.length);
  console.log(`-------------- PARSED SCENES -----------`);
  const sceneInfos = extractSceneInfo(parsedScenes);
  console.log(sceneInfos);
  const videoScenes = await Promise.all(
    sceneInfos.map(async (scene) => {
      const raws = await getVideosByCue(scene.visualDescription);
      return {
        ...scene,
        raws,
      };
    })
  );
  console.log(`-------------- VIDEO SCENES -----------`);
  // console.log(videoScenes);
  return videoScenes;
};
