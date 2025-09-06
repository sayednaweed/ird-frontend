// dbUtils.ts
import { type IDBConfigI, dbConfigs } from "./dbConfig"; // Adjust the path as needed
const openDatabase = (config: IDBConfigI): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.name, config.version);
    const storeConfigs = config.stores;
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      storeConfigs.forEach((store) => {
        const exist = db.objectStoreNames.contains(store.name);
        if (!exist) {
          db.createObjectStore(store.name, {
            keyPath: store.keyPath,
            autoIncrement: store.autoIncrement,
          });
        }
      });
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const getDB = async (dbName: string): Promise<IDBDatabase> => {
  const config = dbConfigs[dbName];
  if (!config) throw new Error("Database configuration not found");

  return openDatabase(config);
};

export const addItem = async (
  dbName: string,
  storeName: string,
  item: any
): Promise<void> => {
  const db = await getDB(dbName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
export const updateNativeItem = async (
  dbName: string,
  storeName: string,
  item: any
): Promise<void> => {
  const db = await getDB(dbName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
export const getNativeItem = async (
  dbName: string,
  storeName: string,
  key: IDBValidKey
): Promise<any> => {
  const db = await getDB(dbName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
export const removeNativeItem = async (
  dbName: string,
  storeName: string,
  key: IDBValidKey
): Promise<void> => {
  const db = await getDB(dbName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key); // Delete item by key

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
