export interface NameAndID {
  id: string;
  name: string;
}
export interface NameAndIDCache {
  key: IDBValidKey;
  data: NameAndID[];
  lang: string;
  expireAt: number;
}
