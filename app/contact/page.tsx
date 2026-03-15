"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import apiClient from "@/lib/api-client";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map form data to API payload
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      };

      await apiClient.post("/contact", payload);

      alert("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      logger.error("Failed to send message:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />

      <PageHero
        title="Contact Us"
        description="Have questions? We're here to help. Reach out to us and we'll respond as soon as possible."
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6 bg-linear-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] bg-clip-text text-transparent">
                Get In Touch
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email",
                    value: "aspiringengineersofficial@gmail.com",
                    href: "mailto:aspiringengineersofficial@gmail.com",
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    value: "+91 9002912888",
                    href: "tel:+919002912888",
                  },
                  {
                    icon: MapPin,
                    title: "Address",
                    value:
                      "Hemanti Block, Kshudiram Nagar, Haldia, West Bengal - 721657, P.O: Hatiberia BO, P.S: Haldia, Dist: Purba Medinipur, Ward No. 24",
                  },
                ].map((contact, idx) => (
                  <div
                    key={idx}
                    className="group p-6 rounded-2xl backdrop-blur-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-brand)]/30 dark:hover:border-[var(--color-brand)]/50 hover:bg-white dark:hover:bg-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-accent)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-[var(--color-brand)]/20">
                        <contact.icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors group-hover:text-[var(--color-brand)] dark:group-hover:text-[var(--color-brand-light)]">
                          {contact.title}
                        </h3>
                        {contact.href ? (
                          <a
                            href={contact.href}
                            className="text-[var(--color-brand)] dark:text-[var(--color-brand-light)] hover:underline transition-all"
                          >
                            {contact.value}
                          </a>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400">
                            {contact.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office Hours */}
              <div className="mt-8 p-6 rounded-2xl backdrop-blur-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Monday - Friday
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Saturday
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Sunday
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl backdrop-blur-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5">
                <h2 className="text-2xl font-bold mb-6 bg-linear-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] bg-clip-text text-transparent">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-[var(--color-brand)]/50 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent focus:shadow-[0_0_15px_rgba(37,150,190,0.15)] outline-none"
                        placeholder="Please Enter your Full Name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-[var(--color-brand)]/50 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent focus:shadow-[0_0_15px_rgba(37,150,190,0.15)] outline-none"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-[var(--color-brand)]/50 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent focus:shadow-[0_0_15px_rgba(37,150,190,0.15)] outline-none"
                        placeholder="Enter Contact Details"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-[var(--color-brand)]/50 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent focus:shadow-[0_0_15px_rgba(37,150,190,0.15)] outline-none cursor-pointer"
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Direct Admission">
                          Direct Admission
                        </option>
                        <option value="Internship">Internship</option>
                        <option value="Payment Related Queries">
                          Payment Related Queries
                        </option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Enrollment">Enrollment</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-[var(--color-brand)]/50 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent focus:shadow-[0_0_15px_rgba(37,150,190,0.15)] outline-none resize-y min-h-[120px]"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-brand)] text-white rounded-lg font-medium transition-all duration-300 hover:bg-[var(--color-brand-hover)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send
                          size={18}
                          className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
