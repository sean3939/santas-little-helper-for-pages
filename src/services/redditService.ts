import { performDeepResearch } from './researchService';

export const fetchRedditActivity = async (username: string, apiKey: string): Promise<string> => {
  const cleanUsername = username.replace('u/', '').trim();
  const directUrl = `https://www.reddit.com/user/${cleanUsername}/overview.json?limit=100`;
  const proxyUrl = `/reddit-api/user/${cleanUsername}/overview.json?limit=100`;

  // Helper to process raw Reddit JSON
  const processRedditData = async (response: Response) => {
    if (!response.ok) {
        throw new Error(`Reddit API Error: ${response.status}`);
    }
    const data = await response.json();
    const children = data.data?.children || [];

    const activity = children.map((child: any) => {
      const item = child.data;
      const isComment = item.name.startsWith('t1_');
      
      return {
        type: isComment ? 'Comment' : 'Post',
        subreddit: item.subreddit_name_prefixed,
        title: item.title || null,
        body: item.body || item.selftext || "(Link/Image Post)",
        score: item.score,
        created_utc: new Date(item.created_utc * 1000).toISOString(),
        is_stickied: item.stickied
      };
    });

    return JSON.stringify({
      source: "Reddit",
      username: cleanUsername,
      recent_activity: activity
    }, null, 2);
  };

  try {
    // Step 1: Direct Fetch (Works if CORS allowed or via extensions)
    const response = await fetch(directUrl);
    return await processRedditData(response);

  } catch (directError) {
    console.warn("Direct Reddit fetch failed. Trying Proxy...", directError);
    
    try {
        // Step 2: Proxy Fetch (Works in Local Dev via Vite)
        const response = await fetch(proxyUrl);
        return await processRedditData(response);

    } catch (proxyError) {
        console.warn("Proxy Reddit fetch failed. Falling back to Gemini Research...", proxyError);
        
        // Step 3: Gemini Fallback (Google Search Grounding)
        // Pass the apiKey here for the research fallback
        try {
            const researchResult = await performDeepResearch(`Reddit user u/${cleanUsername} post history, comments, and reputation`, apiKey);
            return researchResult;
        } catch (fallbackError) {
            console.error("Reddit Fallback Error:", fallbackError);
            throw new Error("Could not check the karma score. Is the username correct?");
        }
    }
  }
};