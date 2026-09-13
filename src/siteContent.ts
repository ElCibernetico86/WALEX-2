/**
 * Every word and image on the site, in one place.
 *
 * This is the file the admin page edits. The page components read from it and
 * contain no copy of their own, so changing text or swapping a photo never
 * means touching a React component.
 *
 * What is here:  text, image URLs, phone, service areas.
 * What is NOT:   layout, colours, fonts, icons, animation. Those stay in code —
 *                Alex is not editing them, and exposing them just creates ways
 *                to break the page.
 *
 * Image fields accept either a local path ("/wall.jpg", served from public/) or
 * a full URL. That matters because uploads will land on remote storage, and the
 * same field has to hold both without a migration.
 *
 * This object is the DEFAULT — it ships compiled into the build. Saved edits are
 * fetched at runtime and merged over the top, so if the backend is slow or down
 * the site still renders exactly this. No blank flash, no hard dependency.
 */

export type ServiceItem = {
  title: string;
  description: string;
  /** Local path or full URL. */
  image: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  text: string;
};

export type Shield = {
  n: string;
  title: string;
  body: string;
};

export type Fact = {
  title: string;
  body: string;
};

export type SiteContent = typeof defaultContent;

export const defaultContent = {
  business: {
    /** Display name in the brand lockup — rendered letter by letter. */
    name: "WALEX",
    /** Second line of the lockup. */
    tagline: "PRO FINISHES",
    /** Full legal entity, used in the footer and copyright. */
    legalName: "Walex Pro Finishes LLC",
    phoneDisplay: "(972) 904-5132",
    /** Must stay in tel: format — this is what a phone actually dials. */
    phoneHref: "tel:+19729045132",
    location: "North Dallas, TX",
    serviceAreas: ["North Dallas", "Plano", "Frisco", "McKinney", "Prosper"],
  },

  nav: {
    links: ["Services", "Process", "Gallery", "Credentials"],
    cta: "Get a Quote",
  },

  hero: {
    /** Full-bleed background photo behind the headline. */
    backgroundImage:
      "https://images.unsplash.com/photo-1589939705384-5185138a047a?auto=format&fit=crop&q=80&w=2000",
    backgroundAlt: "Wall and paint finish work",
    badge: "Tape, bed, texture & paint · North Dallas",
    /** The headline renders on two lines; the second is the gradient one. */
    headlineTop: "From bare drywall",
    headlineBottom: "to the final coat.",
    body:
      "We move the furniture. We handle 100% of the cleanup. You just pick the color — from tape, bed and texture through to the last coat of paint, across North Texas.",
    chip: "Redo-until-you're-thrilled guarantee",
    ctaPrimary: "Get a Free Estimate",
    ctaSecondary: "View Our Work",
  },

  services: {
    headingTop: "What we",
    headingBottom: "actually do.",
    intro:
      "Bare drywall to the final coat, by one crew. No subbing the prep out to whoever is cheapest that week.",
    linkLabel: "Learn more",
    items: [
      {
        title: "Tape, Bed & Texture",
        description: "Drywall taped, bedded and textured to match the walls you already have.",
        image: "/texture.jpg",
      },
      {
        title: "Full Painting Finish",
        description: "Walls, ceilings, trim and doors — cut in by hand, not taped and hoped.",
        image:
          "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Cabinet Refinishing",
        description:
          "Cabinet doors and boxes sanded, primed and sprayed for an even, brush-free finish.",
        image: "/cabinets.jpg",
      },
      {
        title: "Exterior Painting",
        description:
          "Siding, trim, fascia and doors — prepped, primed and coated to survive a Texas summer.",
        image: "/exterior.jpg",
      },
    ] as ServiceItem[],
  },

  offer: {
    badge: "One crew, one price",
    heading: "Why we're not the cheapest bid",
    paragraphs: [
      "The lowest quote usually means thin prep — which is exactly why that paint peels in two years. We prep every wall like it's our own home, so it lasts. You pay once, not twice.",
      "Full prep, name-brand paint, clean lines — interior, exterior, or both. Same crew from the first patch to the last coat, so there's nobody to point a finger at but us.",
    ],
    cta: "Get My Free Estimate",
    ctaNote: "Takes 60 seconds · No obligation",
  },

  process: {
    heading: "The WALEX Standard",
    intro: "A refined process designed for minimal disruption and maximum quality.",
    steps: [
      {
        number: "01",
        title: "Consultation",
        text: "We discuss your vision, assessing both wall condition and color goals.",
      },
      {
        number: "02",
        title: "Wall Prep",
        text: "Expert tape, bed, and texture application to create the perfect canvas.",
      },
      {
        number: "03",
        title: "Painting",
        text: "We cut in by hand and keep a wet edge, so you don't get lap marks down the wall.",
      },
      {
        number: "04",
        title: "Inspection",
        text: "We walk every room with you and fix whatever you point at before we load up.",
      },
    ] as ProcessStep[],
  },

  gallery: {
    heading: "Recent Work",
    intro: "Jobs finished across North Texas.",
    cta: "View Portfolio",
    images: [
      "/brick.jpg",
      "/garage.jpg",
      "/wall.jpg",
      "/drywall.jpg",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=800",
    ],
  },

  guarantee: {
    badge: "Our Promise",
    heading: "The WALEX Triple-Shield Guarantee",
    intro: "We take all the risk, so you don't have to. Three promises, in writing, on every job.",
    shields: [
      {
        n: "1",
        title: "The No-Peel Promise",
        body:
          "If our paint peels or cracks because of how we prepped or applied it, we come back and fix it. Free.",
      },
      {
        n: "2",
        title: "The Zero-Mess Promise",
        body:
          "We move the furniture, mask everything, and leave your home cleaner than we found it — or the cleanup is on us.",
      },
      {
        n: "3",
        title: "Redo Until You're Thrilled",
        body:
          "If you're not thrilled with the result, we'll redo whatever it takes until you are. No fighting, no fine print.",
      },
    ] as Shield[],
  },

  credentials: {
    heading: "Why homeowners and GCs call us",
    intro: "No inflated promises — here's what we actually bring to your job.",
    facts: [
      {
        title: "Two decades on the tools",
        body:
          "I have been finishing walls in North Texas since 2006. The company is new — the hands are not.",
      },
      {
        title: "We show up and clean up",
        body:
          "We move the furniture, mask what needs masking, and leave the place cleaner than we found it.",
      },
      {
        title: "One crew, whole job",
        body:
          "Tape, bed, texture and paint from the same hands. No handoffs, no finger-pointing between trades.",
      },
    ] as Fact[],
  },

  finalCta: {
    headingTop: "Your neighbors already",
    headingBottom: "booked. Your turn.",
    badge:
      "We take a limited number of jobs each month to protect quality — call to check this month's availability",
    body:
      "Free estimate, honest pricing, and a finish you'll be proud to show off — backed by the Triple-Shield Guarantee.",
    ctaPrimary: "Get My Free Estimate",
  },

  footer: {
    blurb: "Walex Pro Finishes LLC — tape, bed, texture and paint for North Dallas homes.",
    serviceAreasHeading: "Service Areas",
    contactHeading: "Contact Us",
    copyright: "© 2026 Walex Pro Finishes LLC. All rights reserved.",
    legalLinks: ["Privacy Policy", "Terms of Service"],
  },
};
