export const fetchWikiContent = async (url: string): Promise<string> => {
  try {
    // Extract title from URL (e.g., https://en.wikipedia.org/wiki/Santa_Claus -> Santa_Claus)
    const titleMatch = url.match(/\/wiki\/([^#?]+)/);
    if (!titleMatch) {
      throw new Error("Invalid Wikipedia URL");
    }
    const title = titleMatch[1];

    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${title}&explaintext=1&origin=*`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    const pages = data.query?.pages;
    if (!pages) {
        throw new Error("No pages found");
    }

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") {
        throw new Error("Article not found");
    }

    const extract = pages[pageId].extract;
    return `Subject: ${pages[pageId].title}

Biography:
${extract}`;
  } catch (error) {
    console.error("Wiki Fetch Error:", error);
    throw new Error("Could not retrieve the Scroll of History (Wikipedia).");
  }
};