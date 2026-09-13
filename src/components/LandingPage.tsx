import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronRight, Paintbrush, Home, ShieldCheck, Star, Phone, Mail, MapPin, Menu, X, CheckCircle2, Check, Gift, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
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
              {"WALEX".split("").map((char, i) => (
                <span key={i} className="inline-block">{char}</span>
              ))}
            </motion.div>
            <motion.div
              className="flex justify-between w-full font-display text-[6px] font-black uppercase mt-[1px]"
              style={{ color: subTextColor }}
            >
              {"PRO FINISHES".split("").map((char, i) => (
                <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Services", "Process", "Gallery", "Credentials"].map((item) => (
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
            Get a Quote
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
          {["Services", "Process", "Gallery", "Credentials"].map((item) => (
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
            Get a Quote
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

const Hero = () => {
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
          src="https://images.unsplash.com/photo-1589939705384-5185138a047a?auto=format&fit=crop&q=80&w=2000"
          alt="Professional Wall & Paint Finish"
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
            <span className="text-sm font-medium text-white/90">Tape, bed, texture &amp; paint · North Dallas</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight text-balance">
            Superior Wall & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Paint Finishes.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            We move the furniture. We handle 100% of the cleanup. You just pick the color —
            from tape, bed, and texture to flawless full-home painting across North Texas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-accent-gold/15 border border-accent-gold/30 text-accent-gold">
              <CheckCircle2 className="w-4 h-4" /> Most projects done in 48 hours
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/90">
              <CheckCircle2 className="w-4 h-4" /> Redo-until-you're-thrilled guarantee
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-accent-gold text-royalty-blue px-8 py-4 rounded-full font-bold text-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 group">
              Get a Free Estimate <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              View Our Work
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Tape, Bed & Texture",
      description: "Drywall taped, bedded and textured to match the walls you already have.",
      icon: <Home className="w-6 h-6" />,
      image: `${import.meta.env.BASE_URL}texture.jpg`,
      span: "md:col-span-2"
    },
    {
      title: "Full Painting Finish",
      description: "Walls, ceilings, trim and doors — cut in by hand, not taped and hoped.",
      icon: <Paintbrush className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=800",
      span: "md:col-span-1"
    },
    {
      title: "Cabinet Refinishing",
      description: "Cabinet doors and boxes sanded, primed and sprayed for an even, brush-free finish.",
      icon: <ShieldCheck className="w-6 h-6" />,
      image: `${import.meta.env.BASE_URL}cabinets.PNG`,
      span: "md:col-span-1"
    },
    {
      title: "Exterior Painting",
      description: "Siding, trim, fascia and doors — prepped, primed and coated to survive a Texas summer.",
      icon: <Star className="w-6 h-6" />,
      image: `${import.meta.env.BASE_URL}exterior.PNG`,
      span: "md:col-span-2"
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">What we <br /><span className="text-royalty-blue">actually do.</span></h2>
          <p className="text-xl text-slate-500 max-w-2xl">Bare drywall to the final coat, by one crew. No subbing the prep out to whoever is cheapest that week.</p>
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
                    Learn more <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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

const Process = () => {
  const steps = [
    { number: "01", title: "Consultation", text: "We discuss your vision, assessing both wall condition and color goals." },
    { number: "02", title: "Wall Prep", text: "Expert tape, bed, and texture application to create the perfect canvas." },
    { number: "03", title: "Painting", text: "We cut in by hand and keep a wet edge, so you don't get lap marks down the wall." },
    { number: "04", title: "Inspection", text: "We walk every room with you and fix whatever you point at before we load up." }
  ];

  return (
    <section id="process" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">The WALEX Standard</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">A refined process designed for minimal disruption and maximum quality.</p>
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

const Gallery = () => {
  const images = [
    `${import.meta.env.BASE_URL}brick.jpg`,
    `${import.meta.env.BASE_URL}garage.jpg`,
    `${import.meta.env.BASE_URL}wall.jpg`,
    `${import.meta.env.BASE_URL}drywall.jpg`,
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <section id="gallery" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Recent Work</h2>
          <p className="text-xl text-slate-500">Jobs finished across North Texas.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-royalty-blue font-bold">
          View Portfolio <ChevronRight className="w-5 h-5" />
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
const Credentials = () => {
  const facts = [
    { title: "Two decades on the tools", body: "I have been finishing walls in North Texas since 2006. The company is new — the hands are not." },
    { title: "We show up and clean up", body: "We move the furniture, mask what needs masking, and leave the place cleaner than we found it." },
    { title: "One crew, whole job", body: "Tape, bed, texture and paint from the same hands. No handoffs, no finger-pointing between trades." }
  ];

  return (
    <section id="credentials" className="py-24 bg-royalty-blue text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Why homeowners and GCs call us</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">No inflated promises — here's what we actually bring to your job.</p>
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

const Footer = () => {
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
                  {"WALEX".split("").map((char, i) => (
                    <span key={i} className="inline-block">{char}</span>
                  ))}
                </div>
                <div className="flex justify-between w-full font-display text-[8px] font-black uppercase text-white/40 mt-[2px]">
                  {"PRO FINISHES".split("").map((char, i) => (
                    <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/50 max-w-sm mb-8 leading-relaxed">
              Walex Pro Finishes LLC — tape, bed, texture and paint for North Dallas homes.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Service Areas</h4>
            <ul className="space-y-4 text-white/50">
              <li>North Dallas</li>
              <li>Plano</li>
              <li>Frisco</li>
              <li>McKinney</li>
              <li>Prosper</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-white/50">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> (972) 904-5132</li>
                            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> North Dallas, TX</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:row justify-between items-center gap-4 text-white/30 text-sm">
          <p>© 2026 Walex Pro Finishes LLC. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Offer = () => {
  const stack = [
    { title: "Full-home painting done right", desc: "Full prep, name-brand paint, clean lines — interior, exterior, or both.", value: "Core" },
    { title: "Free professional color consultation", desc: "3 curated palettes matched to your home's lighting and style.", value: "$150 value", bonus: true },
    { title: "Free minor drywall & crack repair", desc: "We tape, bed, and texture-match before we paint — most painters skip this. We don't.", value: "$200 value", bonus: true },
    { title: "Free labeled touch-up kit", desc: "Leftover paint, labeled by room, so future touch-ups take five minutes.", value: "$75 value", bonus: true },
    { title: "Priority 48-hour scheduling", desc: "Most projects started and finished fast — we work around your life.", value: "Included", bonus: true },
  ];

  return (
    <section id="offer" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent-gold/15 border border-accent-gold/30">
            <Gift className="w-4 h-4 text-accent-gold" />
            <span className="text-sm font-semibold text-royalty-blue">Everything you get</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5 text-balance">The North Dallas Flawless-Home Package</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            One crew, one price, zero hassle. Everything included when WALEX finishes your home — plus the extras most painters charge for or skip entirely.
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-12">
          {stack.map((item, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-4 py-5 ${idx < stack.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full mt-0.5 ${item.bonus ? "bg-accent-gold text-royalty-blue" : "bg-royalty-blue text-white"}`}>
                <Check className="w-4 h-4" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                  <span className="font-bold text-slate-900">
                    {item.bonus && <span className="text-yellow-700">BONUS: </span>}{item.title}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.bonus ? "bg-accent-gold/15 text-yellow-700" : "bg-slate-100 text-slate-400"}`}>{item.value}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}

          <div className="text-center mt-8">
            <p className="text-slate-500 mb-4">Over <strong className="text-slate-900">$425 in bonuses</strong> included free with every project.</p>
            <button className="bg-accent-gold text-royalty-blue px-8 py-4 rounded-full font-bold text-lg hover:brightness-105 transition-all inline-flex items-center gap-2">
              Get My Free Estimate <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-slate-400 text-sm mt-3">Takes 60 seconds · No obligation</p>
          </div>
        </div>

        <p className="text-center text-slate-500 max-w-2xl mx-auto mt-12 leading-relaxed">
          <strong className="text-slate-900">Why we're not the cheapest bid:</strong> the lowest quote usually means thin prep —
          which is exactly why that paint peels in two years. We prep every wall like it's our own home, so it lasts. You pay once, not twice.
        </p>
      </div>
    </section>
  );
};

const Guarantee = () => {
  const shields = [
    { n: "1", title: "The No-Peel Promise", body: "If our paint peels or cracks because of how we prepped or applied it, we come back and fix it. Free." },
    { n: "2", title: "The Zero-Mess Promise", body: "We move the furniture, mask everything, and leave your home cleaner than we found it — or the cleanup is on us." },
    { n: "3", title: "Redo Until You're Thrilled", body: "If you're not thrilled with the result, we'll redo whatever it takes until you are. No fighting, no fine print." },
  ];

  return (
    <section id="guarantee" className="py-24 bg-royalty-blue text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent-gold/15 border border-accent-gold/30">
          <ShieldCheck className="w-4 h-4 text-accent-gold" />
          <span className="text-sm font-semibold text-accent-gold">Our Promise</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-5 text-balance">The WALEX Triple-Shield Guarantee</h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-14">We take all the risk, so you don't have to. Three promises, in writing, on every job.</p>

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
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Offer />
      <Process />
      <Gallery />
      <Guarantee />
      <Credentials />
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-royalty-blue/40 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Your neighbors already <br />booked. Your turn.</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-accent-gold/15 border border-accent-gold/30">
                <CalendarClock className="w-4 h-4 text-accent-gold" />
                <span className="text-sm font-semibold text-accent-gold">We take a limited number of jobs each month to protect quality — call to check this month's availability</span>
              </div>
              <p className="text-xl text-white/60 mb-12 max-w-xl mx-auto">Free estimate, honest pricing, and a finish you'll be proud to show off — backed by the Triple-Shield Guarantee.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-accent-gold text-royalty-blue px-10 py-5 rounded-full font-bold text-xl hover:brightness-105 transition-all">
                  Get My Free Estimate
                </button>
                <button className="w-full sm:w-auto text-white font-bold text-xl flex items-center gap-2 hover:opacity-70 transition-opacity">
                  Call (972) 904-5132
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
