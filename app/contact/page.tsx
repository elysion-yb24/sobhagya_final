"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Phone,
  Mail,
  ArrowUpRight,
  Send,
  Clock,
  MapPin,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import WhatsAppIcon from "@/app/components/ui/WhatsAppIcon";
import ContactCosmicHero from "./_components/ContactCosmicHero";
import Tilt3DCard from "./_components/Tilt3DCard";

/* ----------------------------- contact methods ----------------------------- */

type Method = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  accent: string; // color used for halo / hover line
  external?: boolean;
};

const METHODS: Method[] = [
  {
    label: "Call Us",
    value: "+91 92119 94461",
    href: "tel:+919211994461",
    icon: <Phone className="w-6 h-6" strokeWidth={2} />,
    accent: "#F7941D",
  },
  {
    label: "WhatsApp",
    value: "+91 92119 94461",
    href: "https://wa.me/919211994461",
    icon: <WhatsAppIcon size={26} />,
    accent: "#25D366",
    external: true,
  },
  {
    label: "Email Us",
    value: "info@sobhagya.in",
    href: "mailto:info@sobhagya.in",
    icon: <Mail className="w-6 h-6" strokeWidth={2} />,
    accent: "#FFD700",
  },
];

const QUICK_FACTS = [
  { icon: Clock,        label: "Response in", value: "< 2 hours" },
  { icon: ShieldCheck,  label: "Verified",    value: "Vedic Experts" },
  { icon: Headphones,   label: "Support",     value: "24/7 Live" },
];

const SOCIALS = [
  { name: "Instagram",   href: "https://www.instagram.com/sobhagya.bhaakti", img: "/instagram.svg" },
  { name: "LinkedIn",    href: "https://linkedin.com/company/sobhagya",      img: "/linkedin.svg" },
  { name: "Play Store",  href: "https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN", img: "/play-store-small.svg" },
  { name: "App Store",   href: "https://apps.apple.com/in/app/sobhagya/id6755958411", img: "/app-store-small.svg" },
];

