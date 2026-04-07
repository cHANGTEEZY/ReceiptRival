import { createContext } from "react";

export const TabBarContext = createContext<{
  setIsTabBarHidden: (hidden: boolean) => void;
}>({
  setIsTabBarHidden: () => {},
});
