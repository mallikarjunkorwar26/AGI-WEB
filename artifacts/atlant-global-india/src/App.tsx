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
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import {
  AboutPage,
  BusinessPage,
  CareersPage,
  ContactPage,
  HomePage,
  NotFoundPage,
  OpportunitiesPage,
  QuotePage,
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
  '/quote': {
    title: 'Request a Shipping Quote | Atlant Global India',
    description:
      'Request a customized quote for courier, cargo or warehousing services from Atlant Global India in Bengaluru.',
  },
  '/tracking': {
    title: 'Shipment Tracking | Atlant Global India',
    description:
      'Enter your AWB or CNOTE number on this page to review the latest shipment status without leaving the Atlant Global India website.',
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
    title: 'Careers & Opportunities | Atlant Global India',
    description:
      'Explore career opportunities and open positions at Atlant Global India.',
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
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const mobileViewport = window.matchMedia(
      '(max-width: 767px), (max-height: 500px) and (pointer: coarse)',
    );
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopTargetSelector =
      '.section, .quick-card, .service-card, .trust-item, .contact-card, .quote-form, .tracking-panel, .tracking-status-card, .detail-card, .track-side-info, .job-card, .career-form-card, .hero-content, .intro-photo-wrap, .intro-copy, .business-image-wrap, .network-visual, .leadership, .resource-card, .page-heading, .tracking-result';
    const mobileTargetSelector = [
      '.section',
      '.quick-card',
      '.service-card',
      '.trust-item',
      '.contact-card',
      '.quote-form',
      '.tracking-panel',
      '.tracking-status-panel',
      '.tracking-status-card',
      '.tracking-status-topline',
      '.detail-card',
      '.track-side-info',
      '.job-card',
      '.career-form-card',
      '.hero-content',
      '.intro-photo-wrap',
      '.intro-copy',
      '.business-image-wrap',
      '.network-visual',
      '.leadership',
      '.resource-card',
      '.page-heading',
      '.tracking-result',
      '.hero-photo',
      '.hero-content .eyebrow',
      '.hero-actions',
      '.hero-note',
      '.hero-tracking-wrap',
      '.tracking-timeline > li',
      '.service-visual',
      '.home-facts > div',
      '.about-value',
      '.partner-feature-card',
      '.process-step',
      '.footer',
      'main h1',
      'main h2',
      'main h3',
      'main p',
      'main .section-label',
      'main .btn',
      '.footer-brand',
      '.footer-col',
      '.footer-bottom',
    ].join(', ');
    const visualSelector = '.intro-photo-wrap, .business-image-wrap, .network-visual, .service-visual';
    let observer: IntersectionObserver | undefined;
    let contentObserver: MutationObserver | undefined;
    let revealTargets: HTMLElement[] = [];
    let activeMobileMode: boolean | undefined;
    let activeReducedMotion: boolean | undefined;

    const clearReveals = () => {
      observer?.disconnect();
      observer = undefined;
      contentObserver?.disconnect();
      contentObserver = undefined;
      revealTargets.forEach((target) => {
        target.classList.remove('reveal-on-scroll', 'reveal-from-left', 'reveal-from-right', 'reveal-zoom', 'is-visible');
        target.style.removeProperty('transition-delay');
      });
      revealTargets = [];
    };

    const setupReveals = (force = false) => {
      if (
        !force &&
        activeMobileMode === mobileViewport.matches &&
        activeReducedMotion === reducedMotion.matches
      ) {
        return;
      }
      clearReveals();
      activeMobileMode = mobileViewport.matches;
      activeReducedMotion = reducedMotion.matches;
      if (activeReducedMotion) return;

      revealTargets = Array.from(
        document.querySelectorAll<HTMLElement>(activeMobileMode ? mobileTargetSelector : desktopTargetSelector),
      );
      if (activeMobileMode) {
        const visuals = Array.from(document.querySelectorAll<HTMLElement>(visualSelector));
        visuals.forEach((visual, index) => {
          visual.classList.add(index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
        });
        document.querySelector('.hero-photo')?.classList.add('reveal-zoom');
      }
      if (!revealTargets.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              if (!activeMobileMode) observer?.unobserve(entry.target);
            } else if (activeMobileMode) {
              entry.target.classList.remove('is-visible');
            }
          });
        },
        {
          threshold: activeMobileMode ? 0.04 : 0.12,
          rootMargin: activeMobileMode ? '0px 0px -32px 0px' : '0px 0px -20px 0px',
        },
      );

      const observeTarget = (target: HTMLElement) => {
        if (target.classList.contains('reveal-on-scroll')) return;
        target.classList.add('reveal-on-scroll');
        if (activeMobileMode && target.matches(visualSelector)) {
          const visualIndex = revealTargets.filter((item) => item.matches(visualSelector)).length;
          target.classList.add(visualIndex % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
        }
        if (target.classList.contains('hero-content') || target.classList.contains('page-heading')) {
          target.style.transitionDelay = '80ms';
        }
        revealTargets.push(target);
        observer?.observe(target);
      };

      revealTargets = [];
      document.querySelectorAll<HTMLElement>(activeMobileMode ? mobileTargetSelector : desktopTargetSelector)
        .forEach(observeTarget);

      if (activeMobileMode && typeof MutationObserver !== 'undefined') {
        contentObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (!(node instanceof HTMLElement)) return;
              if (node.matches(mobileTargetSelector)) observeTarget(node);
              node.querySelectorAll<HTMLElement>(mobileTargetSelector).forEach(observeTarget);
            });
          });
        });
        contentObserver.observe(document.body, { childList: true, subtree: true });
      }
    };

    setupReveals();
    const handleViewportChange = () => setupReveals();
    if (typeof mobileViewport.addEventListener === 'function') {
      mobileViewport.addEventListener('change', handleViewportChange);
    } else {
      mobileViewport.addListener(handleViewportChange);
    }
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', handleViewportChange);
    } else {
      reducedMotion.addListener(handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });

    return () => {
      if (typeof mobileViewport.removeEventListener === 'function') {
        mobileViewport.removeEventListener('change', handleViewportChange);
      } else {
        mobileViewport.removeListener(handleViewportChange);
      }
      if (typeof reducedMotion.removeEventListener === 'function') {
        reducedMotion.removeEventListener('change', handleViewportChange);
      } else {
        reducedMotion.removeListener(handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      clearReveals();
    };
  }, [location]);

  return null;
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  useEffect(() => setMenuOpen(false), [location]);
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    const isMobileMenu = window.matchMedia('(max-width: 540px)').matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobileMenu) document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (isMobileMenu) document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const isActive = (path: string) => {
    const currentPath = location.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

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
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div id="mobile-navigation" className={`nav-menu ${menuOpen ? 'open' : ''}`}>
            <div className="nav-menu-heading">
              <span>Menu</span>
              <button className="nav-menu-close" type="button" onClick={closeMenu} aria-label="Close navigation menu">
                <X size={20} />
              </button>
            </div>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <Link href="/" className={isActive('/') ? 'active' : ''} aria-current={isActive('/') ? 'page' : undefined} onClick={closeMenu}>Home</Link>
              <Link href="/services" className={isActive('/services') ? 'active' : ''} aria-current={isActive('/services') ? 'page' : undefined} onClick={closeMenu}>Services</Link>
              <Link href="/tracking" className={isActive('/tracking') ? 'active' : ''} aria-current={isActive('/tracking') ? 'page' : undefined} onClick={closeMenu}>Tracking</Link>
              <Link href="/opportunities" className={isActive('/opportunities') ? 'active' : ''} aria-current={isActive('/opportunities') ? 'page' : undefined} onClick={closeMenu}>Opportunities</Link>
              <Link href="/business" className={isActive('/business') ? 'active' : ''} aria-current={isActive('/business') ? 'page' : undefined} onClick={closeMenu}>Business</Link>
              <Link href="/about" className={isActive('/about') ? 'active' : ''} aria-current={isActive('/about') ? 'page' : undefined} onClick={closeMenu}>About</Link>
              <Link href="/resources" className={isActive('/resources') ? 'active' : ''} aria-current={isActive('/resources') ? 'page' : undefined} onClick={closeMenu}>Resources</Link>
              <Link href="/careers" className={isActive('/careers') ? 'active' : ''} aria-current={isActive('/careers') ? 'page' : undefined} onClick={closeMenu}>Careers</Link>
              <Link href="/contact" className={isActive('/contact') ? 'active' : ''} aria-current={isActive('/contact') ? 'page' : undefined} onClick={closeMenu}>Contact</Link>
            </div>
            <div className="nav-cta">
              <Link className="btn btn-outline" href="/tracking" onClick={closeMenu}>Track</Link>
              <Link className="btn btn-primary" href="/services#quote" onClick={closeMenu}>Get a quote <ArrowRight size={14} /></Link>
            </div>
          </div>
        </nav>
      </header>
      <button
        className={`nav-menu-backdrop${menuOpen ? ' open' : ''}`}
        type="button"
        aria-label="Close navigation menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />
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
              <p>Courier, cargo and warehousing services in Bengaluru South and East, with access to a wider network under The Professional Couriers.</p>
              <nav className="footer-social" aria-label="Follow Atlant Global India">
                <a href="https://www.instagram.com/atlantglobalindia/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><FaInstagram /></a>
                <a href="https://www.facebook.com/atlantglobalindia/" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><FaFacebookF /></a>
                <a href="https://in.linkedin.com/company/atlantglobalindia" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><FaLinkedinIn /></a>
                <a href="https://x.com/AtlantInc" target="_blank" rel="noreferrer" aria-label="X" title="X"><FaXTwitter /></a>
              </nav>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <Link href="/services">Domestic Courier</Link>
              <Link href="/services">Pro Premium</Link>
              <Link href="/services">Priority Class</Link>
              <Link href="/services">International</Link>
              <Link href="/services">Warehousing</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="/about#leadership">Leadership</Link>
              <Link href="/about#infrastructure">Operations Hub</Link>
              <Link href="/opportunities">Opportunities</Link>
              <Link href="/careers">Careers</Link>
              <Link href="/business">Business Partnership</Link>
            </div>
            <div className="footer-col">
              <h4>Help &amp; contact</h4>
              <Link href="/tracking">Shipment Tracking</Link>
              <Link href="/resources">FAQs &amp; Resources</Link>
              <Link href="/contact">Branch Locator</Link>
              <Link href="/services#quote">Get a Quote</Link>
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
        <Link href="/tracking"><PackageCheck size={18} />Track</Link>
        <Link href="/services#quote"><FileText size={18} />Quote</Link>
        <a href={`https://wa.me/${PHONE.replace('+', '')}`} target="_blank" rel="noreferrer"><Headset size={18} />WhatsApp</a>
        <a href={`tel:${PHONE}`}><Phone size={18} />Call</a>
      </div>
    </>
  );
}

