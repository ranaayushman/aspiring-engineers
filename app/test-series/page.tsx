"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { Package, PackagesResponse } from "@/types";
import Navbar from "@/components/layout/Navbar";
import {
  BookOpen,
  Clock,
  FileText,
  Users,
  ChevronRight,
  Search,
} from "lucide-react";

/* ---------- UPDATED FILTER STRUCTURE ---------- */

const EXAM_FILTERS = [
  { value: "All", label: "All" },
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
  { value: "NEET", label: "NEET" },
  { value: "WBJEE", label: "WBJEE" },
  { value: "COMEDK", label: "COMEDK" },
];

export default function TestSeriesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.append("type", "test-series");
        params.append("status", "active");
        params.append("page", currentPage.toString());
        params.append("limit", "12");

        if (selectedExam !== "All") {
          params.append("examType", selectedExam);
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await apiClient.get<PackagesResponse>(
          `/packages?${params.toString()}`
        );

        if (response.data.success) {
          setPackages(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (err: any) {
        setError("Failed to load test series. Please try again.");
        logger.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [selectedExam, searchQuery, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-[var(--color-dark-bg)]" : "bg-gray-50"
      }`}
    >
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl sm:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Test Series
          </h1>

          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Comprehensive test series for JEE, NEET, and other competitive
            exams. Practice with real exam patterns and detailed analysis.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test series..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              />
            </div>

            <button className="px-6 py-3 bg-[var(--color-brand)] text-white rounded-xl">
              Search
            </button>
          </form>

          {/* ---------- FILTER TABS ---------- */}

          <div className="flex flex-wrap gap-2">
            {EXAM_FILTERS.map((exam) => (
              <button
                key={exam.value}
                onClick={() => {
                  setSelectedExam(exam.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedExam === exam.value
                    ? "bg-[var(--color-brand)] text-white"
                    : darkMode
                    ? "bg-white/5 text-gray-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {exam.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* GRID */}
        {!loading && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <TestSeriesCard key={pkg._id} package={pkg} darkMode={darkMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- EXAM TYPE FORMATTER ---------- */

function formatExamType(exam: string): string {
  if (!exam) return "";

  const normalized = exam.toUpperCase();

  const examMap: Record<string, string> = {
    JEE_MAIN: "JEE Main",
    JEE_ADVANCED: "JEE Advanced",
    NEET: "NEET",
    WBJEE: "WBJEE",
    BITSAT: "BITSAT",
    COMEDK: "COMEDK",
  };

  if (examMap[normalized]) {
    return examMap[normalized];
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------- CARD ---------- */

function TestSeriesCard({
  package: pkg,
  darkMode,
}: {
  package: Package;
  darkMode: boolean;
}) {
  const imageUrl = pkg.banner || pkg.thumbnail;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        darkMode
          ? "bg-white/5 border-white/10"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          {pkg.examTypes.slice(0, 3).map((exam, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-black/60 text-white text-xs rounded"
            >
              {formatExamType(exam)}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <h3
          className={`text-lg font-bold mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {pkg.title}
        </h3>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {pkg.totalTests} Tests
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {pkg.validityDays}d
          </div>

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {pkg.enrollments ?? 0}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ₹{pkg.price.toLocaleString()}
          </span>

          <Link
            href={`/test-series/${pkg._id}`}
            className="flex items-center gap-1 px-4 py-2 bg-[var(--color-brand)] text-white rounded-lg"
          >
            View <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}