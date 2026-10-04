import { createStore, del, entries, get, set } from "idb-keyval";

export type Photo = { id: string; blob: Blob; at: number };

// Photos live in IndexedDB: blobs are too big for the localStorage-backed zustand persist.
const photos = createStore("iphone-photos", "photos");
const meta = createStore("iphone-meta", "meta");

export async function listPhotos(): Promise<Photo[]> {
  const all = await entries<string, Photo>(photos);
  return all.map(([, photo]) => photo).sort((a, b) => b.at - a.at);
}

export async function savePhoto(blob: Blob, at = Date.now()): Promise<Photo> {
  const photo = { id: crypto.randomUUID(), blob, at };
  await set(photo.id, photo, photos);
  return photo;
}

export const deletePhoto = (id: string) => del(id, photos);

const seeding = new Map<string, Promise<void>>();

/** Runs `seed` once per browser (e.g. sample photos). Memoised so StrictMode's double effects don't seed twice. */
export function seedOnce(key: string, seed: () => Promise<void>): Promise<void> {
  const running = seeding.get(key);
  if (running) return running;
  const job = (async () => {
    if (await get(key, meta)) return;
    await seed();
    await set(key, true, meta);
  })();
  seeding.set(key, job);
  return job;
}
