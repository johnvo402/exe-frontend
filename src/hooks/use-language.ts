import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLanguage = create<LangState>()(
  persist(
    (set) => ({
      lang: "vi",

      setLang: (lang: string | null) =>
        set(() => ({
          lang: lang || "vi",
        })),
    }),
    { name: "lang-storage" }
  )
);