/* ----------------------------- main component ----------------------------- */

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    const name = formData.name.trim();
    const contact = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !contact || !message) {
      setSubmitStatus({ type: "error", text: "Please fill in all fields." });
      setTimeout(() => setSubmitStatus(null), 4000);
      return;
    }
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikePhone = /^[+()\-\s\d]{7,}$/.test(contact);
    if (!looksLikeEmail && !looksLikePhone) {
      setSubmitStatus({
        type: "error",
        text: "Please enter a valid email or phone number.",
      });
      setTimeout(() => setSubmitStatus(null), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: contact, message }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitStatus({
          type: "success",
          text: "Message sent! Our team will reach out within hours.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          text: data?.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        text: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 6000);
    }
  };

  return (
    <main className="bg-[#FFFDF9] relative overflow-hidden">
      {/* HERO */}
      <ContactCosmicHero />

      {/* QUICK FACTS strip */}
      <section className="relative section-container -mt-8 sm:-mt-10 z-20">
        <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 max-w-4xl mx-auto">
          {QUICK_FACTS.map((q, i) => {
            const Icon = q.icon;
            return (
              <motion.div
                key={q.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-[1.2px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(247,148,29,0.7), rgba(255,213,138,0.35) 50%, rgba(247,148,29,0.5))",
                  boxShadow: "0 18px 40px -22px rgba(247,148,29,0.55)",
                }}
              >
                <div
                  className="h-full rounded-[14px] px-2.5 py-3 xs:px-3 sm:px-5 sm:py-4 flex flex-col items-center text-center gap-2 sm:flex-row sm:items-center sm:text-left sm:gap-3"
                  style={{
                    background:
                      "linear-gradient(160deg, #FFFCEF 0%, #FFF3DC 100%)",
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFE7B5, #F7B23A)",
                      color: "#5a3a07",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 w-full">
                    <div
                      className="text-[9px] xs:text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase font-semibold leading-tight"
                      style={{ color: "#9a6b18", fontFamily: "Poppins" }}
                    >
                      {q.label}
                    </div>
                    <div
                      className="mt-0.5 sm:mt-0 text-[12px] xs:text-[13px] sm:text-base font-bold leading-tight break-words"
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        color: "#5a3a07",
                      }}
                    >
                      {q.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* MAIN — contact methods + form */}
      <section className="section-container py-14 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
          {/* LEFT: contact methods + socials */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                style={{ color: "#F7941D" }}
              >
                ✦ Get In Touch ✦
              </span>
              <h2
                className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  color: "#5a3a07",
                }}
              >
                Three ways to find us
              </h2>
              <p
                className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed"
                style={{ color: "#6b5230", fontFamily: "Poppins" }}
              >
                Pick your favorite channel — phone, WhatsApp or email. We
                read every message and respond personally.
              </p>
            </motion.div>

            {/* 3D-tilt contact cards */}
            <div className="mt-7 grid sm:grid-cols-1 gap-4">
              {METHODS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Tilt3DCard
                    glow={`${m.accent}aa`}
                    intensity={10}
                    className="rounded-2xl"
                  >
                    <a
                      href={m.href}
                      target={m.external ? "_blank" : undefined}
                      rel={m.external ? "noopener noreferrer" : undefined}
                      className="group block rounded-2xl p-[1.2px] focus:outline-none focus:ring-2 focus:ring-amber-400"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(247,148,29,0.7), rgba(255,213,138,0.35) 50%, rgba(247,148,29,0.6))",
                      }}
                    >
                      <div
                        className="rounded-[14px] p-4 xs:p-5 sm:p-6 flex items-center gap-3 xs:gap-4 sm:gap-5 relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(160deg, #FFFCEF 0%, #FFF3DC 100%)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* icon medallion */}
                        <div
                          className="relative shrink-0 w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${m.accent} 0%, #7a3c05 100%)`,
                            boxShadow: `0 12px 22px -8px ${m.accent}90, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                            color: "#fff",
                            transform: "translateZ(40px)",
                          }}
                        >
                          {/* inner glow */}
                          <span
                            aria-hidden
                            className="absolute inset-1 rounded-xl"
                            style={{
                              background:
                                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 60%)",
                            }}
                          />
                          <span className="relative">{m.icon}</span>
                        </div>

                        <div
                          className="flex-1 min-w-0"
                          style={{ transform: "translateZ(20px)" }}
                        >
                          <div
                            className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold"
                            style={{ color: "#9a6b18", fontFamily: "Poppins" }}
                          >
                            {m.label}
                          </div>
                          <div
                            className="mt-1 text-[15px] xs:text-base sm:text-lg font-semibold break-anywhere"
                            style={{
                              color: "#5a3a07",
                              fontFamily: "'EB Garamond', serif",
                            }}
                          >
                            {m.value}
                          </div>
                          <div
                            className="mt-2 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold relative"
                            style={{ color: m.accent, fontFamily: "Poppins" }}
                          >
                            <span className="relative">
                              {m.label === "Email Us"
                                ? "Send an email"
                                : m.label === "WhatsApp"
                                ? "Chat now"
                                : "Tap to call"}
                              <span
                                className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 group-hover:w-full transition-[width] duration-300"
                                style={{
                                  background: `linear-gradient(90deg, ${m.accent}, transparent)`,
                                }}
                              />
                            </span>
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* corner sparkle */}
                        <span
                          aria-hidden
                          className="absolute top-3 right-4 text-amber-400 opacity-60"
                          style={{ transform: "translateZ(60px)" }}
                        >
                          ✦
                        </span>
                      </div>
                    </a>
                  </Tilt3DCard>
                </motion.div>
              ))}
            </div>

            {/* socials row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9"
            >
              <div
                className="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase mb-3"
                style={{ color: "#9a6b18", fontFamily: "Poppins" }}
              >
                Follow our journey
              </div>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <motion.a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(160deg, #FFFCEF 0%, #FFE7B5 100%)",
                      border: "1px solid rgba(247,148,29,0.45)",
                      boxShadow:
                        "0 10px 22px -10px rgba(247,148,29,0.45), inset 0 1px 0 rgba(255,255,255,0.7)",
                    }}
                    aria-label={s.name}
                  >
                    <img
                      src={s.img}
                      alt={s.name}
                      className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
                    />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* small location card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex items-start gap-3 p-4 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(247,148,29,0.06), rgba(255,213,138,0.10))",
                border: "1px dashed rgba(247,148,29,0.4)",
              }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #FFE7B5, #F7B23A)",
                  color: "#5a3a07",
                }}
              >
                <MapPin className="w-5 h-5" strokeWidth={2} />
              </span>
              <div className="text-sm" style={{ color: "#5a3a07", fontFamily: "Poppins" }}>
                <div className="font-semibold">Sobhagya HQ</div>
                <div className="opacity-80 mt-0.5 leading-relaxed">
                  Serving seekers across India and the diaspora — online &
                  on-app, every day.
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Glassmorphic premium form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            {/* aura glow */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[28px] blur-2xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 50% at 50% 30%, rgba(247,148,29,0.30), transparent 70%)",
              }}
            />

            <div
              className="relative rounded-[24px] p-[1.4px]"
              style={{
                background:
                  "linear-gradient(135deg, #F7941D 0%, #FFE7B5 30%, #B86A0B 60%, #FFE7B5 85%, #F7941D 100%)",
                boxShadow:
                  "0 30px 60px -22px rgba(247,148,29,0.45), 0 0 0 1px rgba(255,213,138,0.18)",
              }}
            >
              {/* Card surface */}
              <div
                className="relative rounded-[22px] p-6 sm:p-8 lg:p-10 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, #FFFCEF 0%, #FFF3DC 100%)",
                }}
              >
                {/* corner ornaments */}
                {[
                  { c: "top-3 left-3", r: 0 },
                  { c: "top-3 right-3", r: 90 },
                  { c: "bottom-3 right-3", r: 180 },
                  { c: "bottom-3 left-3", r: 270 },
                ].map((o, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`absolute ${o.c} text-amber-500/60`}
                    style={{ transform: `rotate(${o.r}deg)` }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 2 L10 2 M2 2 L2 10 M2 2 Q8 4 10 10"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ))}

                {/* faint sunburst backdrop */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-[0.06]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #F7941D 0deg, transparent 4deg, #F7941D 12deg, transparent 16deg, #F7941D 24deg, transparent 28deg, #F7941D 36deg, transparent 40deg)",
                    borderRadius: "50%",
                  }}
                />

                <div className="text-center mb-7">
                  <span
                    className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={{ color: "#F7941D" }}
                  >
                    ✦ Send a Message ✦
                  </span>
                  <h3
                    className="mt-2 text-2xl sm:text-3xl font-bold"
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      color: "#5a3a07",
                    }}
                  >
                    Tell us what's on your mind
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <FloatingField
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FloatingField
                    name="email"
                    label="Phone or Email"
                    value={formData.email}
                    onChange={handleChange}
                    inputMode="text"
                    autoComplete="email"
                    required
                  />
                  <FloatingField
                    name="message"
                    label="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    textarea
                    required
                  />

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                    className="relative w-full sm:w-auto sm:min-w-[220px] mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #F7941D 0%, #E8850B 100%)",
                      boxShadow:
                        "0 14px 28px -10px rgba(247,148,29,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
                      fontFamily: "Poppins",
                    }}
                  >
                    {/* shimmer on hover */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-0"
                      initial={{ x: "-120%" }}
                      animate={{ x: "120%" }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        repeatDelay: 1.6,
                        ease: "easeInOut",
                      }}
                      style={{
                        background:
                          "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                        mixBlendMode: "overlay",
                      }}
                    />
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Message
                      </>
                    )}
                  </motion.button>

                  {submitStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="status"
                      aria-live="polite"
                      className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                      style={{
                        background:
                          submitStatus.type === "success"
                            ? "rgba(40,160,80,0.08)"
                            : "rgba(220,80,40,0.08)",
                        border:
                          submitStatus.type === "success"
                            ? "1px solid rgba(40,160,80,0.35)"
                            : "1px solid rgba(220,80,40,0.35)",
                        color:
                          submitStatus.type === "success"
                            ? "#1f7a44"
                            : "#a23824",
                        fontFamily: "Poppins",
                      }}
                    >
                      {submitStatus.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0" />
                      )}
                      <span>{submitStatus.text}</span>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* --------------------------- floating-label field --------------------------- */

function FloatingField({
  name,
  label,
  value,
  onChange,
  textarea = false,
  inputMode,
  autoComplete,
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  textarea?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  required?: boolean;
}) {
  const filled = value && value.length > 0;

  const baseClass =
    "peer w-full bg-transparent px-4 pt-5 pb-2 text-sm sm:text-base outline-none rounded-xl transition-colors";

  return (
    <label className="relative block">
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          filled
            ? "top-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold"
            : "top-1/2 -translate-y-1/2 text-sm"
        } peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:tracking-[0.18em] peer-focus:uppercase peer-focus:font-semibold`}
        style={{
          color: filled ? "#9a6b18" : "#a4845a",
          fontFamily: "Poppins",
        }}
      >
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={4}
          className={`${baseClass} pt-7 resize-none`}
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1.5px solid rgba(247,148,29,0.30)",
            color: "#3e2807",
            boxShadow: "inset 0 2px 4px rgba(170,100,20,0.06)",
          }}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={baseClass}
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1.5px solid rgba(247,148,29,0.30)",
            color: "#3e2807",
            boxShadow: "inset 0 2px 4px rgba(170,100,20,0.06)",
          }}
        />
      )}
      {/* focus underline accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-2 right-2 bottom-[2px] h-[2px] rounded-full origin-center scale-x-0 peer-focus:scale-x-100 transition-transform duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, #F7941D, #FFE7B5, #F7941D, transparent)",
        }}
      />
    </label>
  );
}
