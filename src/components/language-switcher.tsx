"use client";
import { useLanguage } from "@/hooks/use-language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = (value: string) => {
    setLang(value);
    document.cookie = `NEXT_LOCALE=${value}; path=/`;
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2 mx-2 min-w-[8rem]">
      <Select value={lang} onValueChange={toggleLanguage}>
        <SelectTrigger className="w-fit min-w-[9.5rem] flex items-center">
          <SelectValue placeholder={lang === "en" ? "English" : "Tiếng Việt"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">
            <div className="flex items-center space-x-2">
              <Image
                src="/flags/en.svg"
                alt="English Flag"
                width={24}
                height={18}
              />
              <span>English</span>
            </div>
          </SelectItem>
          <SelectItem value="vi">
            <div className="flex items-center space-x-2">
              <Image
                src="/flags/vi.svg"
                alt="Vietnamese Flag"
                width={24}
                height={16}
              />
              <span>Tiếng Việt</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
