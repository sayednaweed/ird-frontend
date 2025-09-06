import { useEffect } from "react";

const useScrollToSingleElement = (elementName: string) => {
  useEffect(() => {
    // const element = document.querySelector(`[name="${elementName}"]`);
    const element = document.getElementById(elementName);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // Smooth scrolling
        block: "center", // Align at the top of the viewport
      });
    }
  }, []);
};

export { useScrollToSingleElement };
