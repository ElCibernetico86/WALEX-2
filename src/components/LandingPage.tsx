import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronRight, Paintbrush, Home, ShieldCheck, Star, Phone, MapPin, Menu, X, CheckCircle2, Check, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import { useSiteContent } from "../useSiteContent";
import type { SiteContent } from "../siteContent";

const Navbar = ({ c }: { c: SiteContent }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(1000); // fallback
  const { scrollY } = useScroll();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const triggerStart = windowHeight - 100;
  const triggerEnd = windowHeight + 50;

  const navPadding = useTransform(scrollY, [triggerStart, triggerEnd], ["1.5rem", "1rem"]);
  const navBackground = useTransform(scrollY, [triggerStart, triggerEnd], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.7)"]);
  const navBorder = useTransform(scrollY, [triggerStart, triggerEnd], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.2)"]);
  const navBlur = useTransform(scrollY, [triggerStart, triggerEnd], ["blur(0px)", "blur(12px)"]);

  const primaryColor = useTransform(scrollY, [triggerStart, triggerEnd], ["#ffffff", "#002366"]); // transition to royalty-blue
  const textColor = useTransform(scrollY, [triggerStart, triggerEnd], ["#ffffff", "#0f172a"]); // transition to slate-900
  const subTextColor = useTransform(scrollY, [triggerStart, triggerEnd], ["rgba(255, 255, 255, 0.6)", "rgb(100, 116, 139)"]); // transition to slate-500

  return (
    <motion.nav
      className="fixed top-0 w-full z-50 border-b"
      style={{
        paddingTop: navPadding,
        paddingBottom: navPadding,
        backgroundColor: navBackground,
        borderColor: navBorder,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl"
            style={{
              backgroundColor: primaryColor,
              WebkitMaskImage: `url('${import.meta.env.BASE_URL}logo.png')`,
              WebkitMaskSize: "cover",
              WebkitMaskPosition: "center",
              maskImage: `url('${import.meta.env.BASE_URL}logo.png')`,
              maskSize: "cover",
              maskPosition: "center"
            }}
            aria-label="WALEX Logo"
            role="img"
          />
          <div className="flex flex-col w-[110px] leading-none">
            <motion.div
              className="flex justify-between w-full font-display font-bold text-xl"
              style={{ color: primaryColor }}
            >
              {c.business.name.split("").map((char, i) => (
                <span key={i} className="inline-block">{char}</span>
              ))}
            </motion.div>
            <motion.div
              className="flex justify-between w-full font-display text-[6px] font-black uppercase mt-[1px]"
              style={{ color: subTextColor }}
            >
              {c.business.tagline.split("").map((char, i) => (
                <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {c.nav.links.map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: textColor }}
            >
              {item}
            </motion.a>
          ))}
          <button className="bg-royalty-blue text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-900 transition-all">
            {c.nav.cta}
          </button>
        </div>

        <motion.button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: textColor }}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white border-b p-6 flex flex-col gap-4 md:hidden shadow-xl"
        >
          {c.nav.links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-lg font-medium text-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button className="bg-royalty-blue text-white px-5 py-3 rounded-xl text-center font-semibold">
            {c.nav.cta}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

const Hero = ({ c }: { c: SiteContent }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden flex items-center justify-center bg-slate-950">
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img
          src={c.hero.backgroundImage}
          alt={c.hero.backgroundAlt}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-royalty-blue/40 via-transparent to-slate-950" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ opacity }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            <span className="text-sm font-medium text-white/90">{c.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight text-balance">
            {c.hero.headlineTop} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">{c.hero.headlineBottom}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            {c.hero.body}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/90">
              <CheckCircle2 className="w-4 h-4" /> {c.hero.chip}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-accent-gold text-royalty-blue px-8 py-4 rounded-full font-bold text-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 group">
              {c.hero.ctaPrimary} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              {c.hero.ctaSecondary}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = ({ c }: { c: SiteContent }) => {
  /* Icons and column spans are layout, not content — they stay here and pair
     with c.services.items by position. */
  const icons = [
    <Home className="w-6 h-6" />,
    <Paintbrush className="w-6 h-6" />,
    <ShieldCheck className="w-6 h-6" />,
    <Star className="w-6 h-6" />,
  ];
  const spans = ["md:col-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-2"];
  const services = c.services.items.map((item, i) => ({
    ...item,
    icon: icons[i % icons.length],
    span: spans[i % spans.length],
  }));

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">{c.services.headingTop} <br /><span className="text-royalty-blue">{c.services.headingBottom}</span></h2>
          <p className="text-xl text-slate-500 max-w-2xl">{c.services.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`apple-card group relative ${service.span}`}
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-10 p-10 h-full flex flex-col justify-between min-h-[300px]">
                <div>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -5, rotate: 5 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-royalty-blue mb-6"
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-8">
                  <button className="text-royalty-blue font-semibold flex items-center gap-1 group/btn">
                    {c.services.linkLabel} <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = ({ c }: { c: SiteContent }) => {
  const steps = c.process.steps;

  return (
    <section id="process" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">{c.process.heading}</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">{c.process.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="text-7xl font-bold text-royalty-blue/10 mb-6">{step.number}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.text}</p>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-6 w-12 h-[1px] bg-slate-200" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = ({ c }: { c: SiteContent }) => {
  const images = c.gallery.images;

  return (
    <section id="gallery" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{c.gallery.heading}</h2>
          <p className="text-xl text-slate-500">{c.gallery.intro}</p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-royalty-blue font-bold">
          {c.gallery.cta} <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 0.98 }}
            className="aspect-square rounded-3xl overflow-hidden bg-slate-100"
          >
            <img
              src={img}
              alt={`Project ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* Testimonials removed 2026-09-12. This section previously carried three
   invented customers (Sarah Jenkins / Michael Chen / David Miller) and a
   five-star rating graphic. Fabricated endorsements are deceptive advertising
   under FTC rules, and the stars implied a rating that doesn't exist yet.

   Replaced with verifiable credentials until there are real reviews to show.
   When Google reviews exist, bring quotes back here — real name, real city,
   real words. */
const Credentials = ({ c }: { c: SiteContent }) => {
  const facts = c.credentials.facts;

  return (
    <section id="credentials" className="py-24 bg-royalty-blue text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{c.credentials.heading}</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">{c.credentials.intro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facts.map((fact, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-[32px]"
            >
              <div className="font-bold text-2xl mb-4 text-accent-gold">{fact.title}</div>
              <p className="text-lg text-white/80 leading-relaxed">{fact.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ c }: { c: SiteContent }) => {
  return (
    <footer className="bg-slate-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 bg-white rounded-xl"
                style={{
                  WebkitMaskImage: `url('${import.meta.env.BASE_URL}logo.png')`,
                  WebkitMaskSize: "cover",
                  WebkitMaskPosition: "center",
                  maskImage: `url('${import.meta.env.BASE_URL}logo.png')`,
                  maskSize: "cover",
                  maskPosition: "center"
                }}
                aria-label="WALEX Logo"
                role="img"
              />
              <div className="flex flex-col w-[150px] leading-none">
                <div className="flex justify-between w-full font-display font-bold text-2xl">
                  {c.business.name.split("").map((char, i) => (
                    <span key={i} className="inline-block">{char}</span>
                  ))}
                </div>
                <div className="flex justify-between w-full font-display text-[8px] font-black uppercase text-white/40 mt-[2px]">
                  {c.business.tagline.split("").map((char, i) => (
                    <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/50 max-w-sm mb-8 leading-relaxed">
              {c.footer.blurb}
            </p>
            <div className="flex gap-4">
              <a href={c.business.phoneHref} aria-label={`Call ${c.business.legalName}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">{c.footer.serviceAreasHeading}</h4>
            <ul className="space-y-4 text-white/50">
              {c.business.serviceAreas.map((area) => (<li key={area}>{area}</li>))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">{c.footer.contactHeading}</h4>
            <ul className="space-y-4 text-white/50">
              <li><a href={c.business.phoneHref} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4" /> {c.business.phoneDisplay}</a></li>
                            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {c.business.location}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:row justify-between items-center gap-4 text-white/30 text-sm">
          <p>{c.footer.copyright}</p>
          <div className="flex gap-8">
            {c.footer.legalLinks.map((label) => (
              <a key={label} href="#" className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* Bonuses removed 2026-09-12 at Alex's request — a free colour consultation
   ($150), free drywall/crack repair ($200), a free touch-up kit ($75) and
   priority 48-hour scheduling, headlined as "Over $425 in bonuses". He hasn't
   committed to honouring them yet, and a promise you can't keep is worse than
   no promise.

   That left a one-item value stack, which is not a value stack. The section is
   now built around the strongest honest copy on the page — the argument for
   why he isn't the cheapest bid. Bring the stack back if and when the bonuses
   are real. */
const Offer = ({ c }: { c: SiteContent }) => {
  return (
    <section id="offer" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent-gold/15 border border-accent-gold/30">
          <Check className="w-4 h-4 text-yellow-700" strokeWidth={3} />
          <span className="text-sm font-semibold text-royalty-blue">{c.offer.badge}</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 text-balance">
          {c.offer.heading}
        </h2>

        {c.offer.paragraphs.map((text, i) => (
          <p key={i} className={`text-lg text-slate-600 leading-relaxed ${i === c.offer.paragraphs.length - 1 ? "mb-10" : "mb-6"}`}>
            {text}
          </p>
        ))}

        <button className="bg-accent-gold text-royalty-blue px-8 py-4 rounded-full font-bold text-lg hover:brightness-105 transition-all inline-flex items-center gap-2">
          {c.offer.cta} <ChevronRight className="w-5 h-5" />
        </button>
        <p className="text-slate-400 text-sm mt-3">{c.offer.ctaNote}</p>
      </div>
    </section>
  );
};

const Guarantee = ({ c }: { c: SiteContent }) => {
  const shields = c.guarantee.shields;

  return (
    <section id="guarantee" className="py-24 bg-royalty-blue text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent-gold/15 border border-accent-gold/30">
          <ShieldCheck className="w-4 h-4 text-accent-gold" />
          <span className="text-sm font-semibold text-accent-gold">{c.guarantee.badge}</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-5 text-balance">{c.guarantee.heading}</h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-14">{c.guarantee.intro}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {shields.map((s) => (
            <motion.div
              key={s.n}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[32px]"
            >
              <div className="w-10 h-10 rounded-full bg-accent-gold text-royalty-blue font-bold flex items-center justify-center mb-5">{s.n}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-white/70 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  /* One fetch for the whole page — content flows down as props so no component
     goes looking for its own copy. */
  const c = useSiteContent();

  return (
    <div className="min-h-screen">
      <Navbar c={c} />
      <Hero c={c} />
      <Services c={c} />
      <Offer c={c} />
      <Process c={c} />
      <Gallery c={c} />
      <Guarantee c={c} />
      <Credentials c={c} />
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-royalty-blue/40 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">{c.finalCta.headingTop} <br />{c.finalCta.headingBottom}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-accent-gold/15 border border-accent-gold/30">
                <CalendarClock className="w-4 h-4 text-accent-gold" />
                <span className="text-sm font-semibold text-accent-gold">{c.finalCta.badge}</span>
              </div>
              <p className="text-xl text-white/60 mb-12 max-w-xl mx-auto">{c.finalCta.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-accent-gold text-royalty-blue px-10 py-5 rounded-full font-bold text-xl hover:brightness-105 transition-all">
                  {c.finalCta.ctaPrimary}
                </button>
                <a href={c.business.phoneHref} className="w-full sm:w-auto text-white font-bold text-xl flex items-center justify-center gap-2 hover:opacity-70 transition-opacity">
                  <Phone className="w-5 h-5" /> Call {c.business.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer c={c} />
    </div>
  );
}
