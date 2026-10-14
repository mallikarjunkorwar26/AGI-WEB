import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  Phone,
  X,
  FileText,
  PackageCheck,
  Headset,
  MessageCircle,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import {
  AboutPage,
  AssistPage,
  BusinessPage,
  CareersPage,
  ContactPage,
  HomePage,
  NotFoundPage,
  OpportunitiesPage,
  ResourcesPage,
  ServicesPage,
  TrackingPage,
} from '@/pages/site-pages';

const EMAIL = 'connect@atlantglobalindia.com';
const PHONE = '+917411708958';

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Courier & Cargo Services in Bengaluru | Atlant Global India',
    description:
      'Atlant Global India serves Bengaluru South and East with courier, cargo and warehousing services. Established in 1990, operating under The Professional Couriers.',
  },
  '/services': {
    title: 'Courier, Cargo & Warehousing Services | Atlant Global India',
    description:
      'Explore Domestic, Pro Premium, Priority Class, International and Warehousing services from Atlant Global India, serving Bengaluru South and East.',
  },
  '/tracking': {
    title: 'Shipment Tracking | Atlant Global India',
    description:
      'Enter your AWB or CNOTE number on this page to review the latest shipment status without leaving the Atlant Global India website.',
  },
  '/assist': {
    title: 'AGI Assist | Atlant Global India',
    description: 'Meet AGI Assist. Chat support is coming soon; track a shipment or contact the Atlant Global India team in the meantime.',
  },
  '/opportunities': {
    title: 'Opportunities at Atlant Global India | Careers & Business',
    description:
      'Explore career opportunities and business partnership opportunities with Atlant Global India.',
  },
  '/business': {
    title: 'Business Partnership Opportunities | Atlant Global India',
    description:
      'Explore franchise and channel partner opportunities with Atlant Global India and build your courier and logistics business.',
  },
  '/about': {
    title: 'About Atlant Global India | Courier & Cargo since 1990',
    description:
      'Learn about Atlant Global India, established July 2, 1990 by Mr. Suresh Surendranath, serving Bengaluru South and East under The Professional Couriers.',
  },
  '/resources': {
    title: 'Shipping FAQs & Resources in Bengaluru | Atlant Global India',
    description:
      'Find practical service information, verified FAQs and a volumetric weight estimator from Atlant Global India. Confirm shipment terms with the team.',
  },
  '/careers': {
    title: 'Careers & Franchise Enquiries | Atlant Global India',
    description:
      'Contact Atlant Global India about career or franchise opportunities. No unverified vacancies, franchise terms or openings are listed on this page.',
  },
  '/contact': {
    title: 'Contact & Offices in Bengaluru | Atlant Global India',
    description:
      'Contact Atlant Global India in Bengaluru. View verified corporate and operations office addresses, phone, email, hours and directions.',
  },
};

