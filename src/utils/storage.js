import { initialCommunities } from "../config/communityRegistry";

const COMMUNITY_KEY = "community-hub.communities.v1";
const HISTORY_KEY = "community-hub.history.v1";
const DATABASE_NAME = "community-hub";
const DATABASE_VERSION = 1;
const STORE_NAME = "settings";

let databasePromise;
let queuedCommunities;
let savePromise;

function openDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable."));
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error || new Error("Could not open browser storage."));
    request.onblocked = () => reject(new Error("Browser storage is blocked by another open tab."));
  }).catch((error) => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

function readFromDatabase(database) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(COMMUNITY_KEY);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error || new Error("Could not read community settings."));
  });
}

function writeToDatabase(database, value) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ key: COMMUNITY_KEY, value });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not save community settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving community settings was interrupted."));
  });
}

export async function loadCommunities() {
  try {
    const database = await openDatabase();
    const stored = await readFromDatabase(database);
    if (Array.isArray(stored)) return stored;
  } catch (error) {
    console.warn("IndexedDB is unavailable; trying the previous local configuration.", error);
  }

  try {
    const saved = localStorage.getItem(COMMUNITY_KEY);
    if (!saved) return initialCommunities;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Community configuration must be an array.");
    try {
      await saveCommunities(parsed);
      localStorage.removeItem(COMMUNITY_KEY);
    } catch (error) {
      console.warn("Could not migrate community settings to IndexedDB.", error);
    }
    return parsed;
  } catch (error) {
    console.error("Could not load local community configuration.", error);
    return initialCommunities;
  }
}

export function saveCommunities(communities) {
  queuedCommunities = communities;
  if (!savePromise) {
    savePromise = (async () => {
      while (queuedCommunities) {
        const latest = queuedCommunities;
        queuedCommunities = undefined;
        await persistCommunities(latest);
      }
    })().finally(() => {
      savePromise = undefined;
    });
  }
  return savePromise;
}

async function persistCommunities(communities) {
  try {
    const database = await openDatabase();
    await writeToDatabase(database, communities);
  } catch (databaseError) {
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communities));
    } catch (storageError) {
      throw new Error(`Browser storage is full or unavailable. The change remains visible for this session, but could not be saved (${storageError.message || databaseError.message}).`);
    }
  }
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