function SiteRoutes() {
  const [location] = useLocation();
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return (
    <>
      <RouteMeta />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/quote" component={QuotePage} />
          <Route path="/tracking" component={TrackingPage} />
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
  const [assistOpen, setAssistOpen] = useState(false);

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
      {assistOpen && (
        <section className="agi-chat-panel" aria-label="AGI Assist chat" aria-live="polite">
          <header className="agi-chat-header">
            <span className="agi-chat-avatar"><MessageCircle size={20} /></span>
            <span className="agi-chat-title"><strong>AGI Assist</strong><small>Chat support coming soon</small></span>
            <button className="agi-chat-close" type="button" onClick={() => setAssistOpen(false)} aria-label="Close AGI Assist"><X size={18} /></button>
          </header>
          <div className="agi-chat-messages">
            <div className="agi-chat-message">Hi! I’m AGI Assist. I’ll be here to help with your courier questions soon.</div>
            <Link className="btn btn-primary agi-chat-track-link" href="/tracking" onClick={() => setAssistOpen(false)}>Track a shipment <ArrowRight size={14} /></Link>
          </div>
          <div className="agi-chat-footer">Messaging will be available soon.</div>
        </section>
      )}
      <button className="agi-assist-launcher" type="button" onClick={() => setAssistOpen((open) => !open)} aria-expanded={assistOpen} aria-label={assistOpen ? 'Close AGI Assist' : 'Open AGI Assist'}>
        {assistOpen ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
        <span>AGI Assist</span>
      </button>
    </WouterRouter>
  );
}

function App() {
  return <RouterApp />;
}

export default App;
