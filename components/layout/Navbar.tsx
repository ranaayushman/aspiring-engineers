"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation";
import {
  Menu as MenuIcon,
  X as XIcon,
  ChevronDown,
  User,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tokenManager } from "@/lib/utils/tokenManager";

gsap.registerPlugin(ScrollTrigger);

type MenuItem = {
  id: string;
  label: string;
  href?: string;
  children?: MenuItem[];
};

const MENU: MenuItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "exams",
    label: "PYQs",
    children: [
      {
        id: "jee",
        label: "JEE",
        children: [
          {
            id: "jee-mains",
            label: "Mains",
            children: [
              {
                id: "mains-pyq-with-sol",
                label: "PYQ — With Solutions",
                href: "/exams/jee/mains/pyq/with-solutions",
              },
              {
                id: "mains-pyq-no-sol",
                label: "PYQ — Without Solutions",
                href: "/exams/jee/mains/pyq/without-solutions",
              },
            ],
          },
          {
            id: "jee-advanced",
            label: "Advanced",
            children: [
              {
                id: "adv-pyq-with-sol",
                label: "PYQ — With Solutions",
                href: "/exams/jee/advanced/pyq/with-solutions",
              },
              {
                id: "adv-pyq-no-sol",
                label: "PYQ — Without Solutions",
                href: "/exams/jee/advanced/pyq/without-solutions",
              },
            ],
          },
        ],
      },
      {
        id: "neet",
        label: "NEET",
        children: [
          {
            id: "neet-pyq-with-sol",
            label: "PYQ — With Solutions",
            href: "/exams/neet/pyq/with-solutions",
          },
          {
            id: "neet-pyq-no-sol",
            label: "PYQ — Without Solutions",
            href: "/exams/neet/pyq/without-solutions",
          },
        ],
      },
      {
        id: "wbjee",
        label: "WBJEE",
        children: [
          {
            id: "wb-pyq-with-sol",
            label: "PYQ — With Solutions",
            href: "/exams/wbjee/pyq/with-solutions",
          },
          {
            id: "wb-pyq-no-sol",
            label: "PYQ — Without Solutions",
            href: "/exams/wbjee/pyq/without-solutions",
          },
        ],
      },
    ],
  },
  { id: "test-series", label: "Test Series", href: "/test-series" },
  {
    id: "boards",
    label: "Boards",
    children: [
      {
        id: "class10",
        label: "Class 10",
        children: [
          { id: "10-pyq", label: "PYQ", href: "/boards/10/pyq" },
          {
            id: "10-sample",
            label: "Sample Papers",
            href: "/boards/10/sample-papers",
          },
        ],
      },
      {
        id: "class12",
        label: "Class 12",
        children: [
          { id: "12-pyq", label: "PYQ", href: "/boards/12/pyq" },
          {
            id: "12-sample",
            label: "Sample Papers",
            href: "/boards/12/sample-papers",
          },
        ],
      },
    ],
  },
  {
    id: "counselling",
    label: "Counselling",
    href: "/counselling",
    children: [
      { id: "c-jee", label: "JEE Counselling", href: "/counselling/jee" },
      { id: "c-neet", label: "NEET Counselling", href: "/counselling/neet" },
      { id: "c-wbjee", label: "WBJEE Counselling", href: "/counselling/wbjee" },
    ],
  },
  {
    id: "admission",
    label: "Admission Guidance",
    href: "/counselling/admission-guidance",
    children: [
      {
        id: "admission-guidance",
        label: "Admission Guidance",
        href: "/counselling/admission-guidance",
      },
      {
        id: "college-list",
        label: "College List",
        href: "/counselling/college-list",
      },
    ],
  },
  { id: "internship", label: "Internships", href: "/internship" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export default function Navbar(): JSX.Element {
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    ref: themeRef,
    toggleSwitchTheme,
    isDarkMode,
  } = useModeAnimation({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    blurAmount: 0,
    duration: 700,
  });

  // mobile state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { getSiteSettings } = await import("@/services/siteSettings");
        const settings = await getSiteSettings();
        if (settings?.navbarLinks && settings.navbarLinks.length > 0) {
          // Map API response to MenuItem structure if needed
          // Assuming API structure matches MenuItem closely enough or we map it
          // API NavbarLink: { label, url, order, isActive, children }
          // UI MenuItem: { id, label, href, children }
          
          const mapToMenuItem = (links: any[]): MenuItem[] => {
            return links
              .filter(link => link.isActive)
              .sort((a, b) => a.order - b.order)
              .map((link, index) => ({
                id: link._id || `nav-${index}-${link.label}`,
                label: link.label,
                href: link.url,
                children: link.children ? mapToMenuItem(link.children) : undefined
              }));
          };
          
          setMenuItems(mapToMenuItem(settings.navbarLinks));
        }
      } catch (error) {
        console.error("Failed to load site settings", error);
      }
    };
    
    fetchSettings();
  }, []);

  // refs
  const panelRef = useRef<HTMLDivElement | null>(null);
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const desktopDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // sticky nav
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { backgroundColor: "transparent" });
      gsap.to(el, {
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=140",
          scrub: true,
        },
        backgroundColor: "var(--navbar-backdrop)",
        borderColor: "var(--navbar-border)",
        backdropFilter: "blur(8px)",
        duration: 0.3,
        ease: "power1.out",
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.refresh();
    };
  }, [pathname]);

  // mobile panel animations
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.killTweensOf(el);

    if (mobileOpen) {
      el.style.display = "block";
      el.style.pointerEvents = "auto";
      gsap.fromTo(
        el,
        { y: "-6%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.38, ease: "power3.out" },
      );
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(el, {
        y: "-4%",
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          el.style.display = "none";
          el.style.pointerEvents = "none";
        },
      });
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenIds([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isOpen = (id: string) => openIds.includes(id);
  const hasChildren = (item: MenuItem) =>
    Array.isArray(item.children) && item.children.length > 0;

  const toggleAccordion = (id: string) => {
    const already = openIds.includes(id);
    let next: string[];
    if (already) {
      next = openIds.filter(
        (open) => open !== id && !open.startsWith(id + "-"),
      );
    } else {
      next = [...openIds, id];
    }
    setOpenIds(next);

    const container = accordionRefs.current[id];
    if (!container) return;
    gsap.killTweensOf(container);
    if (!already) {
      const targetHeight = container.scrollHeight;
      gsap.fromTo(
        container,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.36,
          ease: "power2.out",
          onComplete: () => {
            container.style.height = "auto";
          },
        },
      );
    } else {
      gsap.to(container, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  };

  // desktop dropdown animations
  const onDesktopEnter = (id: string) => {
    const el = desktopDropdownRefs.current[id];
    if (!el) return;
    gsap.killTweensOf(el);
    el.style.display = "block";
    gsap.fromTo(
      el,
      { y: -6, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" },
    );
  };
  const onDesktopLeave = (id: string) => {
    const el = desktopDropdownRefs.current[id];
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      y: -6,
      opacity: 0,
      scale: 0.98,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        el.style.display = "none";
      },
    });
  };

  // renderers
  const renderMobileMenu = (items: MenuItem[], level = 0) => {
    return items.map((item) => {
      const itemId = item.id;
      return (
        <div
          key={itemId}
          className={`w-full border-b border-bg-700 ${
            level === 0 ? "" : "bg-transparent"
          }`}
        >
          <div
            className={`flex items-center justify-between py-3 px-3 ${
              level === 0 ? "" : "pl-6"
            }`}
          >
            {item.href ? (
              <Link
                href={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  setOpenIds([]);
                }}
                className="w-full text-left text-base font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <button
                onClick={() =>
                  hasChildren(item)
                    ? toggleAccordion(itemId)
                    : setMobileOpen(false)
                }
                className="w-full text-left text-base font-medium"
                aria-expanded={isOpen(itemId)}
                aria-controls={`panel-${itemId}`}
              >
                {item.label}
              </button>
            )}

            {hasChildren(item) ? (
              <button
                aria-label={
                  isOpen(itemId)
                    ? `Collapse ${item.label}`
                    : `Expand ${item.label}`
                }
                onClick={() => toggleAccordion(itemId)}
                className="ml-3 inline-flex items-center justify-center rounded p-2"
              >
                <ChevronDown
                  className={`transition-transform ${
                    isOpen(itemId) ? "rotate-180" : "rotate-0"
                  }`}
                  size={18}
                />
              </button>
            ) : null}
          </div>

          {hasChildren(item) ? (
            <div
              id={`panel-${itemId}`}
              ref={(el) => {
                accordionRefs.current[itemId] = el;
              }}
              style={{
                height: isOpen(itemId) ? "auto" : 0,
                overflow: "hidden",
                display: isOpen(itemId) ? "block" : "none",
              }}
              className="pl-3"
            >
              <div className="flex flex-col">
                {renderMobileMenu(item.children!, level + 1)}
              </div>
            </div>
          ) : null}
        </div>
      );
    });
  };

  const renderDesktopMenu = (items: MenuItem[]) => {
    return items.map((item) => {
      if (!hasChildren(item)) {
        return (
          <li key={item.id} className="relative">
            <Link
              href={item.href || "#"}
              className={`flex items-center gap-2 px-2 py-1 rounded-md whitespace-nowrap ${
                pathname === item.href
                  ? "font-semibold text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              <span className="relative inline-flex overflow-hidden group">
                <div className="translate-y-0 transform-gpu transition-transform duration-300 group-hover:-translate-y-[110%]">
                  {item.label}
                </div>
                <div className="absolute translate-y-[110%] transform-gpu text-text-primary transition-transform duration-300 group-hover:translate-y-0">
                  {item.label}
                </div>
              </span>
            </Link>
          </li>
        );
      }

      // Check if children are flat (have direct href) or nested (have their own children)
      const hasFlatChildren = item.children!.every(
        (child) => child.href && !child.children,
      );

      return (
        <li
          key={item.id}
          className="group relative"
          onMouseEnter={() => onDesktopEnter(item.id)}
          onMouseLeave={() => onDesktopLeave(item.id)}
          onFocus={() => onDesktopEnter(item.id)}
          onBlur={() => onDesktopLeave(item.id)}
        >
          {item.href ? (
            <Link
              href={item.href}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-text-secondary whitespace-nowrap`}
            >
              <span className="relative inline-flex overflow-hidden group">
                <div className="translate-y-0 transform-gpu transition-transform duration-300 group-hover:-translate-y-[110%]">
                  {item.label}
                </div>
                <div className="absolute translate-y-[110%] transform-gpu text-text-primary transition-transform duration-300 group-hover:translate-y-0">
                  {item.label}
                </div>
              </span>
              <ChevronDown className="ml-1" size={14} />
            </Link>
            ) : (
            <button
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-text-secondary whitespace-nowrap`}
              aria-haspopup="true"
            >
              <span className="relative inline-flex overflow-hidden group">
                <div className="translate-y-0 transform-gpu transition-transform duration-300 group-hover:-translate-y-[110%]">
                  {item.label}
                </div>
                <div className="absolute translate-y-[110%] transform-gpu text-text-primary transition-transform duration-300 group-hover:translate-y-0">
                  {item.label}
                </div>
              </span>
              <ChevronDown className="ml-1" size={14} />
            </button>
          )}

          <div
            ref={(el) => {
              desktopDropdownRefs.current[item.id] = el;
            }}
            className={`absolute left-0 top-full mt-3 z-50 origin-top-left rounded-lg border border-bg-700 bg-white dark:bg-[#071219] p-4 shadow-2xl backdrop-blur-xl ${
              hasFlatChildren ? "w-56" : "w-136"
            }`}
            style={{ display: "none" }}
          >
            {hasFlatChildren ? (
              // Flat children - simple list of links
              <ul className="flex flex-col gap-2 text-sm">
                {item.children!.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={child.href || "#"}
                      className="block hover:underline py-1 hover:text-[#2596be] transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              // Nested children - grid layout with sections
              <div className="grid grid-cols-2 gap-4">
                {item.children!.map((section) => (
                  <div key={section.id}>
                    <h4 className="font-semibold text-sm mb-2">
                      {section.label}
                    </h4>
                    <ul className="flex flex-col gap-2 text-sm">
                      {section.children?.map((sub) => (
                        <li key={sub.id}>
                          {sub.children ? (
                            <div>
                              <span className="font-medium">{sub.label}</span>
                              <ul className="ml-3 mt-2 flex flex-col gap-1">
                                {sub.children.map((leaf) => (
                                  <li key={leaf.id}>
                                    <Link
                                      href={leaf.href || "#"}
                                      className="block hover:underline py-1 text-sm"
                                    >
                                      {leaf.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <Link
                              href={sub.href || "#"}
                              className="block hover:underline py-1"
                            >
                              {sub.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </li>
      );
    });
  };

  return (
    <header className="sticky left-0 right-0 top-0 z-50 w-full">
      <nav
        ref={(el) => {
          navRef.current = el;
        }}
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full px-5 py-3"
        style={{
          backgroundColor: "transparent",
          willChange: "background-color, border-color, backdrop-filter",
        }}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Aspiring Engineers"
              width={60}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop menu */}
        <ul className="hidden gap-6 text-sm text-text-secondary sm:flex font-satoshi items-center">
          {renderDesktopMenu(menuItems)}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            ref={themeRef}
            onClick={toggleSwitchTheme}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-bg-700 bg-backdrop/70 backdrop-blur-md"
            aria-label="Toggle theme"
          >
            <span className="sr-only">Toggle theme</span>
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-moon"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sun"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
              </svg>
            )}
          </button>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  // Cross-domain SSO to test-portal-client profile
                  const token = tokenManager.getAuthToken();
                  const refreshToken = tokenManager.getRefreshToken();
                  const testPortalUrl =
                    process.env.NEXT_PUBLIC_TEST_PORTAL_URL || "";
                  if (!testPortalUrl) {
                    console.error(
                      "NEXT_PUBLIC_TEST_PORTAL_URL is not configured",
                    );
                    return;
                  }
                  const ssoUrl = `${testPortalUrl}/auth/sso?token=${encodeURIComponent(
                    token || "",
                  )}&refreshToken=${encodeURIComponent(
                    refreshToken || "",
                  )}&redirect=/profile`;
                  window.location.href = ssoUrl;
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-bg-700 bg-backdrop/70 backdrop-blur-md text-sm font-medium cursor-pointer"
              >
                <User size={16} />
                <span className="truncate max-w-[100px]">
                  {user?.name?.split(" ")[0] || "Profile"}
                </span>
              </button>
              <button
                onClick={() => logout()}
                className="px-3 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-[#2596be] text-white text-sm font-semibold hover:bg-[#1e7ca0] transition-colors whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu-panel"
            className="sm:hidden inline-flex items-center justify-center rounded-full p-2 border border-bg-700 bg-backdrop/70"
          >
            {mobileOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div
        id="mobile-menu-panel"
        ref={panelRef}
        className="fixed left-0 top-0 z-50 w-full min-h-screen transform bg-popover/98 p-6 shadow-lg backdrop-blur-md sm:hidden"
        style={{ display: "none", pointerEvents: "none" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center"
          >
            <Image
              src="/logo.svg"
              alt="Aspiring Engineers"
              width={48}
              height={48}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSwitchTheme}
              className="inline-flex items-center justify-center rounded-full p-2 border border-bg-700 bg-backdrop/60"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-moon"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sun"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center rounded-full p-2"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        <nav aria-label="Mobile menu" className="overflow-auto max-h-[78vh]">
          <div className="flex flex-col space-y-0 mb-6">
            {renderMobileMenu(menuItems)}
          </div>
          <div className="mt-4 border-t border-bg-700 pt-6 px-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-3 rounded-xl border border-bg-700 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 rounded-xl border border-bg-700 text-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 rounded-xl bg-[#2596be] text-center text-white text-sm font-semibold hover:bg-[#1e7ca0] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
