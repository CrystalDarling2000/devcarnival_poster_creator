import { initialCommunities } from "../config/communityRegistry";

const COMMUNITY_KEY = "community-hub.communities.v1";
const HISTORY_KEY = "community-hub.history.v1";

export function loadCommunities() {
  try {
    const saved = localStorage.getItem(COMMUNITY_KEY);
    if (!saved) return initialCommunities;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Community configuration must be an array.");
    return parsed;
  } catch (error) {
    console.error("Could not load local community configuration.", error);
    return initialCommunities;
  }
}

export function saveCommunities(communities) {
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communities));
}

export function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load poster history.", error);
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 12)));
}

export function clearLocalData() {
  localStorage.removeItem(COMMUNITY_KEY);
  localStorage.removeItem(HISTORY_KEY);
}
