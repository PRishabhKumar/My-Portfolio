export const profile = {
  name: "P Rishabh Kumar",
  email: "rishabh260405@gmail.com",
  github: "https://github.com/PRishabhKumar",
  linkedin: "https://www.linkedin.com/in/p-rishabh-kumar-9336b0289/",
  leetcode: "https://leetcode.com/u/P_RISHABH_KUMARl/",
  resume: "/Rishabh's resume.pdf",
};

export const projects = [
  {
    id: "careermitra",
    number: "01",
    name: "CareerMitra",
    tagline: "A stronger resume. A better next step.",
    description:
      "AI-powered resume optimization, from your first upload to a polished, ATS-ready PDF.",
    category: "AI-powered career platform",
    filters: ["ai", "fullstack"],
    date: "December 2025 — March 2026",
    tags: ["React", "Node.js", "AWS", "Gemini API"],
    stack: [
      "React",
      "Node.js",
      "Docker",
      "AWS S3",
      "AWS EC2",
      "CloudFront",
      "Nginx",
      "Gemini API",
      "Tesseract.js",
      "LaTeX",
    ],
    image: "/images/careermitra-preview.webp",
    alt: "Custom CareerMitra interface illustration showing a resume document, an ATS analysis score, and structured resume feedback on a sage-green background.",
    github: "https://github.com/PRishabhKumar/CareerMitra",
    live: "https://careermitra.dev",
    intro:
      "CareerMitra brings resume analysis and high-fidelity document generation into one full-stack workflow. It combines a deterministic ATS scoring engine with AI-powered semantic analysis to help turn an existing resume into a clearer, more relevant application.",
    highlights: [
      {
        title: "Built for the cloud",
        text: "A React frontend delivered through AWS S3 and CloudFront, paired with a Dockerized Node.js backend on EC2. Nginx handles the reverse proxy, with SSL through Certbot.",
      },
      {
        title: "Documents, without the compromise",
        text: "A TeX Live environment bundled inside Docker enables cloud-based LaTeX resume compilation and real-time, high-fidelity PDF generation.",
      },
      {
        title: "More than keyword matching",
        text: "Deterministic ATS scoring works alongside Gemini semantic analysis. Tesseract.js extracts text from image-based resumes and scanned documents.",
      },
    ],
  },
  {
    id: "prsonality",
    number: "02",
    name: "PRsonality",
    tagline: "Your code. Three fresh perspectives.",
    description:
      "An AI code reviewer with a personality. Actually, three of them.",
    category: "Multi-persona AI code reviewer",
    filters: ["ai"],
    date: "January 2026",
    tags: ["React", "Vite", "Gemini API"],
    stack: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Gemini API"],
    image: "/images/prsonality-preview.webp",
    alt: "Custom PRsonality interface illustration with a code editor, repository review, and three AI reviewer personas in a charcoal and lime palette.",
    github: "https://github.com/PRishabhKumar/PRsonality",
    live: "https://prsonality.vercel.app/",
    intro:
      "Code reviews are more useful when the reviewer understands the context. PRsonality is an AI-powered codebase auditor that looks at a repository’s structure, configurations, and core files, then reviews the code through one of three distinct engineering perspectives.",
    highlights: [
      {
        title: "Context before commentary",
        text: "A “Mental Cloning” architecture selectively ingests repository structure, configs, and core files to produce contextual reviews with precise error tracing.",
      },
      {
        title: "Pick your perspective",
        text: "Custom prompt engineering powers three reviewers: a Kind Senior Engineer, a Brutally Honest Reviewer, and a Startup CTO—each suited to different stages of development.",
      },
      {
        title: "Interaction is part of the product",
        text: "A custom cursor physics engine uses spring-based momentum, velocity-driven deformation, and adaptive morphing to make the interface feel responsive and expressive.",
      },
    ],
  },
  {
    id: "nexmeet",
    number: "03",
    name: "NexMeet",
    tagline: "Less distance. More connection.",
    description:
      "Real-time video calls, live chat, and screen sharing. All in one room.",
    category: "Real-time communication platform",
    filters: ["fullstack", "realtime"],
    date: "July — October 2025",
    tags: ["WebRTC", "Socket.io", "MongoDB"],
    stack: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Socket.io",
      "WebRTC",
      "JWT",
    ],
    image: "/images/nexmeet-preview.webp",
    alt: "Custom NexMeet video conferencing illustration with four naturally proportioned fictional participants, an active-speaker indicator, a live room-chat sidebar, and video, microphone, and screen-sharing controls.",
    github: "https://github.com/PRishabhKumar/NexMeet",
    live: "https://nexmeet-calling-platform-dmng.onrender.com",
    intro:
      "NexMeet is a room-based video calling platform built around direct peer-to-peer communication. It brings video, chat, and screen sharing together, with authenticated sessions and a backend that manages meetings and users.",
    highlights: [
      {
        title: "Direct, real-time connections",
        text: "WebRTC powers peer-to-peer video conferencing, with Socket.io coordinating real-time signaling and live chat.",
      },
      {
        title: "A room for every conversation",
        text: "Room-based routing supports multiple concurrent meetings, with screen sharing built into the calling experience.",
      },
      {
        title: "The system behind the call",
        text: "MongoDB manages meetings, users, and sessions with optimized queries. JWT authentication protects access to the platform.",
      },
    ],
  },
  {
    id: "wanderly",
    number: "04",
    name: "Wanderly",
    tagline: "Find a place. Make a memory.",
    description:
      "An end-to-end property booking experience, from discovery to checkout.",
    category: "Full-stack property booking platform",
    filters: ["fullstack"],
    date: "May — July 2025",
    tags: ["Express.js", "MongoDB", "Razorpay"],
    stack: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Passport.js",
      "Razorpay API",
      "Hoppscotch",
      "Render",
    ],
    image: "/images/wanderly-preview.webp",
    alt: "Custom Wanderly property booking interface illustration featuring a woodland cabin, destination search, and a property reservation card.",
    github: "https://github.com/PRishabhKumar/Wanderly",
    live: "https://wanderly-1-jcob.onrender.com/",
    intro:
      "Wanderly connects property discovery with a complete booking workflow. It brings listings, bookings, reviews, authentication, and payments into one end-to-end web application.",
    highlights: [
      {
        title: "A considered data model",
        text: "MongoDB schemas organize property listings, bookings, and reviews, with query optimization and aggregation pipelines for efficient data access.",
      },
      {
        title: "From browsing to booking",
        text: "RESTful APIs built with Express.js use structured middleware and error handling. Passport.js provides authentication, and Razorpay handles payment integration.",
      },
      {
        title: "Tested and deployed",
        text: "API workflows were tested using Hoppscotch, with the application deployed on Render.",
      },
    ],
  },
  {
    id: "jarvis",
    number: "05",
    name: "JARVIS",
    tagline: "Your desktop, a little more intelligent.",
    description:
      "A voice-powered AI assistant that turns natural language into desktop action.",
    category: "AI & desktop automation",
    filters: ["ai"],
    date: "December 2024 — May 2025",
    tags: ["Python", "OpenCV", "Gemini API"],
    stack: ["Python", "Gemini API", "Eel", "PyAutoGUI", "OpenCV", "Porcupine"],
    image: "/images/jarvis-preview.webp",
    alt: "Custom JARVIS desktop assistant illustration with a lime wireframe voice orb, a wake-word indicator, a desktop command, and face-authentication status.",
    github: "https://github.com/PRishabhKumar/JARVIS-AI-Assistant",
    live: null,
    intro:
      "JARVIS is an intelligent desktop automation system that makes everyday computer tasks conversational. It combines natural-language understanding, voice activation, and computer vision in a modular Python application.",
    highlights: [
      {
        title: "Speak, then get things done",
        text: "Gemini-powered conversational AI interprets natural language, while PyAutoGUI and a command-execution layer automate desktop actions.",
      },
      {
        title: "A more personal assistant",
        text: "OpenCV-based face authentication adds visual identity checks. Porcupine hotword detection enables voice activation.",
      },
      {
        title: "Built to do more than one thing",
        text: "Python multiprocessing supports concurrent tasks, with a modular architecture and an Eel-based interface connecting the pieces.",
      },
    ],
  },
];
