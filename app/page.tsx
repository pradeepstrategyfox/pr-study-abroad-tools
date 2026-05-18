import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="gradient-mesh bg-white">
        <div className="max-w-5xl mx-auto px-5 pt-16 sm:pt-24 md:pt-28 pb-16 md:pb-24 text-center">
          <p className="text-[14px] md:text-[15px] font-medium text-[#0071e3] mb-4 md:mb-5">PR Study Abroad · Free Tools</p>
          <h1 className="title-display text-[40px] sm:text-6xl md:text-7xl text-[#1d1d1f]">
            Apply abroad,<br />with clarity.
          </h1>
          <p className="mt-6 md:mt-7 text-[17px] md:text-[21px] text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
            A personalized admit predictor and a country-wise cost calculator, built for Indian students. No signup. No noise.
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/university-match" className="btn-primary inline-flex items-center justify-center">
              Predict my admits
            </Link>
            <Link href="/cost-calculator" className="btn-ghost inline-flex items-center justify-center">
              Calculate total cost
            </Link>
          </div>

          {/* Stats strip floating on hero gradient */}
          <div className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            <Stat n="99%" label="Visa success rate" />
            <Stat n="500+" label="University partners" />
            <Stat n="7.5+" label="Avg IELTS score" />
            <Stat n="15+ yrs" label="Counselling experience" />
          </div>
        </div>
      </section>

      {/* TOOL CARDS */}
      <section className="bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-4 md:gap-5">
          <FeatureCard
            href="/university-match"
            title="Admit Predictor."
            subtitle="Find your fit."
            desc="Tell us your profile. We rank universities into Ambitious, Target and Safe buckets with admit probabilities. Real schools, real reasoning."
          />
          <FeatureCard
            href="/cost-calculator"
            title="Cost Calculator."
            subtitle="No surprises."
            desc="Country and city-wise INR breakdown: tuition, living, visa, flights, insurance. Year-on-year, with your monthly burn rate."
          />
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[14px] font-medium text-[#0071e3] mb-3">Top study destinations</p>
            <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f]">Where Indian students go.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <DestinationCard country="UK" tagline="One-year masters, top global brands." emoji="🇬🇧" />
            <DestinationCard country="Canada" tagline="PR-friendly post-study work pathway." emoji="🇨🇦" />
            <DestinationCard country="Australia" tagline="Strong PR pipeline, year-round intake." emoji="🇦🇺" />
            <DestinationCard country="Germany" tagline="Near-free tuition, top engineering schools." emoji="🇩🇪" />
            <DestinationCard country="Ireland" tagline="EU degrees, big-tech hub in Dublin." emoji="🇮🇪" />
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[14px] font-medium text-[#0071e3] mb-3">Our process</p>
            <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f]">From dream to departure.</h2>
            <p className="mt-4 text-[16px] text-[#6e6e73] leading-relaxed">A structured pathway with hands-on support at every stage.</p>
          </div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <Step n="01" title="Free counselling" desc="A 1-on-1 profile review. Goals, options, realistic timelines." />
            <Step n="02" title="University selection" desc="Ambitious to Safe shortlist tailored to your profile and budget." />
            <Step n="03" title="Applications & test prep" desc="SOPs, LORs, IELTS / TOEFL / PTE / GRE coaching when needed." />
            <Step n="04" title="Visa & finance" desc="Documentation, loan guidance, scholarship support." />
            <Step n="05" title="Pre-departure" desc="Forex, accommodation, packing list, mentor connect on the ground." />
          </ol>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-24">
          <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f] max-w-3xl">
            Designed for the<br />Indian student journey.
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-10 md:mt-14">
            <Bullet h="End-to-end guidance" t="From profile evaluation to visa, accommodation and post-arrival, one team for the entire journey." />
            <Bullet h="Real INR numbers" t="No abstract dollar figures. Tuition, living, flights, visa and insurance — all in rupees, year by year." />
            <Bullet h="Counsellor-backed" t="Free to use, with real counsellors a click away. Book a 1-on-1 anytime at prstudyabroad.com." />
          </div>
        </div>
      </section>

      {/* EXAM PREP */}
      <section className="bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-[14px] font-medium text-[#0071e3] mb-3">Test preparation</p>
            <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f]">IELTS, TOEFL, PTE.<br />All under one roof.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3 md:gap-4">
            <PrepCard exam="IELTS" score="7.5+ avg." note="Academic and General. Mock tests, 1-on-1 speaking sessions, band-wise plan." />
            <PrepCard exam="TOEFL" score="105+ avg." note="Internet-based prep with structured writing and listening drills." />
            <PrepCard exam="PTE" score="79+ avg." note="Computer-based scoring practice with personalised feedback." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[14px] font-medium text-[#0071e3] mb-3">Frequently asked</p>
            <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f]">Quick answers.</h2>
          </div>
          <div className="space-y-3">
            <FAQ q="Are these tools really free?" a="Yes. The admit predictor and cost calculator are free to use, with no signup. You only share contact details if you want the PDF emailed to you." />
            <FAQ q="How accurate is the admit prediction?" a="Predictions are indicative, based on published admission ranges across 65+ universities. A PR Study Abroad counsellor refines the shortlist once they review the full profile." />
            <FAQ q="Which countries are supported right now?" a="UK, Canada, Australia, Germany and Ireland across MS, MBA and undergraduate programs." />
            <FAQ q="Do I need IELTS or GRE to use the tool?" a="No. Both fields are optional. Submitting a competitive score sharpens the prediction, especially for top US-style programs that historically expected the GRE." />
            <FAQ q="Will someone contact me?" a="Only if you request the PDF report. A counsellor will reach out by email or phone within one business day." />
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="bg-[#1d1d1f] text-white">
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-24 text-center">
          <h2 className="title-section text-3xl md:text-5xl">Ready when you are.</h2>
          <p className="mt-4 text-[16px] md:text-[18px] text-white/70 max-w-xl mx-auto leading-relaxed">
            Run the tools, share the PDF, then book a free consultation with PR Study Abroad to refine your plan.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/university-match" className="inline-flex items-center justify-center bg-white text-black rounded-full px-7 py-3.5 font-medium text-[15px] hover:opacity-90">
              Start with the predictor
            </Link>
            <a href="https://prstudyabroad.com" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full px-7 py-3.5 font-medium text-[15px] border border-white/30 hover:bg-white/10">
              Book a consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="liquid rounded-2xl px-4 py-5 md:px-6 md:py-6 text-center">
      <div className="title-section text-2xl md:text-4xl text-[#1d1d1f]">{n}</div>
      <div className="text-[12px] md:text-[13px] text-[#6e6e73] mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ href, title, subtitle, desc }: { href: string; title: string; subtitle: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl md:rounded-3xl bg-white p-7 md:p-12 hover:-translate-y-0.5 transition-transform"
    >
      <h3 className="title-section text-2xl md:text-4xl text-[#1d1d1f]">
        {title}<br /><span className="text-[#6e6e73]">{subtitle}</span>
      </h3>
      <p className="mt-4 md:mt-5 text-[15px] text-[#1d1d1f]/80 leading-relaxed">{desc}</p>
      <div className="mt-5 md:mt-6 inline-flex items-center text-[#0071e3] font-medium text-[15px] group-hover:translate-x-0.5 transition-transform">
        Open tool →
      </div>
    </Link>
  );
}

