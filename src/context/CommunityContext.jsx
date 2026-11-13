import { createContext, useContext, useMemo, useState } from "react";
import { loadCommunities, saveCommunities, loadHistory, saveHistory } from "../utils/storage";

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [communities, setCommunitiesState] = useState(loadCommunities);
  const [history, setHistory] = useState(loadHistory);
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem("community-hub.selected"));

  const setCommunities = (next) => {
    setCommunitiesState(next);
    saveCommunities(next);
  };

  const selectCommunity = (id) => {
    setSelectedId(id);
    localStorage.setItem("community-hub.selected", id);
  };

  const recordPoster = (entry) => {
    const next = [{ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...history].slice(0, 12);
    setHistory(next);
    saveHistory(next);
  };

  const value = useMemo(() => ({
    communities,
    setCommunities,
    history,
    recordPoster,
    selectedCommunity: communities.find((community) => community.id === selectedId) || communities[0] || null,
    selectedId,
    selectCommunity,
  }), [communities, history, selectedId]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used within CommunityProvider.");
  return context;
}
