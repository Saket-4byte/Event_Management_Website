/**
 * EVENTORA - Data Layer
 * Mock event catalogues, categories, and LocalStorage persistence.
 */

// LocalStorage Storage Keys
export const STORAGE_KEYS = {
  EVENTS: 'eventora_events',
  REGISTRATIONS: 'eventora_registrations',
  FAVORITES: 'eventora_favorites',
  THEME: 'eventora_theme'
};

// Event Categories
export const EVENT_CATEGORIES = [
  { id: 'all', label: 'Show All', icon: 'sparkles' },
  { id: 'Technology', label: 'Technology', icon: 'cpu' },
  { id: 'Music', label: 'Music', icon: 'music' },
  { id: 'Sports', label: 'Sports', icon: 'activity' },
  { id: 'Workshops', label: 'Workshops', icon: 'book-open' },
  { id: 'Business', label: 'Business', icon: 'briefcase' },
  { id: 'Art & Culture', label: 'Art & Culture', icon: 'palette' }
];

// Initial Realistic Sample Events (12 events spanning 6 required categories)
export const INITIAL_EVENTS = [
  {
    id: 'evt-tech-01',
    title: 'Future AI & Autonomous Systems Summit 2026',
    category: 'Technology',
    date: '2026-11-20',
    startTime: '09:30 AM',
    venue: 'Metropolis Convention Center, Hall A',
    city: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Explore the next frontier of generative intelligence, robotics, and neuromorphic computing with industry pioneers.',
    fullDescription: 'Join 1,200+ leading AI researchers, robotics engineers, and enterprise leaders for a two-day immersive summit. Features keynotes on scalable agent architectures, hands-on frontier model demonstrations, and exclusive networking sessions.',
    organizer: 'Frontier Tech Alliance',
    price: 149,
    availableSeats: 45,
    featured: true
  },
  {
    id: 'evt-music-01',
    title: 'Neon Odyssey Electronic Music Festival',
    category: 'Music',
    date: '2026-11-28',
    startTime: '06:00 PM',
    venue: 'Solaris Waterfront Amphitheater',
    city: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'An 8-hour immersive audio-visual celebration featuring world-class synth-wave, house, and techno sets under the stars.',
    fullDescription: 'Neon Odyssey returns with three custom projection-mapped stages, laser choreography, and 12 headline international DJs. Experience high-fidelity spatial audio, curated food trucks, and unforgettable festival community vibes.',
    organizer: 'Solaris Audio Productions',
    price: 89,
    availableSeats: 160,
    featured: true
  },
  {
    id: 'evt-business-01',
    title: 'VentureScale Global Startup & Investor Summit',
    category: 'Business',
    date: '2026-12-04',
    startTime: '09:00 AM',
    venue: 'The Grand Horizon Financial Plaza',
    city: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Connect top-tier venture capitalists, growth founders, and angel syndicates shaping the next wave of unicorn companies.',
    fullDescription: 'VentureScale brings together over 800 founders and 250 institutional investors. Attend live pitch showcases, deep-dive panels on early-stage liquidity, cross-border expansion strategies, and curated 1-on-1 deal rooms.',
    organizer: 'VentureScale Capital Network',
    price: 199,
    availableSeats: 65,
    featured: true
  },
  {
    id: 'evt-art-01',
    title: 'Modern Digital Art & XR Gallery Night',
    category: 'Art & Culture',
    date: '2026-12-12',
    startTime: '07:00 PM',
    venue: 'Lumina Contemporary Art Space',
    city: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'An ethereal evening of interactive spatial art installations, generative code visuals, and spatial acoustic soundscapes.',
    fullDescription: 'Discover 30+ groundbreaking digital artists showcasing projection-mapped canvases, kinetic light sculptures, and virtual reality experiences. Meet the curators and enjoy complimentary champagne and artisan hors d\'oeuvres.',
    organizer: 'Lumina Digital Collective',
    price: 0,
    availableSeats: 28,
    featured: true
  },
  {
    id: 'evt-sports-01',
    title: 'Urban Sprint & Functional Athletics Challenge',
    category: 'Sports',
    date: '2026-12-19',
    startTime: '07:30 AM',
    venue: 'Olympic Park Track & Stadium',
    city: 'Denver, CO',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Push your physical limits across sprint obstacle relays, tactical endurance circuits, and strength divisions.',
    fullDescription: 'Open to recreational athletes and competitive fitness enthusiasts alike. Features timed sprint brackets, agility courses, certified judge scoring, athletic recovery lounges, and podium awards.',
    organizer: 'Apex Athletics Guild',
    price: 35,
    availableSeats: 90,
    featured: false
  },
  {
    id: 'evt-workshops-01',
    title: 'Hands-On UI/UX Design System Masterclass',
    category: 'Workshops',
    date: '2026-12-22',
    startTime: '01:00 PM',
    venue: 'DesignHub Collaborative Studio',
    city: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Architect enterprise design tokens, responsive component libraries, and accessible micro-interactions from scratch.',
    fullDescription: 'An intensive 4-hour workshop led by Principal Product Designers. Build scalable token foundations, establish accessibility benchmarks (WCAG AAA), and integrate atomic components with real code prototypes.',
    organizer: 'DesignHub Academy',
    price: 75,
    availableSeats: 12,
    featured: false
  },
  {
    id: 'evt-tech-02',
    title: 'CloudNative & Microservices Architecture Expo',
    category: 'Technology',
    date: '2027-01-14',
    startTime: '10:00 AM',
    venue: 'TechDome Innovation Center',
    city: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Master modern distributed systems, Kubernetes orchestration, zero-trust security, and cloud scalability.',
    fullDescription: 'Connect with enterprise cloud architects and infrastructure pioneers. Topics include serverless scaling, event-driven streaming, chaos engineering, and cost-effective multi-cloud deployment strategies.',
    organizer: 'Cloud Architects Association',
    price: 120,
    availableSeats: 50,
    featured: false
  },
  {
    id: 'evt-music-02',
    title: 'Symphonic Twilight & Chamber Ensemble',
    category: 'Music',
    date: '2027-01-22',
    startTime: '07:30 PM',
    venue: 'Starlight Symphony Hall',
    city: 'Boston, MA',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'An enchanting classical chamber performance blending timeless baroque compositions with modern cinematic scores.',
    fullDescription: 'Featuring the acclaimed Boston Twilight Orchestra performing pieces by Vivaldi, Max Richter, and Ennio Morricone in a breathtaking candlelit auditorium. Includes post-concert conductor Q&A.',
    organizer: 'New England Orchestral Arts',
    price: 55,
    availableSeats: 80,
    featured: false
  },
  {
    id: 'evt-business-02',
    title: 'FinTech Innovate & Global Commerce Forum',
    category: 'Business',
    date: '2027-01-30',
    startTime: '09:30 AM',
    venue: 'Pinnacle Tower Conference Suites',
    city: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Examining the future of decentralized payments, automated banking, and international regulatory frameworks.',
    fullDescription: 'A premier symposium for banking executives, fintech disruptors, and regulators. Gain actionable insight into real-time cross-border settlements, open banking APIs, and fraud prevention algorithms.',
    organizer: 'Global FinTech Institute',
    price: 165,
    availableSeats: 40,
    featured: false
  },
  {
    id: 'evt-art-02',
    title: 'Heritage Ceramic & Contemporary Sculpture Expo',
    category: 'Art & Culture',
    date: '2027-02-06',
    startTime: '11:00 AM',
    venue: 'Atelier Artisan Craft Center',
    city: 'Santa Fe, NM',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Celebrate world-class ceramic artistry, live wheel throwing demonstrations, and sculptural pottery galleries.',
    fullDescription: 'Showcasing over 40 master sculptors and ceramicists from around the world. Attendees can witness live wood-firing demonstrations, participate in raku pottery workshops, and acquire direct-from-artist pieces.',
    organizer: 'Southwest Craft Council',
    price: 25,
    availableSeats: 60,
    featured: false
  },
  {
    id: 'evt-sports-02',
    title: 'Pacific Coastline Half Marathon & 10K',
    category: 'Sports',
    date: '2027-02-14',
    startTime: '06:30 AM',
    venue: 'Oceanview Promenade',
    city: 'San Diego, CA',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Run alongside dramatic ocean bluffs on a certified scenic course with pacers, hydration stations, and medals.',
    fullDescription: 'The Pacific Coastline Half Marathon is celebrated as one of California\'s most picturesque races. Features chip timing, technical runner tees, coastal cheering squads, and an oceanfront post-race festival.',
    organizer: 'San Diego Runners Society',
    price: 60,
    availableSeats: 220,
    featured: true
  },
  {
    id: 'evt-workshops-02',
    title: 'Full-Stack Web Performance & Edge Computing',
    category: 'Workshops',
    date: '2027-02-20',
    startTime: '10:00 AM',
    venue: 'Silicon Beach Co-Working Loft',
    city: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Hands-on laboratory analyzing Core Web Vitals, serverless edge workers, and high-concurrency client caching.',
    fullDescription: 'Bring your laptop and learn how to optimize web applications for sub-second global latency. Deep-dive into cache strategies, Edge SSR, streaming protocols, and browser rendering optimizations with live benchmarks.',
    organizer: 'Edge Systems Guild',
    price: 95,
    availableSeats: 20,
    featured: false
  }
];

