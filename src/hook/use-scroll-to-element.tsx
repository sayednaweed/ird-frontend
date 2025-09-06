import { useEffect, useState } from "react";

const useScrollToElement = (error: Map<string, string>) => {
  const [errorCopy, setErrorCopy] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    if (!areMapsEqual(error, errorCopy)) {
      setErrorCopy(new Map(error));
      const firstKey = error.keys().next().value;
      const element = document.querySelector(`[name="${firstKey}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth", // Smooth scrolling
          block: "center", // Align at the top of the viewport
        });
      }
    }
  }, [error]);
};

export { useScrollToElement };

function areMapsEqual(
  map1: Map<string, string>,
  map2: Map<string, string>
): boolean {
  if (map1.size !== map2.size) return false;
  for (const [key, value] of map1.entries()) {
    if (map2.get(key) !== value) return false;
  }

  return true;
}
