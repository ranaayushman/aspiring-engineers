"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Paper } from "@/services/papers";
import { useBoardPapers } from "@/hooks/useBoardPapers";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  PlayCircle,
  GraduationCap,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BoardsPyqPageProps {
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  breadcrumbs: BreadcrumbItem[];
  classLevel: "10" | "12";
  paperType: "pyq" | "sample";
}

const BOARDS = ["CBSE", "ICSE", "WBCHSE", "ISC"];
const SUBJECTS_10 = [
  "Mathematics",
  "Science",
  "English",
  "Social Science",
  "Hindi",
];
const SUBJECTS_12 = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "Computer Science",
];

export default function BoardsPyqPage({
  title,
  subtitle,
  description,
  accentColor,
  breadcrumbs,
  classLevel,
  paperType,
}: BoardsPyqPageProps) {
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const { papers, isLoading: loading } = useBoardPapers({
    classLevel,
    paperType,
    board: selectedBoard || undefined,
    subject: selectedSubject ? selectedSubject.toLowerCase() : undefined,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const subjects = classLevel === "10" ? SUBJECTS_10 : SUBJECTS_12;

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

  // Calculate real stats from papers data
  const stats = useMemo(() => {
    if (papers.length === 0) return null;

    const years = papers.map((p) => p.year).filter(Boolean);
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    const minYear = uniqueYears[0];
    const maxYear = uniqueYears[uniqueYears.length - 1];

    const uniqueBoards = [
      ...new Set(papers.map((p) => p.board).filter(Boolean)),
    ];
    const uniqueSubjects = [
      ...new Set(papers.map((p) => p.subject).filter(Boolean)),
    ];

    return {
      totalPapers: papers.length,
      yearsRange: minYear && maxYear ? `${minYear} - ${maxYear}` : "N/A",
      boards: uniqueBoards.length,
      subjects: uniqueSubjects.length,
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
                    className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
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
            className="text-center mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <GraduationCap
                className="w-4 h-4"
                style={{ color: accentColor }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: accentColor }}
              >
                {subtitle}
              </span>
            </div>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h1>
            <p
              className={`max-w-2xl mx-auto text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                {
                  label: "Total Papers",
                  value: stats.totalPapers,
                  icon: FileText,
                },
                {
                  label: "Years Covered",
                  value: stats.yearsRange,
                  icon: Calendar,
                },
                { label: "Boards", value: stats.boards, icon: BookOpen },
                {
                  label: "Subjects",
                  value: stats.subjects,
                  icon: GraduationCap,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-xl border text-center ${
                    darkMode
                      ? "bg-gray-900/50 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <stat.icon
                    className="w-5 h-5 mx-auto mb-2"
                    style={{ color: accentColor }}
                  />
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl border mb-8 ${
              darkMode
                ? "bg-gray-900/50 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" style={{ color: accentColor }} />
              <span
                className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Filter Papers
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Board Filter */}
              <div className="flex-1 min-w-[200px]">
                <label
                  className={`block text-sm mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Board
                </label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">All Boards</option>
                  {BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div className="flex-1 min-w-[200px]">
                <label
                  className={`block text-sm mb-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Papers Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`animate-pulse rounded-2xl h-64 ${
                    darkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-20">
              <FileText
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-gray-700" : "text-gray-300"
                }`}
              />
              <h3
                className={`text-xl font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No Papers Found
              </h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papers.map((paper, index) => (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(paper._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  } ${hoveredId === paper._id ? "shadow-xl" : "shadow-sm"}`}
                  style={{
                    boxShadow:
                      hoveredId === paper._id
                        ? `0 20px 40px -12px ${accentColor}30`
                        : undefined,
                  }}
                >
                  {/* Thumbnail or Gradient */}
                  <div
                    className="h-32 relative"
                    style={{
                      background: paper.thumbnailUrl
                        ? undefined
                        : `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                    }}
                  >
                    {paper.thumbnailUrl ? (
                      <Image
                        src={paper.thumbnailUrl}
                        alt={paper.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText
                          className="w-12 h-12"
                          style={{ color: accentColor }}
                        />
                      </div>
                    )}
                    {/* Year Badge */}
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {paper.year}
                    </div>
                    {/* Board Badge */}
                    {paper.board && (
                      <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? "bg-gray-800/90 text-white"
                            : "bg-white/90 text-gray-900"
                        }`}
                      >
                        {paper.board}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className={`font-semibold text-lg mb-2 line-clamp-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {paper.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.subject && (
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            darkMode
                              ? "bg-gray-800 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {paper.subject}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          darkMode
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {paper.type}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={paper.paperDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Download className="w-4 h-4" />
                        Paper
                      </a>
                      {paper.solutionDriveLink && (
                        <a
                          href={paper.solutionDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            darkMode
                              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Solution
                        </a>
                      )}
                    </div>

                    {paper.videoSolutionLink && (
                      <a
                        href={paper.videoSolutionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Video Solution
                      </a>
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
