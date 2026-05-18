import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <p className="uppercase tracking-wider text-indigo-100 text-sm mb-3">PR Study Abroad — Free Tools</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
            Find the right universities. Know the exact cost. Before you apply.
          </h1>
          <p className="mt-5 text-lg text-indigo-100 max-w-2xl">
            Two free tools built for Indian students: a personalized admit predictor and a country-wise cost calculator in INR. Get a full PDF report you can share with your family — straight to your inbox.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/university-match" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50">
              Predict my admits →
            </Link>
            <Link href="/cost-calculator" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-indigo-500/30 ring-1 ring-white/40 text-white font-semibold hover:bg-indigo-500/50">
              Calculate total cost →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card
            href="/university-match"
            title="University Match & Admit Predictor"
            desc="Enter your 10th/12th marks, UG CGPA, work experience, target country, budget and test scores. We bucket universities into Ambitious / Target / Safe with admit probabilities."
            cta="Open Admit Predictor"
            tag="Tool 1"
          />
          <Card
            href="/cost-calculator"
            title="Study Abroad Cost Calculator"
            desc="Country and city-wise itemized cost in INR — tuition, living, visa, flights, insurance, miscellaneous. Year-by-year breakdown plus your monthly burn rate."
            cta="Open Cost Calculator"
            tag="Tool 2"
          />
        </div>

        <div className="mt-16 rounded-2xl bg-white border border-slate-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold">Why students use these tools</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6 text-slate-700">
            <Bullet h="80+ universities" t="Curated across USA, UK, Canada, Australia, Germany, Ireland — across MS, MBA, and UG programs." />
            <Bullet h="Real INR numbers" t="No abstract dollar figures. Tuition + living + flights + visa + insurance, all in rupees, year-on-year." />
            <Bullet h="Counsellor backed" t="Created by PR Study Abroad. Free for everyone; book a 1:1 with our counsellors anytime." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ href, title, desc, cta, tag }: { href: string; title: string; desc: string; cta: string; tag: string }) {
  return (
    <Link href={href} className="group rounded-2xl bg-white border border-slate-200 p-7 hover:border-indigo-400 hover:shadow-lg transition block">
      <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">{tag}</div>
      <h3 className="text-xl font-bold group-hover:text-indigo-700">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
      <div className="mt-5 inline-flex items-center text-indigo-700 font-semibold group-hover:translate-x-0.5 transition">{cta} →</div>
    </Link>
  );
}

function Bullet({ h, t }: { h: string; t: string }) {
  return (
    <div>
      <div className="font-semibold text-slate-900">{h}</div>
      <div className="text-sm mt-1">{t}</div>
    </div>
  );
}
