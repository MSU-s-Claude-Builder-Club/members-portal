import { Instagram, Linkedin, Code, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAuth } from "@/contexts/AuthContext";
import InteractiveLogo from "@/components/InteractiveLogo";

/* Recipe class strings — see DESIGN.md §3–5 */
const EYEBROW =
  "font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";
const CTA_PRIMARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 border-2 border-border bg-page px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground motion-reduce:transition-none";
const CTA_QUIET =
  "inline-flex min-h-[44px] items-center justify-center gap-2 border border-border bg-page px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:bg-tint motion-reduce:transition-none";
/* Knockout CTAs for the orange flood: white chrome on the accent */
const CTA_KNOCKOUT_FILLED =
  "inline-flex min-h-[44px] items-center justify-center gap-2 border-2 border-primary-foreground bg-primary-foreground px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-primary transition-colors duration-200 hover:border-foreground hover:bg-foreground hover:text-page motion-reduce:transition-none";
const CTA_KNOCKOUT_OUTLINE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 border-2 border-primary-foreground bg-transparent px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors duration-200 hover:bg-primary-foreground hover:text-primary motion-reduce:transition-none";

/* The four pillars — copy carried over verbatim */
const pillars = [
  {
    eyebrow: "Pillar 01 · Client work",
    icon: Code,
    title: "Innovative Projects",
    body: "Partner with companies far and wide to give students real-world experience. Build and deploy production-grade applications, work with actual clients, and create solutions that matter. From startups to established firms, our members gain invaluable hands-on experience building software that ships.",
  },
  {
    eyebrow: "Pillar 02 · Education",
    icon: GraduationCap,
    title: "Education Pipeline",
    body: "Learn from industry experts and seasoned professionals. Master system design, conquer LeetCode, and prepare for top-tier internships at FAANG and beyond. Our comprehensive curriculum covers everything from technical interviews to real-world engineering practices, setting you up for success in the competitive tech landscape.",
  },
  {
    eyebrow: "Pillar 03 · AI support",
    icon: Sparkles,
    title: "AI Development Support",
    body: "Kickstart your AI journey with $50 in Claude API credits for every member. Experiment with cutting-edge language models, build intelligent applications, and bring your AI ideas to life without financial barriers. We believe in removing obstacles so you can focus on innovation and creativity.",
  },
  {
    eyebrow: "Pillar 04 · Showcase",
    icon: Trophy,
    title: "The Devvys",
    body: "Our annual project showcase where innovation takes center stage. Present your personal projects, hackathon wins, or client work in front of recruiters, professors, and the MSU community. Compete for recognition, network with industry leaders, and celebrate the incredible work our members create throughout the year.",
  },
];

/* Vision items — copy carried over verbatim */
const visionItems = [
  {
    eyebrow: "Travel fund",
    title: "Send Students to the World",
    body: "We're building a fund to send hand-picked students to premier hackathons and tech conferences across the country. Experience MLH events, attend cutting-edge AI conferences, and represent MSU on the national stage. Your talent deserves a global platform.",
  },
  {
    eyebrow: "Hackathons",
    title: "Host Internal Hackathons",
    body: "Create a culture of rapid prototyping and innovation right here at MSU. Our internal hackathons bring together the brightest minds to solve real problems, experiment with new technologies, and build the future—all in an intense, collaborative, and fun environment.",
  },
  {
    eyebrow: "Ecosystem",
    title: "Build the Future Together",
    body: "This is just the beginning. We're creating an ecosystem where students don't just learn about technology—they shape it. Join us in building something extraordinary.",
  },
];

