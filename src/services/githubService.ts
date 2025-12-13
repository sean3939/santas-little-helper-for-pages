export const fetchGithubActivity = async (username: string): Promise<string> => {
  try {
    const cleanUsername = username.replace('@', '').trim();
    
    // Parallel fetch for speed
    const [profileRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${cleanUsername}`),
      fetch(`https://api.github.com/users/${cleanUsername}/events?per_page=100`)
    ]);

    if (!profileRes.ok) throw new Error("GitHub user not found");
    
    const profile = await profileRes.json();
    const events = await eventsRes.json();

    // Prune Profile (Santa doesn't need avatar URLs)
    const prunedProfile = {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      company: profile.company,
      blog: profile.blog,
      public_repos: profile.public_repos,
      followers: profile.followers,
      created_at: profile.created_at
    };

    // Prune Events (Just keep the juice)
    const prunedEvents = Array.isArray(events) ? events.map((e: any) => ({
      type: e.type,
      repo: e.repo?.name,
      created_at: e.created_at,
      payload_summary: extractPayloadSummary(e)
    })) : [];

    return JSON.stringify({
      source: "GitHub",
      profile: prunedProfile,
      recent_activity: prunedEvents
    }, null, 2);

  } catch (error) {
    console.error("GitHub Fetch Error:", error);
    throw new Error("Could not check the code repository. Is the username correct?");
  }
};

const extractPayloadSummary = (event: any) => {
  // Extract meaningful text based on event type
  if (event.type === 'PushEvent') {
    return event.payload?.commits?.map((c: any) => c.message).join(' | ');
  }
  if (event.type === 'IssuesEvent' || event.type === 'PullRequestEvent') {
    const action = event.payload?.action;
    const title = event.payload?.issue?.title || event.payload?.pull_request?.title;
    return `${action}: ${title}`;
  }
  if (event.type === 'IssueCommentEvent') {
    return `commented: ${event.payload?.comment?.body?.substring(0, 100)}...`;
  }
  return null;
};