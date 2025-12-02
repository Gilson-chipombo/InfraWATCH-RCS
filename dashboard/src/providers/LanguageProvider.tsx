"use client"

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react"
import { translations, Language, TranslationSchema } from "@/config/lang"

interface LanguageContextProps {
  lang: Language
  setLanguage: (lang: Language) => void
  language: TranslationSchema
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("pt")

  const language = useMemo(() => translations[lang], [lang])

  const t = (key: string): string => {
    const keys = key.split(".")
    let result: any = language
    for (const k of keys) result = result?.[k]
    return result || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage: setLang, language, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de LanguageProvider")
  }
  return context
}