/* Receipts — every figure already stated elsewhere on this page */
const receipts = [
  { label: "Claude API credits", value: "$50", note: "for every member", emphasized: true },
  { label: "Pillars", value: "04", note: "projects · education · AI · showcase", emphasized: false },
  { label: "Annual showcase", value: "01", note: "The Devvys", emphasized: false },
  { label: "Home base", value: "MSU", note: "registered student org", emphasized: false },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-page text-foreground">
      {/* ============ NAV — the chrome demonstrates the accent system ============ */}
      <header className="group/nav hatch sticky top-0 z-50 border-b border-border bg-page transition-colors duration-200 hover:border-primary hover:bg-primary motion-reduce:transition-none">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/claude-logo-transparent.png"
              alt="Claude Logo"
              className="h-5 w-5 object-contain transition-[filter] duration-200 group-hover/nav:brightness-0 group-hover/nav:invert motion-reduce:transition-none"
            />
            <span className="truncate font-mono text-[13px] font-semibold uppercase tracking-[-0.02em] transition-colors duration-200 group-hover/nav:text-primary-foreground motion-reduce:transition-none">
              <span className="md:hidden">CBC — MSU</span>
              <span className="hidden md:inline">Claude Builder Club — MSU</span>
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden items-center gap-6 md:flex" aria-label="Social links">
              <a
                href="https://www.instagram.com/claudemsu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 transition-colors duration-200 hover:underline group-hover/nav:text-primary-foreground motion-reduce:transition-none"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/claude-msu/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 transition-colors duration-200 hover:underline group-hover/nav:text-primary-foreground motion-reduce:transition-none"
              >
                LinkedIn
              </a>
            </nav>

            <button
              onClick={() => navigate(user ? "/dashboard" : "/auth#login")}
              className="inline-flex h-10 items-center border-2 border-border bg-page px-4 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors duration-200 hover:!bg-primary-foreground hover:!text-primary group-hover/nav:border-primary-foreground group-hover/nav:bg-primary group-hover/nav:text-primary-foreground motion-reduce:transition-none"
            >
              {user ? "Dashboard" : "Sign in"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16 md:px-12 md:py-28">
            <div>
              <p className={`${EYEBROW} flex items-center gap-2`}>
                <img src="/msu-logo.png" alt="MSU" className="h-4 w-4 object-contain" />
                Michigan State University · Registered Student Org
              </p>

              <h1 className="mt-6 font-sans text-[clamp(40px,7vw,84px)] font-bold leading-[1.05] tracking-[-0.035em]">
                We build with <span className="text-primary">Claude</span>.
              </h1>

              <p className="mt-6 max-w-[55ch] text-[15px] font-light leading-relaxed text-ink-soft md:text-base">
                We're a community of ambitious builders, innovators, and learners who are
                passionate about leveraging AI to create real-world impact. From professional
                client work to cutting-edge research, we're pushing the boundaries of what's
                possible with technology.
              </p>

              <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
                <button onClick={() => navigate("/auth#signup")} className={CTA_PRIMARY}>
                  Join the club <span aria-hidden="true">→</span>
                </button>
                <button onClick={() => navigate("/auth#login")} className={CTA_QUIET}>
                  Sign in
                </button>
              </div>
            </div>

            <InteractiveLogo />
          </div>
        </section>

        {/* ============ RECEIPTS — hairline-collapsed stat strip ============ */}
        <section aria-label="Club facts" className="overflow-hidden border-b border-border">
          <div className="-ml-px -mt-px grid grid-cols-2 md:grid-cols-4">
            {receipts.map((stat) => (
              <div key={stat.label} className="border-l border-t border-border px-6 py-8 md:px-10 md:py-10">
                <p className={EYEBROW}>{stat.label}</p>
                <p
                  className={`mt-3 font-sans text-4xl font-bold tracking-[-0.02em] tabular-nums md:text-5xl ${
                    stat.emphasized ? "text-primary" : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ SECTION 01 — WHAT WE DO ============ */}
        <section className="mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
          <div className="max-w-[68ch]">
            <p className={EYEBROW}>Section 01 — What we do</p>
            <h2 className="mt-3 font-mono text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">
              What we do
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Four pillars that define our commitment to excellence.
            </p>
          </div>

          <div className="mt-10 grid border-l border-t border-border md:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="group border-b border-r border-border p-6 transition-colors duration-200 hover:bg-foreground motion-reduce:transition-none md:p-10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-200 group-hover:text-page/60 motion-reduce:transition-none">
                      {pillar.eyebrow}
                    </p>
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-foreground transition-colors duration-200 group-hover:text-page motion-reduce:transition-none"
                    />
                  </div>
                  <h3 className="mt-4 font-sans text-xl font-bold tracking-[-0.02em] text-foreground transition-colors duration-200 group-hover:text-page motion-reduce:transition-none md:text-2xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft transition-colors duration-200 group-hover:text-page/70 motion-reduce:transition-none">
                    {pillar.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============ SECTION 02 — OUR VISION ============ */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 md:px-12 md:pb-28">
          <div className="max-w-[68ch]">
            <p className={EYEBROW}>Section 02 — Our vision</p>
            <h2 className="mt-3 font-mono text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">
              Our vision
            </h2>
          </div>

          <div className="mt-10 divide-y divide-border border border-border">
            {visionItems.map((item) => (
              <article
                key={item.title}
                className="group grid gap-4 p-6 transition-colors duration-200 hover:bg-foreground motion-reduce:transition-none md:grid-cols-[260px_minmax(0,1fr)] md:gap-10 md:p-10"
              >
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-200 group-hover:text-page/60 motion-reduce:transition-none">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-2 font-sans text-lg font-bold tracking-[-0.02em] text-foreground transition-colors duration-200 group-hover:text-page motion-reduce:transition-none md:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="max-w-[68ch] text-[15px] leading-relaxed text-ink-soft transition-colors duration-200 group-hover:text-page/70 motion-reduce:transition-none">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ============ SECTION 03 — JOIN + FOOTER: the page closes orange ============ */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary-foreground/70">
              Section 03 — Join
            </p>
            <h2 className="mt-4 font-mono text-3xl font-extrabold tracking-[-0.03em] text-primary-foreground md:text-5xl">
              Spread the joy of CS.
            </h2>
            <p className="mt-4 max-w-[55ch] text-[15px] leading-relaxed text-primary-foreground/85 md:text-base">
              Join a community where innovation meets opportunity, and passion drives progress.
            </p>

            <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
              <button onClick={() => navigate("/auth#signup")} className={CTA_KNOCKOUT_FILLED}>
                Apply Now <span aria-hidden="true">→</span>
              </button>
              <button
                onClick={() => window.open("https://www.instagram.com/claudemsu", "_blank")}
                className={CTA_KNOCKOUT_OUTLINE}
              >
                <Instagram aria-hidden="true" className="h-4 w-4" />
                Instagram
              </button>
              <button
                onClick={() => window.open("https://www.linkedin.com/company/claude-msu/", "_blank")}
                className={CTA_KNOCKOUT_OUTLINE}
              >
                <Linkedin aria-hidden="true" className="h-4 w-4" />
                LinkedIn
              </button>
            </div>
          </div>

          <footer className="border-t border-primary-foreground/30">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">
              <div className="flex items-center gap-3">
                <img
                  src="/claude-logo-transparent.png"
                  alt="Claude Logo"
                  className="h-6 w-6 object-contain brightness-0 invert"
                />
                <span className="font-mono text-[13px] font-semibold uppercase tracking-[-0.02em]">
                  Claude Builder Club @ MSU
                </span>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground/70">
                Claude Builder Club. Spreading the joy of CS, one project at a time.
              </p>

              <div className="flex items-center gap-6">
                <a
                  href="mailto:RSO.claudemsu@msu.edu"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4 transition-colors duration-200 hover:text-primary-foreground/70 motion-reduce:transition-none"
                >
                  Email us
                </a>
                <a
                  href="https://github.com/claude-msu/members-portal/issues/new/choose"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4 transition-colors duration-200 hover:text-primary-foreground/70 motion-reduce:transition-none"
                >
                  Report an Issue
                </a>
              </div>
            </div>
          </footer>
        </section>
      </main>

      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default Index;
