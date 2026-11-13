import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { initialCommunities } from "../config/communityRegistry";
import { loadCommunities, saveCommunities, loadHistory, saveHistory } from "../utils/storage";

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [communities, setCommunitiesState] = useState(initialCommunities);
  const [history, setHistory] = useState(loadHistory);
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem("community-hub.selected"));
  const [storageError, setStorageError] = useState("");
  const [ready, setReady] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    let active = true;
    const refresh = () => loadCommunities().then((stored) => {
      if (!active) return;
      setCommunitiesState(stored);
      setReady(true);
    });
    refresh();
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("community-hub-updates");
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "communities-updated") refresh();
      };
    }
    const onStorage = (event) => {
      if (event.key === "community-hub.communities.v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const setCommunities = useCallback((next) => {
    setCommunitiesState(next);
    setStorageError("Saving template changes…");
    return saveCommunities(next).then(
      () => {
        setStorageError("");
        channelRef.current?.postMessage({ type: "communities-updated" });
      },
      (error) => {
        const message = error.message || "Community settings could not be saved in this browser.";
        setStorageError(message);
        throw error;
      },
    );
  }, []);

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
    storageError,
    ready,
    selectedCommunity: communities.find((community) => community.id === selectedId) || communities[0] || null,
    selectedId,
    selectCommunity,
  }), [communities, history, selectedId, storageError, ready, setCommunities]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used within CommunityProvider.");
  return context;
}
