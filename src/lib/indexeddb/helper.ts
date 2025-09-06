export const dateExpired = (date: number): boolean => {
  const currentDate = Date.now();
  return currentDate > date;
};
export const generateExpireAt = (days: number): number => {
  const currentDate = Date.now();
  return currentDate + days * 24 * 60 * 60 * 1000;
};