function RouteMeta() {
  const [location] = useLocation();
  useEffect(() => {
    const pathname = location.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    const meta = pageMeta[pathname] ?? {
      title: 'Page not found | Atlant Global India',
      description: 'The requested Atlant Global India page could not be found.',
    };
    document.title = meta.title;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = meta.description;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = meta.title;
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = meta.description;
    const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = meta.title;
    const twitterDescription = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.content = meta.description;
  }, [location]);
  return null;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [location] = useLocation();

  useEffect(() => {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setProgress(Math.min(Math.max(nextProgress, 0), 100));

      const header = document.querySelector<HTMLElement>('.header');
      if (header) {
        header.classList.toggle('header-scrolled', window.scrollY > 20);
      }
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  if (location === '/tracking') return null;

  return (
    <div className="page-progress" aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}

function ScrollReveal() {
  const [location] = useLocation();

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const targets = document.querySelectorAll<HTMLElement>(
      '.section, .quick-card, .service-card, .trust-item, .contact-card, .quote-form, .tracking-panel, .tracking-status-card, .detail-card, .track-side-info, .job-card, .career-form-card, .hero-content, .intro-photo-wrap, .intro-copy, .business-image-wrap, .network-visual, .leadership, .resource-card, .page-heading, .tracking-result',
    );

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -20px 0px' },
    );

    targets.forEach((target) => {
      const isHeader = target.classList.contains('hero-content') || target.classList.contains('page-heading');
      target.classList.add('reveal-on-scroll');
      if (isHeader) {
        target.style.transitionDelay = '80ms';
      }
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [location]);

  return null;
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => setMenuOpen(false), [location]);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="topbar">
        <span>Serving Bengaluru South &amp; East</span>
        <div className="topbar-right">
          <a href={`tel:${PHONE}`} data-testid="link-top-phone">+91 7411 708 958</a>
          <span>Mon–Sat · 10am–6pm</span>
        </div>
      </div>
      <header className="header">
        <nav className="nav" aria-label="Main navigation">
          <Link className="brand" href="/" onClick={closeMenu} aria-label="Atlant Global India home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}images/AGI%20PNG%20Black.png`} alt="Atlant Global India logo" />
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <Link href="/" onClick={closeMenu}>Home</Link>
            <Link href="/services" onClick={closeMenu}>Services</Link>
            <Link href="/tracking" onClick={closeMenu}>Tracking</Link>
            <Link href="/opportunities" onClick={closeMenu}>Opportunities</Link>
            <Link href="/business" onClick={closeMenu}>Business</Link>
            <Link href="/about" onClick={closeMenu}>About</Link>
            <Link href="/resources" onClick={closeMenu}>Resources</Link>
            <Link href="/careers" onClick={closeMenu}>Careers</Link>
            <Link href="/contact" onClick={closeMenu}>Contact</Link>
          </div>
          <div className="nav-cta">
            <Link className="btn btn-outline" href="/contact">Contact</Link>
            <Link className="btn btn-primary" href="/opportunities">Explore opportunities <ArrowRight size={14} /></Link>
          </div>
        </nav>
      </header>
    </>
  );
}

function SiteFooter() {
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" aria-label="Atlant Global India home" className="footer-brand-link">
                <img className="footer-brand-logo" src={`${import.meta.env.BASE_URL}images/AGI%20PNG%20White.png`} alt="Atlant Global India logo" />
              </Link>
              <p>Courier, cargo and warehousing services in Bengaluru South and East, with access to a wider network.</p>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <Link href="/services">Domestic</Link><Link href="/services">Pro Premium</Link>
              <Link href="/services">Priority Class</Link><Link href="/services">International</Link><Link href="/services">Warehousing</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link><Link href="/about">Leadership</Link>
              <Link href="/about">Infrastructure</Link><Link href="/opportunities">Opportunities</Link>
              <Link href="/careers">Careers</Link><Link href="/business">Business opportunities</Link>
            </div>
            <div className="footer-col">
              <h4>Help &amp; contact</h4>
              <Link href="/tracking">Tracking</Link><Link href="/resources">FAQs &amp; resources</Link>
              <Link href="/contact">Branch locator</Link><Link href="/business">Get a quote</Link>
              <div className="footer-map-card">
                <span className="footer-map-badge">Find us</span>
                <a href="https://maps.app.goo.gl/PrDEJi5HG4fnZYEo6" target="_blank" rel="noreferrer">Open in Google Maps</a>
              </div>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Atlant Global India (Inc). Company information presented for public reference.</span>
            <div className="footer-bottom-links">
              <a href="https://www.atlantglobalindia.in/" target="_blank" rel="noreferrer">Official website <ArrowUpRight size={11} /></a>
              <Link href="/">Home</Link>
            </div>
          </div>
        </div>
      </footer>
      <div className="mobile-actions" aria-label="Quick contact actions">
        <Link href="/tracking"><PackageCheck size={17} />Track</Link>
        <Link href="/business"><FileText size={17} />Quote</Link>
        <a href={`https://wa.me/${PHONE.replace('+', '')}`} target="_blank" rel="noreferrer"><Headset size={17} />WhatsApp</a>
        <a href={`tel:${PHONE}`}><Phone size={17} />Call</a>
      </div>
    </>
  );
}

function SiteRoutes() {
  const [location] = useLocation();
  useEffect(() => {
    if (!location.includes('#')) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return (
    <>
      <RouteMeta />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/tracking" component={TrackingPage} />
          <Route path="/assist" component={AssistPage} />
          <Route path="/opportunities" component={OpportunitiesPage} />
          <Route path="/business" component={BusinessPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/careers" component={CareersPage} />
          <Route path="/contact" component={ContactPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
    </>
  );
}

function RouterApp() {
  const [location] = useLocation();

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="site-wrap">
        <ScrollProgress />
        <ScrollReveal />
        <SiteHeader />
        <ErrorBoundary resetKey={location}>
          <SiteRoutes />
        </ErrorBoundary>
        <SiteFooter />
      </div>
      <Link className="agi-assist-launcher" href="/assist" aria-label="Open AGI Assist chat page">
        <MessageCircle size={20} aria-hidden="true" />
        <span>AGI Assist</span>
      </Link>
    </WouterRouter>
  );
}

function App() {
  return <RouterApp />;
}

export default App;
