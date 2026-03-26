"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const journeyStages = [
  {
    stage: "01",
    title: "Class 10th Foundation",
    subtitle: "Building Strong Fundamentals",
    description:
      "Start your journey with comprehensive Class 10th board preparation. Master the core concepts that form the foundation for competitive exams.",
    features: [
      "CBSE/State Board Prep",
      "Concept Clarity",
      "Strong Foundation",
      "Time Management",
    ],
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    href: "/boards/10/pyq",
  },
  {
    stage: "02",
    title: "Class 12th & Entrance Prep",
    subtitle: "Competitive Edge Development",
    description:
      "Parallel preparation for Class 12th boards and entrance exams. Master JEE, NEET, WBJEE with targeted practice and expert guidance.",
    features: [
      "Board Exam Mastery",
      "JEE/NEET/WBJEE",
      "12 Years PYQs",
      "Mock Test Series",
    ],
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    href: "/exams",
  },
  {
    stage: "03",
    title: "College Admission",
    subtitle: "Strategic College Selection",
    description:
      "Navigate the complex admission process with expert counselling. Get personalized guidance for college and branch selection based on your rank.",
    features: [
      "Rank-based Counselling",
      "College Shortlisting",
      "Branch Selection",
      "Admission Support",
    ],
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    href: "/counselling",
  },
  {
    stage: "04",
    title: "Industry Training",
    subtitle: "Career-Ready Skills",
    description:
      "Bridge the gap between academics and industry. Gain hands-on experience through real-world projects and internships to secure your dream job.",
    features: [
      "Live Projects",
      "Industry Mentors",
      "Skill Development",
      "Job Placement",
    ],
    icon: Briefcase,
    color: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 to-red-500/10",
    href: "/internship",
  },
];

// Smooth Word Reveal component for better performance and premium feel
function SmoothWordReveal({
  text,
  darkMode,
  delay = 0,
}: {
  text: string;
  darkMode: boolean;
  delay?: number;
}) {
  const words = text.split(" ");
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(4px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={`text-sm md:text-base leading-relaxed min-h-[4.5rem] ${
        darkMode ? "text-gray-300" : "text-gray-600"
      }`}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default function Features() {
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

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

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* BACKGROUND GRADIENT */}
      <div
        className="
          absolute inset-0 pointer-events-none 
          bg-linear-to-br from-[var(--color-brand)]/10 to-[var(--color-brand-accent)]/15 
          blur-3xl opacity-70
        "
      ></div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="relative max-w-7xl mx-auto text-center mb-20"
      >
        <h2
          className={`
            text-4xl md:text-5xl font-bold mb-4 tracking-tight
            ${darkMode ? "text-white" : "text-[var(--color-brand)]"}
          `}
        >
          Your Complete Journey to Success
        </h2>

        <p
          className={`
            text-lg md:text-xl leading-relaxed max-w-3xl mx-auto
            ${darkMode ? "text-gray-400" : "text-gray-700"}
          `}
        >
          From Class 10th to Your Dream Job - We're With You Every Step of the
          Way
        </p>
      </motion.div>

      {/* Journey Cards with Parallax */}
      <div className="relative max-w-7xl mx-auto space-y-32">
        {journeyStages.map((stage, index) => {
          const Icon = stage.icon;
          const isEven = index % 2 === 0;
          const cardY = useTransform(
            scrollYProgress,
            [0, 1],
            [index * 30, -index * 30],
          );

          return (
            <motion.div
              key={stage.stage}
              style={{ y: cardY, willChange: "transform" }}
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`relative grid lg:grid-cols-2 gap-12 items-center ${
                isEven ? "" : "lg:grid-flow-dense"
              }`}
            >
              {/* Content Side */}
              <div
                className={`relative z-10 ${isEven ? "" : "lg:col-start-2"}`}
              >
                {/* Stage Number */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`text-6xl font-black bg-linear-to-r ${stage.color} bg-clip-text text-transparent opacity-50`}
                  >
                    {stage.stage}
                  </span>
                  <div className="h-1 flex-1 bg-linear-to-r ${stage.color} opacity-30 rounded-full" />
                </div>

                {/* Title */}
                <h3
                  className={`text-3xl md:text-4xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stage.title}
                </h3>

                {/* Subtitle */}
                <p
                  className={`text-lg font-semibold mb-4 bg-linear-to-r ${stage.color} bg-clip-text text-transparent`}
                >
                  {stage.subtitle}
                </p>

                {/* Description */}
               

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {stage.features.map((feature, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        darkMode
                          ? "bg-white/5 border-white/10"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${stage.color}`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={stage.href}
                  className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-linear-to-r ${stage.color} text-white shadow-lg hover:shadow-xl hover:scale-105`}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Visual Card Side */}
              <div
                className={`relative ${isEven ? "lg:col-start-2" : "lg:col-start-1"}`}
              >
                <div className="relative">
                  {/* Decorative Gradient Blob */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute -inset-8 bg-linear-to-r ${stage.color} opacity-20 blur-3xl rounded-full`}
                  />

                  {/* Main Card */}
                  <div
                    className={`relative rounded-3xl border backdrop-blur-xl p-8 shadow-2xl ${
                      darkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-white/90 border-gray-200"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center bg-linear-to-br ${stage.color} shadow-lg`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Stage Title */}
                    <h4
                      className={`text-2xl font-bold mb-4 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stage.title}
                    </h4>

                    {/* Smooth Word Reveal Description — replaces the typewriter animation */}
                    <SmoothWordReveal
                      text={stage.description}
                      darkMode={darkMode}
                      delay={0.3 + index * 0.1}
                    />

                    {/* Decorative Corner */}
                    <div
                      className={`absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br ${stage.color} opacity-10 rounded-full blur-2xl`}
                    />
                  </div>
                </div>
              </div>

              {/* Connecting Line for Desktop */}
              {index < journeyStages.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 bottom-0 w-0.5 h-32 bg-linear-to-b from-[var(--color-brand)]/50 to-transparent transform translate-y-full -translate-x-1/2" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}