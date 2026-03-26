import Link from "next/link";
import { ArrowRight, Building2, ExternalLink, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type College = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  state: string;
  type: "engineering";
  category: "private";
  nirf?: number;
  established: number;
  avgPackage: string;
  highestPackage: string;
  seats: number;
  acceptedExams: string[];
  website: string;
  featured?: boolean;
};

const westBengalColleges: College[] = [
  {
    id: "haldia-institute-of-technology",
    name: "Haldia Institute of Technology",
    shortName: "HIT Haldia",
    location: "Haldia",
    state: "West Bengal",
    type: "engineering",
    category: "private",
    nirf: 201,
    established: 1996,
    avgPackage: "₹5.5 LPA",
    highestPackage: "₹33 LPA",
    seats: 2200,
    acceptedExams: ["WBJEE", "JEE Main"],
    website: "https://hithaldia.ac.in",
  },
  {
    id: "iem-kolkata",
    name: "Institute of Engineering and Management",
    shortName: "IEM Kolkata",
    location: "Kolkata",
    state: "West Bengal",
    type: "engineering",
    category: "private",
    established: 1989,
    avgPackage: "₹6 LPA",
    highestPackage: "₹72 LPA",
    seats: 885,
    acceptedExams: ["WBJEE", "JEE Main", "IEM JEE"],
    website: "https://iem.edu.in",
    featured: true,
  },
  {
    id: "narula-institute-of-technology",
    name: "Narula Institute of Technology",
    shortName: "NiT Agarpara",
    location: "Agarpara, Kolkata",
    state: "West Bengal",
    type: "engineering",
    category: "private",
    nirf: 201,
    established: 2001,
    avgPackage: "₹5 LPA",
    highestPackage: "₹27 LPA",
    seats: 720,
    acceptedExams: ["WBJEE", "JEE Main", "CEE-AMPAI"],
    website: "https://www.nit.ac.in",
  },
];

const premierPrivateColleges: College[] = [
  {
    id: "dyp-vidyapeeth-pune",
    name: "Dr. D. Y. Patil Vidyapeeth",
    shortName: "DPU Pune",
    location: "Pune",
    state: "Maharashtra",
    type: "engineering",
    category: "private",
    nirf: 71,
    established: 2003,
    avgPackage: "₹5.4 LPA",
    highestPackage: "₹84 LPA",
    seats: 1020,
    acceptedExams: ["MHT CET", "JEE Main"],
    website: "https://dpu.edu.in",
  },
  {
    id: "kiit-bhubaneswar",
    name: "Kalinga Institute of Industrial Technology",
    shortName: "KIIT",
    location: "Bhubaneswar",
    state: "Odisha",
    type: "engineering",
    category: "private",
    nirf: 36,
    established: 1992,
    avgPackage: "₹8.5 LPA",
    highestPackage: "₹53 LPA",
    seats: 3500,
    acceptedExams: ["KIITEE"],
    website: "https://kiit.ac.in",
    featured: true,
  },
  {
    id: "vit-vellore-campus",
    name: "Vellore Institute of Technology",
    shortName: "VIT Vellore",
    location: "Vellore",
    state: "Tamil Nadu",
    type: "engineering",
    category: "private",
    nirf: 16,
    established: 1984,
    avgPackage: "₹9.9 LPA",
    highestPackage: "₹1.02 Cr",
    seats: 5000,
    acceptedExams: ["VITEEE"],
    website: "https://vit.ac.in",
    featured: true,
  },
];

const allTopPrivateColleges = [
  ...westBengalColleges,
  ...premierPrivateColleges,
];
const runningTickerColleges = [...westBengalColleges, ...westBengalColleges];

export default function CollegeListPage() {
  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,150,190,0.16),transparent_48%),linear-gradient(180deg,rgba(96,223,255,0.12),transparent_32%)]" />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)] mb-3">
            Counselling College List
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Top Private Engineering Colleges
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            West Bengal top private colleges in a running list, followed by top
            premier private colleges. Click any college card to continue to the
            admission guidance form.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="rounded-2xl border border-[var(--color-brand)]/20 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] mb-3">
              <Building2 className="w-4 h-4" />
              West Bengal Top Private Colleges (Running List)
            </div>

            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]">
              <ul className="flex w-max min-w-full flex-nowrap gap-3 animate-scroll hover:[animation-play-state:paused]">
                {runningTickerColleges.map((college, index) => (
                  <li
                    key={`${college.id}-${index}`}
                    className="shrink-0 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/10 px-4 py-2 text-sm font-medium text-[var(--color-brand)]"
                  >
                    {college.shortName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Top Premier Colleges
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                3 x 2 grid of selected private engineering colleges
              </p>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Row 1: West Bengal | Row 2: Premier India
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {allTopPrivateColleges.map((college) => (
              <Link
                key={college.id}
                href={{
                  pathname: "/counselling/admission-guidance",
                  query: {
                    collegeChoice: college.name,
                    source: "college-list",
                  },
                }}
                className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {college.state}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                      {college.shortName}
                    </h3>
                  </div>
                  {college.nirf ? (
                    <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-1 text-xs font-semibold">
                      NIRF {college.nirf}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 px-2.5 py-1 text-xs font-semibold">
                      Private
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {college.name}
                </p>

                <div className="space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    {college.location}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Avg:{" "}
                    <span className="font-semibold">{college.avgPackage}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Highest:{" "}
                    <span className="font-semibold">
                      {college.highestPackage}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Seats:{" "}
                    <span className="font-semibold">
                      {college.seats.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Exams:{" "}
                    <span className="font-semibold">
                      {college.acceptedExams.join(", ")}
                    </span>
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm text-[var(--color-brand)]">
                    {college.website.replace("https://", "")}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)]">
                    Admission Form
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
