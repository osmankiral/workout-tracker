"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

const flags = {
  tr: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-5 h-5 rounded-full object-cover">
      <rect width="1200" height="800" fill="#E30A17"/>
      <circle cx="425" cy="400" r="200" fill="#fff"/>
      <circle cx="475" cy="400" r="160" fill="#E30A17"/>
      <polygon points="583.334,400 758.658,456.965 650.297,307.821 650.297,492.179 758.658,343.035" fill="#fff"/>
    </svg>
  ),
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-5 rounded-full object-cover">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  )
}

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Language')

  const onSelectChange = (nextLocale: string) => {
    router.replace(pathname, {locale: nextLocale})
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="w-9 h-9 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
        >
          <motion.div
            key={locale}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-full h-full"
          >
            {flags[locale as keyof typeof flags]}
          </motion.div>
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem 
          onClick={() => onSelectChange("tr")} 
          disabled={locale === "tr"}
          className="gap-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
            {flags.tr}
          </div>
          <span className="font-medium">Türkçe</span>
          {locale === "tr" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSelectChange("en")} 
          disabled={locale === "en"}
          className="gap-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
            {flags.en}
          </div>
          <span className="font-medium">English</span>
          {locale === "en" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
