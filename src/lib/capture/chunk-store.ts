/** Where a recording lives while it is being made. Chunks are appended as they
 *  arrive rather than held in memory, so a closed tab costs the last timeslice
 *  instead of the whole take (ADR 0006). Same-browser-same-device only. */

const DB_NAME = 'aod-capture';
const DB_VERSION = 1;
const RUNS = 'runs';
const CHUNKS = 'chunks';

export type ChunkKind = 'audio' | 'video';

export interface StoredRun {
  id: string;
  sessionId: number;
  startedAt: string;
  audioType: string;
  videoType: string;
}

function request<T>(source: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    source.onsuccess = () => resolve(source.result);
    source.onerror = () => reject(source.error ?? new Error('IndexedDB rejected the request.'));
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(RUNS)) db.createObjectStore(RUNS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(CHUNKS)) {
        db.createObjectStore(CHUNKS, { keyPath: ['runId', 'kind', 'seq'] });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error ?? new Error('IndexedDB would not open.'));
  });
}

async function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await work(db.transaction(store, mode).objectStore(store));
  } finally {
    db.close();
  }
}

export async function beginRun(run: StoredRun): Promise<void> {
  await withStore(RUNS, 'readwrite', (store) => request(store.put(run)));
}

export async function appendChunk(
  runId: string,
  kind: ChunkKind,
  seq: number,
  blob: Blob,
): Promise<void> {
  await withStore(CHUNKS, 'readwrite', (store) => request(store.put({ runId, kind, seq, blob })));
}

/** Every run this browser still holds, newest first. */
export async function listRuns(): Promise<StoredRun[]> {
  const rows = await withStore(RUNS, 'readonly', (store) => request(store.getAll()));
  return (rows as StoredRun[]).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** One run's chunks, in the order they were written. */
export async function readChunks(runId: string, kind: ChunkKind): Promise<Blob[]> {
  const range = IDBKeyRange.bound([runId, kind, -Infinity], [runId, kind, Infinity]);
  const rows = await withStore(CHUNKS, 'readonly', (store) => request(store.getAll(range)));
  return (rows as Array<{ seq: number; blob: Blob }>)
    .sort((a, b) => a.seq - b.seq)
    .map((row) => row.blob);
}

export async function runBytes(runId: string): Promise<number> {
  const [audio, video] = await Promise.all([readChunks(runId, 'audio'), readChunks(runId, 'video')]);
  return [...audio, ...video].reduce((total, blob) => total + blob.size, 0);
}

export async function dropRun(runId: string): Promise<void> {
  await withStore(RUNS, 'readwrite', (store) => request(store.delete(runId)));
  await withStore(CHUNKS, 'readwrite', (store) =>
    request(
      store.delete(IDBKeyRange.bound([runId, 'audio', -Infinity], [runId, 'video', Infinity])),
    ),
  );
}
