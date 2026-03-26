"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import HeroStats from "./HeroStats";
import HeroBadge from "./HeroBadge";
import HeroCarousel, { BannerItem } from "./HeroCarousel";
import { getSiteSettings } from "@/services/siteSettings";
import { logger } from "@/lib/logger";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const bannerItems: BannerItem[] = [
  {
    image: "/banners/jee.png",
    title: "JEE Mains & Advanced",
    link: "/exams/jee",
  },
  {
    image: "/banners/neet.png",
    title: "NEET Preparation",
    link: "/exams/neet",
  },
  {
    image: "/banners/wbjee.png",
    title: "WBJEE Test Series",
    link: "/exams/wbjee",
  },
  {
    image: "/banners/boards.png",
    title: "Board Exams (10 & 12)",
    link: "/boards",
  },
];

export default function Hero() {
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState<BannerItem[]>(bannerItems);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (
          settings &&
          settings.heroBanners &&
          settings.heroBanners.length > 0
        ) {
          const apiBanners = settings.heroBanners
            .filter((b) => b.isActive)
            .sort((a, b) => a.order - b.order)
            .map((b) => ({
              image: b.imageUrl,
              title: b.title,
              link: b.ctaUrl,
            }));
          setItems(apiBanners);
        }
      } catch (error) {
        logger.error("Failed to fetch hero banners", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-visible">
      {/* BACKGROUND BLOBS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl transition-all
          ${darkMode ? "bg-[var(--color-brand)]/10" : "bg-[var(--color-brand)]/20"}`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl transition-all
          ${darkMode ? "bg-[var(--color-brand-accent)]/15" : "bg-[var(--color-brand-accent)]/25"}`}
        />
      </div>

      <Spotlight
        className="absolute -top-40 md:-top-20 left-0 md:left-60 z-10 pointer-events-none mix-blend-screen"
        fill={darkMode ? "rgba(255,255,255,0.35)" : "white"}
      />

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto text-center relative z-20">
        <HeroBadge darkMode={darkMode} />

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
          <span className="from-[var(--color-brand)] to-[var(--color-brand-accent)] bg-linear-to-b bg-clip-text text-transparent">
            Aspiring
          </span>{" "}
          <span className="from-[var(--color-brand-accent)] to-[var(--color-brand-light)] bg-linear-to-b bg-clip-text text-transparent">
            Engineers
          </span>
        </h1>

        <p
          className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-6 transition-colors ${darkMode ? "text-gray-300" : "text-gray-600"
            }`}
        >
          From School to Career — One Platform, One Clear Direction

        </p>

        <p
          className={`text-lg max-w-2xl mx-auto mb-10 transition-colors ${darkMode ? "text-gray-400" : "text-gray-500"
            }`}
        >
          From Preparation to Performance
        </p>

        {/* CTA BUTTONS – UPDATED */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* PRIMARY – FILLED */}
          <Link href="/test-series">
            <Button
              size="lg"
              className="
                h-10 px-8 text-lg font-medium 
                bg-[var(--color-brand)] text-white shadow-xl
                hover:bg-[var(--color-brand-hover)]
                transition
              "
            >
              Start Exploring <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* HERO CAROUSEL */}
        <div className="mt-16">
          <HeroCarousel items={items} />
        </div>

        <HeroStats darkMode={darkMode} />
      </div>
    </section>
  );
}
