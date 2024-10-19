import { useEffect, useState } from "react";

type ScreenSize = "sm" | "lg";

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize);

  function getScreenSize(): ScreenSize {
    return window.innerWidth >= 640 ? "lg" : "sm";
  }

  useEffect(() => {
    const handleResize = (): void => {
      setScreenSize(getScreenSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    screenSize,
    isSm: screenSize === "sm",
    isLg: screenSize === "lg",
  };
}
