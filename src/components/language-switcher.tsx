'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
    document.cookie = `NEXT_LOCALE=${lang === 'vi' ? 'en' : 'vi'}; path=/`;
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2 mx-2 min-w-[8rem]">
      <Image src={`/flags/${lang}.svg`} width={32} height={32} alt="flags" />
    </div>
  );
}
