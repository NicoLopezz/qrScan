"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { NextIntlClientProvider } from "next-intl";
import { type Locale, defaultLocale, locales } from "@/i18n/config";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

const messageCache: Partial<Record<Locale, Record<string, unknown>>> = {};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  const loadMessages = useCallback(async (loc: Locale) => {
    if (messageCache[loc]) {
      setMessages(messageCache[loc]!);
      return;
    }
    const msgs = (await import(`../../messages/${loc}.json`)).default;
    messageCache[loc] = msgs;
    setMessages(msgs);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    const initial = saved && locales.includes(saved) ? saved : defaultLocale;
    setLocaleState(initial);
    loadMessages(initial);
  }, [loadMessages]);

  const setLocale = useCallback(
    (loc: Locale) => {
      setLocaleState(loc);
      localStorage.setItem("locale", loc);
      document.documentElement.lang = loc;
      loadMessages(loc);
    },
    [loadMessages]
  );

  if (!messages) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
