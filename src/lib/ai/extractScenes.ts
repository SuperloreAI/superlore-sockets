import axios from "axios";
type StoryElement = {
  type: string;
  attributes: { [key: string]: string };
  content: string;
};

interface ExtractedInfo {
  sid: string;
  textOverlay: string;
  visualDescription: string;
}

export function parseScenesFromScreenplay(
  input: string,
  elementTypes: string[]
): StoryElement[] {
  let cursor = 0;
  const storyElements: StoryElement[] = [];

  while (cursor < input.length) {
    const nextOpenTag = input.indexOf("<", cursor);
    const nextCloseTag = input.indexOf(">", cursor);

    if (nextOpenTag === -1 || nextCloseTag === -1) {
      break;
    }

    const tagContent = input.slice(nextOpenTag + 1, nextCloseTag).trim();
    const isClosingTag = tagContent[0] === "/";
    const type = tagContent.split(/\s+/)[0].replace("/", "");

    if (isClosingTag || !elementTypes.includes(type)) {
      cursor = nextCloseTag + 1;
      continue;
    }

    const tagAttributes = tagContent.match(/\w+=[^\s>]+/g) || [];
    const attributes: { [key: string]: string } = {};

    for (const attribute of tagAttributes) {
      const [key, value] = attribute.split("=");
      attributes[key] = value.replace(/[\[\]]/g, "");
    }

    const contentStart = nextCloseTag + 1;
    const contentEnd = input.indexOf(`</${type}>`, contentStart);

    const content = input.slice(contentStart, contentEnd).trim();

    cursor = contentEnd + type.length + 3;

    storyElements.push({ type, attributes, content });
  }

  return storyElements;
}

export function extractSceneInfo(
  storyElements: StoryElement[]
): ExtractedInfo[] {
  const extractedInfo: ExtractedInfo[] = [];

  for (let i = 0; i < storyElements.length; i++) {
    if (storyElements[i].type === "TextOverlay") {
      const textOverlay = storyElements[i].content;
      const sid = storyElements[i].attributes.sid;

      if (
        i + 1 < storyElements.length &&
        storyElements[i + 1].type === "VisualDescription"
      ) {
        const visualDescription = storyElements[i + 1].content;

        extractedInfo.push({ sid, textOverlay, visualDescription });
      }
    }
  }

  return extractedInfo;
}

export const getVideosByCue = async (cur: string) => {
  const serviceEndpoint = process.env.DATABASE_NODE_SERVER;
  try {
    const { data } = await axios({
      method: "post",
      url: `${serviceEndpoint}/api/query-vectors/search-scenes`,
      data: {
        query: cur,
      },
    });
    return data.map((s: any) => ({
      id: s.id,
      url: s.url,
      thumbnail: s.thumbnail,
    }));
  } catch (e) {
    console.log(e);
    throw e;
  }
};