function DestinationCard({ country, tagline, emoji }: { country: string; tagline: string; emoji: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 ring-1 ring-black/[0.06] hover:ring-black/20 transition-all hover:-translate-y-0.5">
      <div className="text-3xl md:text-4xl">{emoji}</div>
      <div className="mt-3 font-semibold text-[#1d1d1f] text-lg">{country}</div>
      <p className="mt-1 text-[13px] text-[#6e6e73] leading-relaxed">{tagline}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <li className="rounded-2xl bg-white p-6 ring-1 ring-black/[0.05]">
      <div className="text-[12px] font-semibold tracking-widest text-[#0071e3]">{n}</div>
      <div className="mt-3 font-semibold text-[#1d1d1f] text-lg">{title}</div>
      <p className="mt-2 text-[13px] text-[#6e6e73] leading-relaxed">{desc}</p>
    </li>
  );
}

function Bullet({ h, t }: { h: string; t: string }) {
  return (
    <div>
      <div className="font-semibold text-[#1d1d1f] text-lg">{h}</div>
      <div className="text-[15px] mt-2 text-[#6e6e73] leading-relaxed">{t}</div>
    </div>
  );
}

function PrepCard({ exam, score, note }: { exam: string; score: string; note: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-7 ring-1 ring-black/[0.06]">
      <div className="flex items-baseline gap-3">
        <div className="title-section text-2xl text-[#1d1d1f]">{exam}</div>
        <div className="text-[13px] font-medium text-[#0071e3]">{score}</div>
      </div>
      <p className="mt-3 text-[14px] text-[#6e6e73] leading-relaxed">{note}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-[#f5f5f7] p-5 md:p-6 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="font-semibold text-[#1d1d1f] text-[15px] md:text-[16px]">{q}</span>
        <span className="text-[#6e6e73] text-xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-[14px] text-[#6e6e73] leading-relaxed">{a}</p>
    </details>
  );
}
