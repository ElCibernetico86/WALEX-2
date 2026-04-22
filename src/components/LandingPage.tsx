import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ChevronRight, Paintbrush, Home, ShieldCheck, Star, Phone, Mail, MapPin, Menu, X } from "lucide-react";
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
            aria-label="WALLEX Logo"
            role="img"
          />
          <div className="flex flex-col w-[110px] leading-none">
            <motion.div
              className="flex justify-between w-full font-display font-bold text-xl"
              style={{ color: primaryColor }}
            >
              {"WALLEX".split("").map((char, i) => (
                <span key={i} className="inline-block">{char}</span>
              ))}
            </motion.div>
            <motion.div
              className="flex justify-between w-full font-display text-[6px] font-black uppercase mt-[1px]"
              style={{ color: subTextColor }}
            >
              {"THE WALL EXPERTS".split("").map((char, i) => (
                <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Services", "Process", "Gallery", "Testimonials"].map((item) => (
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
          {["Services", "Process", "Gallery", "Testimonials"].map((item) => (
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
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight text-balance">
            Superior Wall & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Paint Finishes.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            From tape, bed, and texture to full painting finishes. Delivering superb quality and detail to North Texas homes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-white text-royalty-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
              Start Your Project <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              View Our Work
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Tape, Bed & Texture",
      description: "Expert drywall finishing including seamless tape and bed, and custom textures.",
      icon: <Home className="w-6 h-6" />,
      image: `${import.meta.env.BASE_URL}texture.jpg`,
      span: "md:col-span-2"
    },
    {
      title: "Full Painting Finish",
      description: "Superb quality interior and exterior painting with an eye for every detail.",
      icon: <Paintbrush className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=800",
      span: "md:col-span-1"
    },
    {
      title: "Cabinet Refinishing",
      description: "Factory-new finishes for your kitchen and bathroom cabinetry.",
      icon: <ShieldCheck className="w-6 h-6" />,
      image: image: `${import.meta.env.BASE_URL}cabinets.PNG`,
    ,
    span: "md:col-span-1"
    },
  {
    title: "Exterior Excellence",
    description: "Durable, weather-resistant coatings to protect and beautify your home.",
    icon: <Star className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        span: "md:col-span-2"
    }
  ];

return (
  <section id="services" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Superior Wall & <br /><span className="text-royalty-blue">Paint Finishes.</span></h2>
        <p className="text-xl text-slate-500 max-w-2xl">We provide a comprehensive transformation experience, from initial drywall prep to the final coat of paint.</p>
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
    { number: "03", title: "Painting", text: "Our team applies premium finishes with superb quality and detail." },
    { number: "04", title: "Inspection", text: "A final walkthrough to ensure every wall meets the WALLEX standard." }
  ];

  return (
    <section id="process" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">The WALLEX Standard</h2>
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
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600607687940-c52af0369996?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <section id="gallery" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Recent Transformations</h2>
          <p className="text-xl text-slate-500">Witness the difference of professional artistry.</p>
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

const Testimonials = () => {
  const reviews = [
    { name: "Sarah Jenkins", location: "Frisco, TX", text: "The attention to detail was beyond anything I've seen. They treated my home like a museum. Absolutely flawless finish." },
    { name: "Michael Chen", location: "Plano, TX", text: "Professional, punctual, and the royalty blue accent wall they did in my office is the talk of every Zoom call." },
    { name: "David Miller", location: "McKinney, TX", text: "WALEX transformed our kitchen cabinets. It saved us thousands compared to a full remodel and looks brand new." }
  ];

  return (
    <section id="testimonials" className="py-24 bg-royalty-blue text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-accent-gold text-accent-gold" />)}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by North Dallas</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">Our reputation is built on one perfect brushstroke at a time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-[32px]"
            >
              <p className="text-lg italic mb-8 text-white/90">"{review.text}"</p>
              <div>
                <div className="font-bold text-xl">{review.name}</div>
                <div className="text-white/50 text-sm">{review.location}</div>
              </div>
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
                aria-label="WALLEX Logo"
                role="img"
              />
              <div className="flex flex-col w-[150px] leading-none">
                <div className="flex justify-between w-full font-display font-bold text-2xl">
                  {"WALLEX".split("").map((char, i) => (
                    <span key={i} className="inline-block">{char}</span>
                  ))}
                </div>
                <div className="flex justify-between w-full font-display text-[8px] font-black uppercase text-white/40 mt-[2px]">
                  {"THE WALL EXPERTS".split("").map((char, i) => (
                    <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-white/50 max-w-sm mb-8 leading-relaxed">
              The Wall Experts. Elevating residential spaces across North Dallas with premium painting services and uncompromising quality.
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
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@walexwalls.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> North Dallas, TX</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:row justify-between items-center gap-4 text-white/30 text-sm">
          <p>© 2026 WALLEX. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <Gallery />
      <Testimonials />
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-royalty-blue/40 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to elevate <br />your home?</h2>
              <p className="text-xl text-white/60 mb-12 max-w-xl mx-auto">Schedule your complimentary consultation today and see why WALLEX is the premier choice for your home.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-white text-royalty-blue px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform">
                  Request a Quote
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
