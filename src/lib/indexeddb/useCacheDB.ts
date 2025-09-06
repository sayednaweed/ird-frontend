// useUserDB.ts
import type { NameAndID, NameAndIDCache } from "@/lib/indexeddb/types";
import { getNativeItem, removeNativeItem, updateNativeItem } from "./dbUtils"; // Adjust the path as needed
import { dateExpired, generateExpireAt } from "./helper";

const useCacheDB = () => {
  const getComponentCache = async (key: IDBValidKey): Promise<any> => {
    try {
      return await getNativeItem("cache_db", "cmp", key);
    } catch (error) {
      console.error("getComponentCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  const updateComponentCache = async (data: any) => {
    try {
      return await updateNativeItem("cache_db", "cmp", data);
    } catch (error) {
      console.error("updateComponentCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  const getChatCache = async (key: IDBValidKey): Promise<any> => {
    try {
      return await getNativeItem("cache_db", "chat", key);
    } catch (error) {
      console.error("getChatCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  const updateChatCache = async (data: any) => {
    try {
      return await updateNativeItem("cache_db", "chat", data);
    } catch (error) {
      console.error("updateChatCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  const getApiCache = async (
    key: IDBValidKey,
    lang: string
  ): Promise<NameAndID[] | undefined> => {
    try {
      const data = await getNativeItem("cache_db", "api", key);
      if (data) {
        const cached = data as NameAndIDCache;
        if (dateExpired(cached.expireAt) || lang != cached.lang) {
          await removeNativeItem("cache_db", "api", key);
          return undefined;
        }
        const content = JSON.parse(data.data) as NameAndID[];
        return content;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("getApiCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  const updateApiCache = async (data: NameAndIDCache) => {
    try {
      const content = JSON.stringify(data.data);
      const expireAt = generateExpireAt(data.expireAt);
      return await updateNativeItem("cache_db", "api", {
        key: data.key,
        data: content,
        expireAt: expireAt,
        lang: data.lang,
      });
    } catch (error) {
      console.error("updateApiCache Error: ", error);
      return undefined; // or handle as needed
    }
  };

  return {
    getComponentCache,
    updateComponentCache,
    getChatCache,
    updateChatCache,
    getApiCache,
    updateApiCache,
  };
};

export default useCacheDB;
