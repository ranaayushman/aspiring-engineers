"use client";

import React, { useEffect, useState } from "react";
import { getPapers, Paper } from "@/services/papers";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  PlayCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PyqPageProps {
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  breadcrumbs: BreadcrumbItem[];
  category: "jee-main" | "jee-advanced" | "wbjee" | "neet";
}

export default function PyqPage({
  title,
  subtitle,
  description,
  accentColor,
  breadcrumbs,
  category,
}: PyqPageProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const data = await getPapers({ category, limit: 100 });
        setPapers(data.filter((p) => p.type === "with-solution"));
      } catch (error) {
        console.error("Failed to load papers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [category]);

  // Calculate real stats from papers data
  const stats = React.useMemo(() => {
    if (papers.length === 0) return null;

    const years = papers.map((p) => p.year).filter(Boolean);
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    const minYear = uniqueYears[0];
    const maxYear = uniqueYears[uniqueYears.length - 1];

    const papersWithSolutions = papers.filter(
      (p) => p.solutionDriveLink || p.videoSolutionLink,
    ).length;
    const papersWithVideo = papers.filter((p) => p.videoSolutionLink).length;

    return {
      totalPapers: papers.length,
      yearsRange: minYear && maxYear ? `${minYear} - ${maxYear}` : "N/A",
      withSolutions: papersWithSolutions,
      withVideo: papersWithVideo,
    };
  }, [papers]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30 0%, transparent 50%, ${accentColor}15 100%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-sm mb-8"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span style={{ color: accentColor }} className="font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={`hover:underline transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </motion.nav>

          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              <BookOpen className="w-4 h-4" />
              Previous Year Questions
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span style={{ color: accentColor }}>{title}</span>
            </h1>

            <p
              className={`text-xl md:text-2xl font-medium mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {subtitle}
            </p>

            <p
              className={`text-base md:text-lg leading-relaxed ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>
          </motion.div>

          {/* Stats Cards - Real Data */}
          {!loading && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10"
            >
              <div
                className={`flex flex-col items-center justify-center p-5 rounded-2xl backdrop-blur-sm border text-center transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/80 border-gray-200 hover:shadow-lg"
                }`}
              >
                <p
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: accentColor }}
                >
                  {stats.totalPapers}
                </p>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Papers
                </p>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-5 rounded-2xl backdrop-blur-sm border text-center transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/80 border-gray-200 hover:shadow-lg"
                }`}
              >
                <p
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: accentColor }}
                >
                  {stats.yearsRange}
                </p>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Years Covered
                </p>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-5 rounded-2xl backdrop-blur-sm border text-center transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/80 border-gray-200 hover:shadow-lg"
                }`}
              >
                <p
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: accentColor }}
                >
                  {stats.withSolutions}
                </p>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  With Solutions
                </p>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-5 rounded-2xl backdrop-blur-sm border text-center transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/80 border-gray-200 hover:shadow-lg"
                }`}
              >
                <p
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: accentColor }}
                >
                  {stats.withVideo}
                </p>
                <p
                  className={`text-xs md:text-sm font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Video Solutions
                </p>
              </div>
            </motion.div>
          )}

          {/* Loading Stats */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-24 rounded-2xl animate-pulse ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Papers Section */}
      <section className="relative py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-[380px] rounded-2xl animate-pulse ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && papers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 rounded-3xl border-2 border-dashed ${
                darkMode
                  ? "bg-gray-900/50 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <BookOpen
                  style={{ color: accentColor }}
                  className="w-10 h-10"
                />
              </div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Papers Available Yet
              </h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                We&apos;re working on adding papers for this category. Check
                back soon!
              </p>
            </motion.div>
          )}

          {/* Papers Grid */}
          {!loading && papers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papers.map((paper, index) => (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(paper._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-500 ${
                    darkMode
                      ? "bg-gray-900/80 border border-gray-800"
                      : "bg-white border border-gray-100"
                  } ${
                    hoveredId === paper._id
                      ? "shadow-2xl -translate-y-2"
                      : "shadow-lg hover:shadow-xl"
                  }`}
                  style={{
                    boxShadow:
                      hoveredId === paper._id
                        ? `0 25px 50px -12px ${accentColor}25`
                        : undefined,
                  }}
                >
                  {/* Top Accent Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                    style={{
                      background:
                        hoveredId === paper._id
                          ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`
                          : "transparent",
                    }}
                  />

                  {/* Thumbnail */}
                  <div className="relative h-52 w-full overflow-hidden">
                    {paper.thumbnailUrl ? (
                      <>
                        <Image
                          src={paper.thumbnailUrl}
                          alt={paper.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(to top, ${
                              darkMode
                                ? "rgba(17,24,39,0.9)"
                                : "rgba(255,255,255,0.3)"
                            } 0%, transparent 50%)`,
                          }}
                        />
                      </>
                    ) : (
                      <div
                        className={`flex flex-col items-center justify-center h-full ${
                          darkMode ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <FileText
                            style={{ color: accentColor }}
                            className="w-8 h-8"
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {paper.year} Paper
                        </span>
                      </div>
                    )}

                    {/* Year Badge */}
                    <div
                      className="absolute top-4 right-4 px-4 py-2 rounded-xl backdrop-blur-md font-bold text-white text-sm shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {paper.year}
                      </div>
                    </div>

                    {/* Latest Badge */}
                    {paper.year >= 2024 && (
                      <div
                        className="absolute top-4 left-4 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-bold flex items-center gap-1.5"
                        style={{
                          background: darkMode
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(255,255,255,0.9)",
                          color: accentColor,
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Latest
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3
                      className={`text-lg font-bold mb-3 line-clamp-2 transition-colors ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                      style={{
                        color:
                          hoveredId === paper._id ? accentColor : undefined,
                      }}
                    >
                      {paper.title}
                    </h3>

                    {/* Paper Type Badge */}
                    {paper.type && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium mb-4 ${
                          darkMode
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {paper.type}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {paper.paperDriveLink && (
                        <Link
                          href={paper.paperDriveLink}
                          target="_blank"
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            darkMode
                              ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          Paper
                        </Link>
                      )}

                      {paper.solutionDriveLink && (
                        <Link
                          href={paper.solutionDriveLink}
                          target="_blank"
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            darkMode
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Solution
                        </Link>
                      )}
                    </div>

                    {/* Video Solution */}
                    {paper.videoSolutionLink && (
                      <Link
                        href={paper.videoSolutionLink}
                        target="_blank"
                        className={`mt-3 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          darkMode
                            ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-400 hover:from-red-500/20 hover:to-orange-500/20"
                            : "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 hover:from-red-100 hover:to-orange-100"
                        }`}
                      >
                        <PlayCircle className="w-5 h-5" />
                        Watch Video Solution
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
