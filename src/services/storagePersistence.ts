export async function requestPersistentStorage(): Promise<boolean | undefined> {
  if (typeof navigator === "undefined") return undefined;

  const persist = navigator.storage?.persist;
  if (!persist) return undefined;

  try {
    return await persist.call(navigator.storage);
  } catch {
    return undefined;
  }
}
