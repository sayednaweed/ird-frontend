// dbConfig.ts
export interface IDBConfigI {
  name: string;
  version: number;
  stores: { name: string; keyPath: string; autoIncrement: boolean }[];
}

export const dbConfigs: { [key: string]: IDBConfigI } = {
  cache_db: {
    name: "cache_db",
    version: 1,
    stores: [
      { name: "cmp", keyPath: "key", autoIncrement: true },
      { name: "api", keyPath: "key", autoIncrement: true },
    ],
  },
  chat_db: {
    name: "chat_db",
    version: 1,
    stores: [{ name: "chat", keyPath: "key", autoIncrement: true }],
  },
  download_chunks_db: {
    name: "download_chunks_db",
    version: 1,
    stores: [{ name: "chunks", keyPath: "key", autoIncrement: true }],
  },
};
