 "use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Balatro from "@/components/balatro-background";
import ScrollReveal from "@/components/scroll-reveal";
import { StickyScroll } from "@/components/sticky-scroll";
import CardNav from "@/components/card-nav";
import TrashGate from "@/components/trash-gate";
import PixelCard from "@/components/pixel-card";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <TrashGate />
      {/* Fixed Balatro background with green vibes */}
      <div className="fixed inset-0 -z-10">
        <Balatro isRotate={true} mouseInteraction={true} pixelFilter={700} />
        {/* Soft vignette/grid overlay for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.35),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(22,163,74,0.3),_transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.25)_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.22]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-24 snap-y snap-mandatory">
        <CardNav
          logo="/images/ecoverse.png"
          logoAlt="Ecoverse"
          baseColor="#020617"
          menuColor="#e5e7eb"
          buttonBgColor="#22c55e"
          buttonTextColor="#020617"
          items={[
            {
              label: "Scan smarter",
              bgColor: "#22c55e",
              textColor: "#052e16",
              links: [
                {
                  label: "Open dashboard",
                  href: "/dashboard",
                  ariaLabel: "Go to dashboard",
                },
                {
                  label: "Start scanning",
                  href: "/auth/login",
                  ariaLabel: "Log in to start scanning",
                },
              ],
            },
            {
              label: "See your impact",
              bgColor: "#0f172a",
              textColor: "#e5e7eb",
              links: [
                {
                  label: "Impact metrics",
                  href: "#impact",
                  ariaLabel: "Jump to impact metrics section",
                },
                {
                  label: "City waste score",
                  href: "/dashboard",
                  ariaLabel: "Open dashboard to view city score",
                },
              ],
            },
            {
              label: "Join the crew",
              bgColor: "#16a34a",
              textColor: "#022c22",
              links: [
                {
                  label: "Team & story",
                  href: "#team",
                  ariaLabel: "Jump to team section",
                },
                {
                  label: "Get started",
                  href: "/dashboard",
                  ariaLabel: "Create an account or log in",
                },
              ],
            },
          ]}
        />

        {/* Intro section – giant logo only */}
        <motion.section
          id="intro"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="snap-start min-h-screen flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6 -mt-20">
            <div className="relative h-28 w-28 md:h-40 md:w-40 drop-shadow-[0_0_80px_rgba(34,197,94,0.85)]">
              <Image
                src="/images/ecoverse.png"
                alt="Ecoverse"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] text-emerald-100/40">
          </div>
        </motion.section>

        {/* Hero */}
        <motion.section
          id="hero"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="snap-start min-h-screen grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        >
          <div className="space-y-6">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
            >
            </motion.div>

            <ScrollReveal
              containerClassName="mt-2"
              textClassName="text-balance text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-emerald-300 via-lime-300 to-emerald-100 bg-clip-text text-white"
              baseOpacity={0.15}
              baseRotation={4}
              blurStrength={6}
            >
              Turn any waste photo into smarter disposal decisions.
            </ScrollReveal>

            <motion.p
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="max-w-xl text-sm leading-relaxed text-gray-300 sm:text-[15px]"
            >
              Ecoverse is your AI companion for waste. Scan an item, and we
              instantly tell you how harmful it is, how to dispose it, what to
              switch to, and how much CO₂ and water you can save doing it.
            </motion.p>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-gray-900 shadow-lg shadow-emerald-500/40 transition hover:shadow-xl hover:shadow-emerald-500/50"
              >
                Start making impact
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-gray-100 backdrop-blur-md transition hover:bg-white/10"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-4 grid max-w-md grid-cols-3 gap-3 text-[11px] text-gray-300"
            >
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm"
              >
                <p className="font-semibold text-emerald-300">5+ AI models</p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  GPT‑5.2, Claude 4.5, Gemini 3.5, Mistral 2.0 & more under one eco brain.
                </p>
              </motion.div>
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm"
              >
                <p className="font-semibold text-emerald-300">City impact</p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  See how your city's waste score improves over time.
                </p>
              </motion.div>
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm"
              >
                <p className="font-semibold text-emerald-300">Gamified</p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Earn eco points, climb leaderboards, challenge your mates and your city.
                </p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-tr from-emerald-400/15 via-lime-300/10 to-transparent blur-2xl" />
            <div className="relative flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex items-center justify-between text-[11px] text-gray-300"
              >
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-200">
                  Live analysis
                </span>
                <span className="text-[10px] text-gray-400">
                  Ecoverse • AI Waste Scan
                </span>
              </motion.div>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-black/40 p-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Plastic bottle</span>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                    High impact
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-red-400 via-amber-300 to-lime-300" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5"
                  >
                    <p className="text-gray-400">CO₂ footprint</p>
                    <p className="text-xs font-semibold text-emerald-200">
                      0.32 kg
                    </p>
                  </motion.div>
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5"
                  >
                    <p className="text-gray-400">Water used</p>
                    <p className="text-xs font-semibold text-emerald-200">
                      6.1 L
                    </p>
                  </motion.div>
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5"
                  >
                    <p className="text-gray-400">Recyclable</p>
                    <p className="text-xs font-semibold text-emerald-200">
                      82%
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-[11px] text-emerald-50"
              >
                <p className="font-semibold text-emerald-200">
                  Suggested eco alternative
                </p>
                <p className="text-emerald-100/90">
                  Swap to a stainless-steel bottle. Lifetime CO₂ impact drops by{" "}
                  <span className="font-semibold text-emerald-300">~85%</span>{" "}
                  after 40 uses.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Impact section */}
        <motion.section
          id="impact"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="snap-start min-h-screen space-y-6 flex flex-col justify-center"
        >
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              impact dashboard
            </p>
            <ScrollReveal
              containerClassName="my-1"
              textClassName="text-xl sm:text-2xl tracking-tight text-white"
              baseOpacity={0.2}
              baseRotation={3}
            >
              Not just insight. Measurable waste impact.
            </ScrollReveal>
            <motion.p
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="max-w-2xl text-sm text-gray-300"
            >
              Every scan updates your personal and city impact metrics —
              visualized as CO₂ saved, water protected, and smarter disposal
              decisions.
            </motion.p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <PixelCard
                variant="default"
                colors="#10b981,#34d399,#6ee7b7"
                gap={6}
                speed={30}
                className="h-full w-full p-4"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400">Total waste generated</p>
                    <p className="mt-1 text-2xl font-semibold text-white">2.01 B</p>
                    <p className="mt-1 text-[11px] text-emerald-200">
                      Billion tonnes annually • Rising to 3.4B by 2050
                    </p>
                  </div>
                  <div className="relative w-full flex-1 min-h-[200px] rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/qYJqtZYP/image.png"
                      alt="Total waste generated"
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                </div>
              </PixelCard>
            </motion.div>
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <PixelCard
                variant="default"
                colors="#10b981,#34d399,#6ee7b7"
                gap={6}
                speed={30}
                className="h-full w-full p-4"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400">Mis-managed waste</p>
                    <p className="mt-1 text-2xl font-semibold text-white">33%</p>
                    <p className="mt-1 text-[11px] text-emerald-200">
                      Globally mis-segregated • ~660M tonnes dumped or burned
                    </p>
                  </div>
                  <div className="relative w-full flex-1 min-h-[200px] rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/SDrH90Rp/Projections-for-worldwide-mismanaged-plastic-waste-generated-within-50-km-of-coastlines.png"
                      alt="Mis-managed waste"
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                </div>
              </PixelCard>
            </motion.div>
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <PixelCard
                variant="default"
                colors="#10b981,#34d399,#6ee7b7"
                gap={6}
                speed={30}
                className="h-full w-full p-4"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400">
                      Projected by 2050
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-white">3.8 B</p>
                    <p className="mt-1 text-[11px] text-emerald-200">
                      Billion tonnes if current trends continue • Action needed now
                    </p>
                  </div>
                  <div className="relative w-full flex-1 min-h-[200px] rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/MkBS4syt/SHARE-Visualizing-One-Year-of-Global-Waste-V2.jpg"
                      alt="Projected by 2050"
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Team section */}
        <motion.section
          id="team"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="snap-start min-h-screen space-y-6 flex flex-col justify-center"
        >
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              the crew
            </p>
            <ScrollReveal
              containerClassName="my-1"
              textClassName="text-xl sm:text-2xl tracking-tight text-white"
              baseOpacity={0.2}
              baseRotation={-2}
            >
              Builders who actually obsess over waste management.
            </ScrollReveal>
            <motion.p
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="max-w-2xl text-sm text-gray-300"
            >
              Ecoverse is designed for students, campuses and cities that want
              to move beyond awareness posters and into measurable action.
            </motion.p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {["Product / AI", "Climate Ops", "Community"].map((role, i) => (
              <motion.div
                key={role}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-center text-sm font-bold text-black shadow-md shadow-emerald-500/40">
                    <span className="leading-8">E</span>
                  </div>
                  <span className="text-[11px] text-emerald-200">
                    Core {i + 1}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  Ecoverse {role} lead
                </p>
                <p className="mt-2 text-[11px] text-gray-300">
                  Owns the systems that turn raw AI power into a smooth,
                  delightful waste management experience.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          id="how-it-works"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="snap-start min-h-screen space-y-6 flex flex-col justify-center"
        >
          <div className="flex flex-col gap-1.5 mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              how it works
            </p>
            <ScrollReveal
              containerClassName="my-1"
              textClassName="text-xl sm:text-2xl tracking-tight text-white"
              baseOpacity={0.2}
              baseRotation={2}
            >
              Three taps from waste photo to disposal insight.
            </ScrollReveal>
          </div>

          <StickyScroll
            content={[
              {
                title: "1 • Scan",
                description:
                  "Open “Scan now” from the dashboard or sidebar and snap the waste item in front of you.",
                content: (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/0R5HZQwH/Untitled-design-36.png"
                      alt="Scan"
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                ),
              },
              {
                title: "2 • Understand",
                description:
                  "Ecoverse breaks down impact into CO₂, water, degradability, harms, and better alternatives in plain language.",
                content: (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/xtqKSrhY/Untitled-design-37.png"
                      alt="Understand"
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                ),
              },
              {
                title: "3 • Track",
                description:
                  "Every scan updates your personal score, your city’s shared waste score, and the global leaderboard.",
                content: (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/7dQ0r5xm/Untitled-design-38.png"
                      alt="Track"
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                ),
              },
            ]}
          />
        </motion.section>

        {/* Footer / CTA */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-auto border-t border-white/10 pt-6 text-[11px] text-gray-400"
        >
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>Built for campuses, cities and waste-conscious builders.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-gray-900 shadow-md shadow-emerald-500/40 transition hover:shadow-lg hover:shadow-emerald-500/60"
              >
                Enter the Ecoverse
              </Link>
              <span className="text-[10px] text-gray-500">
                Or jump straight to dashboard once you&apos;re in.
              </span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}



