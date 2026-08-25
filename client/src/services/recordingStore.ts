// IndexedDB Storage for Video & Audio Interview Recordings

const DB_NAME = 'CodeRoom_Recordings_DB';
const DB_VERSION = 1;
const STORE_NAME = 'interview_recordings';

export interface InterviewRecording {
  sessionId: string;
  roomId: string;
  blob: Blob;
  mimeType: string;
  durationMs: number;
  recordedAt: string;
  candidateName?: string;
  interviewerName?: string;
  problemName?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
        store.createIndex('roomId', 'roomId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecording(recording: InterviewRecording): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(recording);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save interview recording to IndexedDB:', err);
  }
}

export async function getRecording(sessionIdOrRoomId: string): Promise<InterviewRecording | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      // Try by sessionId key
      const req = store.get(sessionIdOrRoomId);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
          return;
        }

        // Try by roomId index
        try {
          const roomIndex = store.index('roomId');
          const roomReq = roomIndex.get(sessionIdOrRoomId);
          roomReq.onsuccess = () => resolve(roomReq.result || null);
          roomReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to fetch recording from IndexedDB:', err);
    return null;
  }
}

export async function getAllRecordings(): Promise<InterviewRecording[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
