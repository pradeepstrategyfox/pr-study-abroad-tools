import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 pt-28 pb-24 text-center">
          <p className="text-[15px] font-medium text-[#0071e3] mb-5">PR Study Abroad — Free Tools</p>
          <h1 className="title-display text-5xl md:text-7xl text-[#1d1d1f]">
            Apply abroad,<br />with clarity.
          </h1>
          <p className="mt-7 text-[19px] md:text-[21px] text-[#6e6e73] max-w-2xl mx-auto leading-relaxed">
            A personalized admit predictor and a country-wise cost calculator — built for Indian students. No signup. No noise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/university-match" className="btn-primary inline-flex items-center justify-center">
              Predict my admits
            </Link>
            <Link href="/cost-calculator" className="btn-ghost inline-flex items-center justify-center">
              Calculate total cost
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-5">
          <FeatureCard
            href="/university-match"
            tag="Tool 01"
            title="Admit Predictor."
            subtitle="Find your fit."
            desc="Tell us your profile — we rank 70+ universities into Ambitious, Target and Safe buckets with admit probabilities. Real schools, real reasoning."
          />
          <FeatureCard
            href="/cost-calculator"
            tag="Tool 02"
            title="Cost Calculator."
            subtitle="No surprises."
            desc="Country and city-wise INR breakdown — tuition, living, visa, flights, insurance. Year-on-year, with your monthly burn rate."
          />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 py-24">
          <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f] max-w-3xl">
            Designed for the<br />Indian student journey.
          </h2>
          <div className="grid md:grid-cols-3 gap-12 mt-14">
            <Bullet h="70+ universities" t="Curated across the US, UK, Canada, Australia, Germany and Ireland. MS, MBA and UG programs." />
            <Bullet h="Real INR numbers" t="No abstract dollar figures. Tuition, living, flights, visa and insurance — all in rupees, year by year." />
            <Bullet h="Counsellor-backed" t="Built by PR Study Abroad. Free to use. Book a 1-on-1 with our counsellors anytime." />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ href, tag, title, subtitle, desc }: { href: string; tag: string; title: string; subtitle: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl bg-white p-10 md:p-12 hover:-translate-y-0.5 transition-transform"
    >
      <div className="text-[12px] font-medium uppercase tracking-widest text-[#0071e3]">{tag}</div>
      <h3 className="mt-3 title-section text-3xl md:text-4xl text-[#1d1d1f]">
        {title}<br /><span className="text-[#6e6e73]">{subtitle}</span>
      </h3>
      <p className="mt-5 text-[15px] text-[#1d1d1f]/80 leading-relaxed">{desc}</p>
      <div className="mt-6 inline-flex items-center text-[#0071e3] font-medium text-[15px] group-hover:translate-x-0.5 transition-transform">
        Open tool →
      </div>
    </Link>
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