/**
 * Normalizes an event object so legacy and new properties coexist seamlessly.
 * @param {Object} event
 * @returns {Object}
 */
export function normalizeEvent(event) {
  return {
    ...event,
    venue: event.venue || event.location || 'Main Venue',
    location: event.venue || event.location || 'Main Venue',
    startTime: event.startTime || (event.time ? event.time.split('-')[0].trim() : '09:00 AM'),
    time: event.time || event.startTime || '09:00 AM',
    shortDescription: event.shortDescription || event.tagline || '',
    tagline: event.shortDescription || event.tagline || '',
    fullDescription: event.fullDescription || event.description || '',
    description: event.fullDescription || event.description || '',
    availableSeats: event.availableSeats ?? event.seatsRemaining ?? 50,
    seatsRemaining: event.availableSeats ?? event.seatsRemaining ?? 50,
    organizer: event.organizer || 'Eventora Community Partner'
  };
}

/**
 * Retrieves the events collection from LocalStorage, seeding if empty or outdated.
 * @returns {Array} List of normalized events
 */
export function getStoredEvents() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!rawData) {
      const normalizedInitial = INITIAL_EVENTS.map(normalizeEvent);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(normalizedInitial));
      return normalizedInitial;
    }
    const parsed = JSON.parse(rawData);
    // If stored array is smaller than the 10 required events or missing key fields, re-sync with INITIAL_EVENTS
    if (!Array.isArray(parsed) || parsed.length < 10 || !parsed[0].venue) {
      const normalizedInitial = INITIAL_EVENTS.map(normalizeEvent);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(normalizedInitial));
      return normalizedInitial;
    }
    return parsed.map(normalizeEvent);
  } catch (error) {
    console.error('Failed to read events from localStorage:', error);
    return INITIAL_EVENTS.map(normalizeEvent);
  }
}

/**
 * Saves events collection back to LocalStorage.
 * @param {Array} events
 */
export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to persist events to localStorage:', error);
  }
}
