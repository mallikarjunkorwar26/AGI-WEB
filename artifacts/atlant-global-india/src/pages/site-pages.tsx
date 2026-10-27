import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Circle,
  FileText,
  Globe2,
  Headset,
  MapPin,
  PackageCheck,
  Phone,
  Plane,
  RotateCcw,
  Search,
  Truck,
  Warehouse,
} from 'lucide-react';
import officesData from '../data/offices.json';

const EMAIL = 'connect@atlantglobalindia.com';
const PHONE = '+917411708958';
type TrackingTransaction = Record<string, unknown>;

const demoAwbPrefix = 'AGI-DEMO-';
const demoAwbNumbers = Array.from({ length: 10 }, (_, index) => `${demoAwbPrefix}${String(index + 1).padStart(3, '0')}`);
const demoRoutes = [
  [['Bengaluru', 'Booking Completed'], ['Hosur', 'In Transit'], ['Chennai', 'Delivered']],
  [['Bengaluru', 'Booking Completed'], ['Hosur', 'In Transit']],
  [['Chennai', 'Booking Completed'], ['Bengaluru', 'In Transit'], ['Bengaluru', 'Out for Delivery']],
  [['Bengaluru', 'Booking Completed']],
  [['Mysuru', 'Booking Completed'], ['Bengaluru', 'In Transit'], ['Hyderabad', 'Delivered']],
  [['Bengaluru', 'Booking Completed'], ['Mumbai', 'In Transit']],
  [['Hyderabad', 'Booking Completed'], ['Chennai', 'In Transit'], ['Chennai', 'Out for Delivery']],
  [['Bengaluru', 'Booking Completed'], ['Mysuru', 'In Transit'], ['Mysuru', 'Delivered']],
  [['Chennai', 'Booking Completed'], ['Bengaluru', 'In Transit']],
  [['Bengaluru', 'Booking Completed']],
] as const;

function demoDate(daysAgo: number): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
}

const demoTrackingData: Record<string, TrackingTransaction[]> = Object.fromEntries(
  demoRoutes.map((route, routeIndex) => {
    const awb = demoAwbNumbers[routeIndex];
    const transactions = route.map(([city, activity], eventIndex) => ({
      Date: demoDate(route.length - eventIndex - 1),
      Time: `${String(9 + eventIndex * 3).padStart(2, '0')}:30`,
      City: city,
      Activity: activity,
      Forwardingno: awb,
      Pod_no: awb,
      Remarks: 'Illustrative demo tracking update',
      Pieces: '1',
      Weight: '1.0 kg',
      Receiver: activity === 'Delivered' ? 'Demo Recipient' : '',
      Type: 'Demo',
    }));
    return [awb, transactions];
  }),
);

const trackingStages = [
  { label: 'Booking Completed', icon: PackageCheck, matches: (activity: string) => /booking|booked/i.test(activity) },
  { label: 'In Transit', icon: Truck, matches: (activity: string) => /transit|despatch|dispatch|outbound|arriv|received|hub/i.test(activity) },
  { label: 'Out for Delivery', icon: MapPin, matches: (activity: string) => /out\s*for\s*delivery/i.test(activity) },
  { label: 'Delivered', icon: CheckCircle2, matches: (activity: string) => /delivered/i.test(activity) },
];

const trackingHistoryFields = [
  'Date',
  'Time',
  'City',
  'Activity',
  'Forwardingno',
  'Pod_no',
  'Remarks',
  'Pieces',
  'Weight',
  'Receiver',
  'Receiver Phno',
  'Stamp',
  'Refno',
  'Idproof',
  'Type',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trackingTransactionsFrom(value: unknown): TrackingTransaction[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.transactions)) {
    return value.transactions.filter(isRecord);
  }

  if (Array.isArray(value.data)) {
    return value.data.filter(isRecord);
  }

  return typeof value.Activity === 'string' ? [value] : [];
}

function trackingField(transaction: TrackingTransaction | undefined, field: string): string {
  const value = transaction?.[field];
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function mostRecentField(transactions: TrackingTransaction[], field: string): string {
  for (let index = transactions.length - 1; index >= 0; index -= 1) {
    const value = trackingField(transactions[index], field);
    if (value) return value;
  }
  return '';
}

function trackingErrorForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'That consignment number doesn’t look valid. Please check it and try again.';
    case 404:
      return 'We couldn’t find tracking information for that consignment number.';
    case 429:
      return 'You’ve reached the tracking request limit. Please wait up to one minute, then try again.';
    case 500:
      return 'We’re experiencing a technical issue. Please try again shortly.';
    case 502:
      return 'Our service is temporarily unavailable. Please try again in a few moments.';
    case 503:
      return 'Our server is currently busy or temporarily unavailable. We’re working to restore the service.';
    case 504:
      return 'The request took too long to complete. Please try again.';
    default:
      return 'We couldn’t retrieve tracking information right now. Please try again shortly.';
  }
}

const services = [
  {
    title: 'Domestic',
    image: 'Domestic.png',
    optimizedImage: 'Domestic.avif',
    optimizedImageType: 'image/avif',
    text: 'Courier and cargo services for shipments moving across India.',
    icon: PackageCheck,
    features: ['Courier', 'Cargo', 'Domestic destinations'],
  },
  {
    title: 'Pro Premium',
    image: 'ProPremium.png',
    optimizedImage: 'ProPremium.avif',
    optimizedImageType: 'image/avif',
    text: 'A time-sensitive service option for important documents and consignments.',
    icon: FileText,
    features: ['AM–PM delivery', 'Visa applications', 'Legal and important documents'],
  },
  {
    title: 'Priority Class',
    image: 'Priorityclass.png',
    optimizedImage: 'Priorityclass.avif',
    optimizedImageType: 'image/avif',
    text: 'Express courier and cargo services for business requirements.',
    icon: Truck,
    features: ['Business shipments', 'Express delivery', 'Cargo'],
  },
  {
    title: 'International',
    image: 'Internation.png',
    optimizedImage: 'Internation.avif',
    optimizedImageType: 'image/avif',
    text: 'International courier and cargo connectivity through The Professional Couriers network and applicable partners.',
    icon: Globe2,
    features: ['Courier', 'Cargo', 'International destinations'],
  },
  {
    title: 'Warehousing',
    image: 'Wharehousing.png',
    optimizedImage: 'Wharehousing.webp',
    optimizedImageType: 'image/webp',
    text: 'Storage, handling and distribution support at the Kudlu Gate facility.',
    icon: Warehouse,
    features: ['Kudlu Gate hub', 'Storage', 'Handling and distribution'],
  },
];

const faqs = [
  {
    q: 'Which areas does Atlant Global India serve?',
    a: 'Atlant Global India serves Bengaluru South and East through its local branch network.',
  },
  {
    q: 'Can I arrange a pickup?',
    a: 'Pickup is available through nearby branches. Contact the team to confirm arrangements for your location.',
  },
  {
    q: 'How do I check a consignment?',
    a: 'Enter the AWB or CNOTE number on the tracking page to view the latest shipment status directly on this website.',
  },
  {
    q: 'What services are available?',
    a: 'The listed service range includes Domestic, Pro Premium, Priority Class, International and Warehousing.',
  },
];

function PageHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="page-heading section">
      <div className="container">
        <div className="section-label">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedViaEmail, setSubmittedViaEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      customerName: String(data.get('name') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('mobile') ?? '').trim(),
      service: String(data.get('type') ?? '').trim(),
      requirements: [
        `Pickup: ${data.get('pickup') ?? 'Not provided'}`,
        `Delivery: ${data.get('delivery') ?? 'Not provided'}`,
        `Weight: ${data.get('weight') || 'Not provided'}`,
        `Dimensions: ${data.get('dimensions') || 'Not provided'}`,
        `Monthly volume: ${data.get('volume') || 'Not provided'}`,
        `Requirement: ${data.get('requirement') || 'Not provided'}`,
      ].join(' | '),
      location: String(data.get('pickup') ?? '').trim(),
      source: 'website-quote-form',
    };

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      if (response.status >= 400 && response.status < 500) {
        const errJson = await response.json().catch(() => null);
        setErrorMessage(errJson?.message || 'Please check your information and try again.');
        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.warn('Quote submission API unavailable, falling back to email client', error);
    }

    const subject = encodeURIComponent(`Shipping enquiry — ${payload.customerName}`);
    const body = encodeURIComponent(
      [
        `Name: ${payload.customerName}`,
        `Company: ${payload.company || 'Not provided'}`,
        `Mobile: ${payload.phone}`,
        `Email: ${payload.email}`,
        `Pickup: ${data.get('pickup') ?? 'Not provided'}`,
        `Delivery: ${data.get('delivery') ?? 'Not provided'}`,
        `Shipment type: ${payload.service}`,
        `Weight: ${data.get('weight') || 'Not provided'}`,
        `Dimensions: ${data.get('dimensions') || 'Not provided'}`,
        `Monthly volume: ${data.get('volume') || 'Not provided'}`,
        `Requirement: ${data.get('requirement') || 'Not provided'}`,
      ].join('\n'),
    );
    setSubmitting(false);
    setSubmittedViaEmail(true);
    setSubmitted(true);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="quote-form" onSubmit={submitQuote}>
      <div className="form-grid">
        <div className="field"><label htmlFor="quote-name">Name *</label><input id="quote-name" name="name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="quote-company">Company</label><input id="quote-company" name="company" autoComplete="organization" /></div>
        <div className="field"><label htmlFor="quote-mobile">Mobile *</label><input id="quote-mobile" name="mobile" required type="tel" autoComplete="tel" /></div>
        <div className="field"><label htmlFor="quote-email">Email *</label><input id="quote-email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="quote-pickup">Pickup location *</label><input id="quote-pickup" name="pickup" required /></div>
        <div className="field"><label htmlFor="quote-delivery">Delivery location *</label><input id="quote-delivery" name="delivery" required /></div>
        <div className="field">
          <label htmlFor="quote-type">Shipment type *</label>
          <select id="quote-type" name="type" required defaultValue="">
            <option value="" disabled>Select a service</option>
            <option>Domestic</option><option>Pro Premium</option><option>Priority Class</option>
            <option>International</option><option>Warehousing</option><option>Not sure yet</option>
          </select>
        </div>
        <div className="field"><label htmlFor="quote-weight">Weight</label><input id="quote-weight" name="weight" placeholder="e.g. 8 kg" /></div>
        <div className="field"><label htmlFor="quote-dimensions">Dimensions (L × W × H)</label><input id="quote-dimensions" name="dimensions" placeholder="e.g. 40 × 30 × 25 cm" /></div>
        <div className="field"><label htmlFor="quote-volume">Monthly shipment volume</label><input id="quote-volume" name="volume" placeholder="Approximate volume" /></div>
        <div className="field full"><label htmlFor="quote-requirement">Tell us about your requirement</label><textarea id="quote-requirement" name="requirement" placeholder="What are you shipping, and how often?" /></div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting} data-testid="button-request-quote">
        {submitting ? 'Submitting…' : <>Request a quote <ArrowRight size={14} /></>}
      </button>
      <p className="form-disclaimer">
        Your enquiry is submitted through a secure website API when the backend is available.
        If the API is temporarily unavailable, this form falls back to your email application for delivery to {EMAIL}.
      </p>
      {errorMessage && (
        <div className="error-message" role="alert">{errorMessage}</div>
      )}
      {submitted && (
        <div className={submittedViaEmail ? 'error-message' : 'success-message'} role="status">
          {submittedViaEmail
            ? <>Your email application has opened with the enquiry details. Please send the message to complete submission. You can also email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</>
            : 'Your enquiry has been submitted successfully.'}
        </div>
      )}
    </form>
  );
}

export function HomePage() {
  const [, navigate] = useLocation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingError, setTrackingError] = useState('');

  const submitHeroTracking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = trackingNumber.trim();
    if (!cleaned) {
      setTrackingError('Enter your consignment number to start tracking.');
      return;
    }

    setTrackingError('');
    navigate(`/tracking?consignment=${encodeURIComponent(cleaned)}`);
  };

  return (
    <>
      <section className="hero">
        <picture className="hero-photo-picture">
          <source srcSet={`${import.meta.env.BASE_URL}images/Wharehousing.webp`} type="image/webp" />
          <img
            className="hero-photo"
            src={`${import.meta.env.BASE_URL}images/Operation_Hub.png`}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>
        <div className="container hero-layout">
          <div className="hero-content">
            <div className="eyebrow">Local knowledge. Wider reach.</div>
            <h1>Move more.<br />Deliver further.</h1>
            <p>Your one-stop solution for courier and cargo requirements. Reliable logistics for people and businesses in Bengaluru and destinations across India and beyond.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/services#quote">Get a quote <ArrowRight size={15} /></Link>
              <Link className="btn btn-outline" href="/services">Explore services</Link>
            </div>
            <div className="hero-note">Established 2 July 1990 · Operating under The Professional Couriers</div>
          </div>
          <div className="hero-tracking-wrap">
            <h2>Track Your Shipment</h2>
            <form className="hero-tracking" onSubmit={submitHeroTracking}>
              <label htmlFor="hero-track-number">AWB / Consignment Number</label>
              <input
                id="hero-track-number"
                aria-label="Tracking number"
                aria-describedby={trackingError ? 'hero-tracking-error' : undefined}
                aria-invalid={Boolean(trackingError)}
                autoComplete="off"
                onChange={(event) => {
                  setTrackingNumber(event.target.value);
                  if (trackingError) setTrackingError('');
                }}
                placeholder="Enter your AWB number"
                value={trackingNumber}
              />
              <button className="btn btn-primary" type="submit">Track</button>
            </form>
            {trackingError && <div className="hero-tracking-error" id="hero-tracking-error" role="alert">{trackingError}</div>}
          </div>
        </div>
      </section>
      <section className="trustbar" aria-label="Company facts">
        <div className="container trust-grid">
          <div className="trust-item"><strong>Since 1990</strong><span>Established 2 July 1990</span></div>
          <div className="trust-item"><strong>65</strong><span>Branches</span></div>
          <div className="trust-item"><strong>5,000+</strong><span>Clients</span></div>
          <div className="trust-item"><strong>South &amp; East</strong><span>Bengaluru service region</span></div>
        </div>
      </section>
      <section className="customer-marquee-section" aria-labelledby="customer-logos-title">
        <div className="container customer-marquee-heading">
          <span>Our customers</span>
          <h2 id="customer-logos-title">Moving business forward together.</h2>
        </div>
        <div className="customer-marquee" aria-label="Customer logos">
          <div className="customer-marquee-track">
            <div className="customer-logo-group">
              <img src={`${import.meta.env.BASE_URL}images/Essl.jpg`} alt="ESSL" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Pharmed.png`} alt="Pharmed" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/varsity_education_management_logo.jpg`} alt="Varsity Education Management" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Canon.png`} alt="Canon" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/FIncare.png`} alt="Fincare Small Finance Bank" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Havells_Logo.svg.webp`} alt="Havells" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/hdfc-bank-ltd-phone-banking--new-delhi-delhi-banks-1a8wyfwsty.avif`} alt="HDFC Bank" loading="lazy" decoding="async" />
            </div>
            <div className="customer-logo-group" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}images/Essl.jpg`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Pharmed.png`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/varsity_education_management_logo.jpg`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Canon.png`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/FIncare.png`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/Havells_Logo.svg.webp`} alt="" loading="lazy" decoding="async" />
              <img src={`${import.meta.env.BASE_URL}images/hdfc-bank-ltd-phone-banking--new-delhi-delhi-banks-1a8wyfwsty.avif`} alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>
      <section className="actions-band" aria-label="Quick actions">
        <div className="container quick-grid">
          <div className="quick-card"><PackageCheck className="quick-icon" size={21} /><strong>Track a shipment</strong><p>Continue to the official tracking service.</p><Link href="/tracking">Track now <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><FileText className="quick-icon" size={21} /><strong>Get a quote</strong><p>Tell us about your courier or cargo requirement.</p><Link href="/services#quote">Start an enquiry <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Truck className="quick-icon" size={21} /><strong>Arrange a pickup</strong><p>Pickup is available through nearby branches.</p><Link href="/contact">Contact a branch <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Building2 className="quick-icon" size={21} /><strong>Business solutions</strong><p>Discuss regular, bulk or time-sensitive shipping.</p><Link href="/business">Explore options <ArrowRight size={12} /></Link></div>
        </div>
      </section>
      <section className="section">
        <div className="container intro-grid">
          <div className="intro-photo-wrap">
            <picture className="intro-photo-picture">
              <source srcSet={`${import.meta.env.BASE_URL}images/Wharehousing.webp`} type="image/webp" />
              <img className="intro-photo" src={`${import.meta.env.BASE_URL}images/Operation_Hub.png`} alt="Atlant Global India operations hub at Kudlu Gate, Bengaluru" loading="lazy" decoding="async" />
            </picture>
            <div className="photo-caption">Operations hub · Kudlu Gate, Bengaluru.</div>
          </div>
          <div className="intro-copy">
            <div className="section-label">About Atlant Global India</div>
            <h2>Experience that moves business.</h2>
            <p>Established on July 2, 1990 by Mr. Suresh Surendranath, Atlant Global India (Inc) operates under The Professional Couriers and serves Bengaluru South and East.</p>
            <p>With 65 branches, a distribution hub at Kudlu Gate and a wider courier network, the company supports domestic and international requirements.</p>
            <div className="fact-row"><div className="fact"><strong>1990</strong><span>Established</span></div><div className="fact"><strong>65</strong><span>Branches</span></div><div className="fact"><strong>5,000+</strong><span>Clients</span></div></div>
            <Link className="btn btn-navy" href="/about">Discover the company <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
      <section className="section section-sm">
        <div className="container">
          <div className="section-label">Service range</div><h2>Logistics services, made clear.</h2>
          <p className="section-lead">From domestic courier and cargo to international services and warehousing.</p>
          <div className="service-grid home-service-grid">
            {services.slice(0, 3).map((service) => <ServiceCard key={service.title} service={service} />)}
          </div>
          <Link className="text-link" href="/services">View all services <ArrowRight size={14} /></Link>
        </div>
      </section>
      <section className="section dark-section">
        <div className="container">
          <div className="section-label">The operating foundation</div>
          <h2>Built on experience.<br />Driven by service.</h2>
          <div className="home-facts">
            <div><strong>Local network</strong><span>65 branches serving Bengaluru South and East.</span></div>
            <div><strong>Fleet</strong><span>Own containerized vehicles with GPS tracking.</span></div>
            <div><strong>Visibility</strong><span>MIS shipment status updates.</span></div>
            <div><strong>Security</strong><span>CCTV at warehouse and branches.</span></div>
          </div>
          <Link className="btn btn-outline" href="/about">About the company <ArrowRight size={14} /></Link>
        </div>
      </section>
      <section className="section section-sm">
        <div className="container home-route-cta">
          <div><div className="section-label">Need a hand?</div><h2>Let’s talk about your shipment.</h2></div>
          <div className="hero-actions"><Link className="btn btn-primary" href="/services#quote">Request a quote <ArrowRight size={14} /></Link><Link className="btn btn-outline" href="/contact">Contact our team</Link></div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const Icon = service.icon;
  return (
    <article className="service-card">
      <div className="service-photo service-visual" aria-hidden="true">
        <picture>
          <source srcSet={`${import.meta.env.BASE_URL}images/${service.optimizedImage}`} type={service.optimizedImageType} />
          <img src={`${import.meta.env.BASE_URL}images/${service.image}`} alt="" loading="lazy" decoding="async" />
        </picture>
      </div>
      <div className="service-body">
        <h3><Icon size={17} aria-hidden="true" /> {service.title}</h3>
        <p>{service.text}</p>
        <p className="service-features">{service.features.join(' · ')}</p>
        <Link href="/services#quote">Enquire about this service <ArrowRight size={13} /></Link>
      </div>
    </article>
  );
}

export function ServicesPage() {
  return (
    <>
      <PageHeading eyebrow="Our services" title="Courier, cargo & warehousing." intro="A connected service range for individuals and businesses. Contact our team to confirm service details and availability for your shipment." />
      <section className="section section-sm">
        <div className="container">
          <div className="service-grid">
            {services.map((service) => <ServiceCard key={service.title} service={service} />)}
          </div>
        </div>
      </section>
      <section className="section quote-section" id="quote">
        <div className="container quote-grid">
          <div className="quote-aside">
            <div className="section-label">Request a quote</div>
            <h2>Get a personalized shipping quote.</h2>
            <p>Tell us about your consignment — whether it is an urgent document, commercial cargo, or regular logistics support. Our team will provide rate estimates and delivery schedules.</p>
            <div className="quote-contact-points">
              <p><strong>Prefer to speak with us?</strong><br />
                <a href={`tel:${PHONE}`}>+91 7411 708 958</a><br />
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </p>
              <p>Monday–Saturday · 10am–6pm</p>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
      <section className="section dark-section">
        <div className="container service-support">
          <div><div className="section-label">Need help choosing?</div><h2>Tell us where it’s going.</h2><p className="section-lead">Share your pickup, delivery and shipment details. The team can help you discuss the available service options.</p></div>
          <div className="service-callout"><Check size={20} /><p>Pickup is available through nearby branches. Atlant Global India serves Bengaluru South and East.</p><Link className="btn btn-outline" href="/contact">Find contact details <ArrowRight size={14} /></Link></div>
          <div className="service-callout"><PackageCheck size={20} /><p>For a consignment already in transit, use our tracking page to see the latest status without leaving the website.</p><Link className="btn btn-outline" href="/tracking">Track a shipment <ArrowRight size={14} /></Link></div>
        </div>
      </section>
    </>
  );
}

export function QuotePage() {
  return (
    <>
      <PageHeading eyebrow="Get a quote" title="Request a shipping quote." intro="Provide your pickup, delivery and shipment specifications. Our logistics specialists will prepare custom rates for your domestic or international consignments." />
      <section className="section section-sm quote-section">
        <div className="container quote-grid">
          <div className="quote-aside">
            <div className="section-label">Quick turnaround</div>
            <h2>Fast, reliable quote estimates.</h2>
            <p>We serve Bengaluru South & East with 65 branches and full connectivity across India and overseas through The Professional Couriers network.</p>
            <div className="quote-contact-points">
              <p><strong>Direct contact</strong><br />
                <a href={`tel:${PHONE}`}>+91 7411 708 958</a><br />
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </p>
              <p>Monday–Saturday · 10am–6pm</p>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}

export function TrackingPage() {
  const [consignment, setConsignment] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<{ trackingNumber: string; transactions: TrackingTransaction[]; isDemo: boolean } | null>(null);
  const trackingStatusRef = useRef<HTMLElement | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingNotice, setTrackingNotice] = useState('');

  useEffect(() => {
    if (!trackingResult || !window.matchMedia('(max-width: 760px)').matches) return;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLInputElement && activeElement.id === 'track-number') activeElement.blur();
    const scrollTimer = window.setTimeout(() => {
      trackingStatusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(scrollTimer);
  }, [trackingResult]);

  const submit = async (event?: FormEvent<HTMLFormElement>, numberToTrack = consignment) => {
    event?.preventDefault();
    const cleaned = numberToTrack.trim();

    if (!cleaned) {
      setTrackingResult(null);
      setTrackingNotice('');
      setTrackingError('Enter your consignment number to start tracking.');
      return;
    }

    setLoading(true);
    setTrackingResult(null);
    setTrackingError('');
    setTrackingNotice('');

    const normalizedNumber = cleaned.toUpperCase();
    const demoTransactions = demoTrackingData[normalizedNumber];
    if (demoTransactions) {
      setLoading(true);
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      setTrackingResult({ trackingNumber: normalizedNumber, transactions: demoTransactions, isDemo: true });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: cleaned, source: 'website' }),
        signal: controller.signal,
      });
      const responseText = await response.text();
      if (!response.ok) {
        setTrackingError(trackingErrorForStatus(response.status));
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(responseText);
      } catch {
        setTrackingError('The tracking service returned an unreadable response. Please try again later.');
        return;
      }

      const transactions = trackingTransactionsFrom(payload);
      if (transactions.length === 0) {
        setTrackingNotice(
          `We couldn’t find tracking events for ${cleaned} yet. Please check the number or try again later.`,
        );
        return;
      }

      setTrackingResult({
        trackingNumber: mostRecentField(transactions, 'Pod_no') || cleaned,
        transactions,
        isDemo: false,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setTrackingError(trackingErrorForStatus(504));
      } else {
        setTrackingError('We couldn’t connect to the tracking service. Please check your connection and try again.');
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialNumber = new URLSearchParams(window.location.search).get('consignment')?.trim();
    if (!initialNumber) return;

    setConsignment(initialNumber);
    void submit(undefined, initialNumber);
  }, []);

  const transactions = trackingResult?.transactions ?? [];
  const latestTransaction = transactions[transactions.length - 1];
  const latestActivity = trackingField(latestTransaction, 'Activity') || 'Tracking update';
  const currentStageIndex = (() => {
    for (let index = transactions.length - 1; index >= 0; index -= 1) {
      const stageIndex = trackingStages.findIndex((stage) =>
        stage.matches(trackingField(transactions[index], 'Activity')),
      );
      if (stageIndex >= 0) return stageIndex;
    }
    return -1;
  })();
  const bookingTransaction = transactions.find((transaction) =>
    /booking|booked/i.test(trackingField(transaction, 'Activity')),
  );

  return (
    <div className="tracking-page">
      <section className="tracking-page-hero">
        <div className="container tracking-page-container">
          <div className="tracking-page-heading">
            <span className="tracking-page-eyebrow">Shipment visibility</span>
            <h1>Track Your Shipment</h1>
            <p>Your shipment journey, just a click away.</p>
          </div>

          <form className="tracking-search-card" onSubmit={submit}>
            <label htmlFor="track-number">Consignment number</label>
            <div className="tracking-search-controls">
              <div className="tracking-search-input">
                <Search size={20} aria-hidden="true" />
                <input
                  id="track-number"
                  autoComplete="off"
                  value={consignment}
                  onChange={(event) => setConsignment(event.target.value)}
                  placeholder="Enter the AWB Number"
                  aria-describedby={trackingError ? 'tracking-feedback' : undefined}
                  data-testid="input-tracking-number"
                />
              </div>
              <button className="tracking-submit-button" type="submit" disabled={loading} data-testid="button-track">
                {loading ? <><span className="tracking-spinner" aria-hidden="true" />Searching</> : <>Track Now <ArrowRight size={17} aria-hidden="true" /></>}
              </button>
            </div>
            <p>Enter the POD or consignment number from your booking receipt.</p>
            <details className="tracking-demo-list">
              <summary>Try a demo AWB <span>10 sample numbers</span></summary>
              <div className="tracking-demo-numbers">
                {demoAwbNumbers.map((number) => (
                  <button
                    type="button"
                    key={number}
                    onClick={() => {
                      setConsignment(number);
                      setTrackingResult(null);
                      setTrackingError('');
                      setTrackingNotice('');
                    }}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </details>
          </form>

          {loading && (
            <div className="tracking-feedback tracking-loading" role="status" aria-live="polite">
              <span className="tracking-spinner" aria-hidden="true" />
              <span>Finding your latest shipment updates…</span>
            </div>
          )}
          {trackingError && (
            <div className="tracking-feedback tracking-feedback-error" id="tracking-feedback" role="alert">
              <Circle size={18} aria-hidden="true" />
              <span>{trackingError}</span>
            </div>
          )}
          {trackingNotice && (
            <div className="tracking-feedback tracking-feedback-notice" role="status">
              <PackageCheck size={19} aria-hidden="true" />
              <span>{trackingNotice}</span>
            </div>
          )}

          {trackingResult && (
            <section className="tracking-result" aria-label="Shipment tracking result">
              {trackingResult.isDemo && (
                <div className="tracking-demo-banner" role="note">
                  Demo result — sample shipment events for preview only; this is not live carrier tracking.
                </div>
              )}
              <article className="tracking-status-panel" ref={trackingStatusRef}>
                <div className="tracking-status-topline">
                  <div className="tracking-status-icon"><Truck size={22} aria-hidden="true" /></div>
                  <div className="tracking-status-copy">
                    <span>Current shipment status</span>
                    <h2>{latestActivity}</h2>
                  </div>
                  <span className="tracking-status-badge"><span />{latestActivity}</span>
                </div>
                <div className="tracking-latest-event">
                  <MapPin size={17} aria-hidden="true" />
                  <span>{trackingField(latestTransaction, 'City') || 'Location not provided'}</span>
                  {trackingField(latestTransaction, 'Date') && <span>{trackingField(latestTransaction, 'Date')}</span>}
                  {trackingField(latestTransaction, 'Time') && <span>{trackingField(latestTransaction, 'Time')}</span>}
                </div>
              </article>

              <section className="tracking-journey-card" aria-labelledby="tracking-journey-title">
                <div className="tracking-section-heading">
                  <div>
                    <span>Progress</span>
                    <h2 id="tracking-journey-title">Shipment journey</h2>
                  </div>
                  <span>{trackingResult.trackingNumber}</span>
                </div>
                <ol className="tracking-timeline">
                  {trackingStages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    let stageEvent: TrackingTransaction | undefined;
                    for (let eventIndex = transactions.length - 1; eventIndex >= 0; eventIndex -= 1) {
                      if (stage.matches(trackingField(transactions[eventIndex], 'Activity'))) {
                        stageEvent = transactions[eventIndex];
                        break;
                      }
                    }
                    const completed = currentStageIndex >= index;
                    const current = currentStageIndex === index;

                    return (
                      <li className={`tracking-stage${completed ? ' is-complete' : ''}${current ? ' is-current' : ''}`} key={stage.label}>
                        <span className="tracking-stage-icon">
                          <span className={`tracking-stage-icon-inner${current ? ' tracking-stage-active-icon' : ''}`}>
                            <StageIcon size={18} aria-hidden="true" />
                          </span>
                        </span>
                        <div className="tracking-stage-content">
                          <h3>{stage.label}</h3>
                          {stageEvent ? (
                            <p>
                              {(trackingField(stageEvent, 'Date') || trackingField(stageEvent, 'Time')) && (
                                <span className="tracking-stage-datetime">
                                  {trackingField(stageEvent, 'Date') && <span>{trackingField(stageEvent, 'Date')}</span>}
                                  {trackingField(stageEvent, 'Time') && <span>{trackingField(stageEvent, 'Time')}</span>}
                                </span>
                              )}
                              {trackingField(stageEvent, 'City') && (
                                <span className="tracking-stage-location">
                                  <MapPin size={13} aria-hidden="true" />
                                  {trackingField(stageEvent, 'City')}
                                </span>
                              )}
                            </p>
                          ) : <small>{completed ? 'Completed' : 'Awaiting update'}</small>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section className="tracking-details-card" aria-label="Shipment details">
                <div className="tracking-detail">
                  <span>POD Number</span>
                  <strong>{mostRecentField(transactions, 'Pod_no') || trackingResult.trackingNumber}</strong>
                </div>
                <div className="tracking-detail">
                  <span>Receiver Name</span>
                  <strong>{mostRecentField(transactions, 'Receiver') || 'Not provided'}</strong>
                </div>
                <div className="tracking-detail">
                  <span>Booking Date</span>
                  <strong>{trackingField(bookingTransaction, 'Date') || trackingField(transactions[0], 'Date') || 'Not provided'}</strong>
                </div>
                <div className="tracking-detail">
                  <span>Pieces</span>
                  <strong>{mostRecentField(transactions, 'Pieces') || 'Not provided'}</strong>
                </div>
              </section>

              <details className="tracking-history">
                <summary><span>View Tracking History</span><ChevronDown size={18} aria-hidden="true" /></summary>
                <div className="tracking-history-list">
                  {transactions.slice().reverse().map((transaction, index) => (
                    <article className="tracking-history-event" key={`${trackingField(transaction, 'Forwardingno')}-${trackingField(transaction, 'Date')}-${index}`}>
                      <div className="tracking-history-event-heading">
                        <h3>{trackingField(transaction, 'Activity') || 'Shipment update'}</h3>
                        <span>{[trackingField(transaction, 'Date'), trackingField(transaction, 'Time')].filter(Boolean).join(' · ') || 'Time not provided'}</span>
                      </div>
                      <p><MapPin size={14} aria-hidden="true" />{trackingField(transaction, 'City') || 'Location not provided'}</p>
                      <dl>
                        {trackingHistoryFields.filter((field) => !['Date', 'Time', 'City', 'Activity'].includes(field) && trackingField(transaction, field)).map((field) => (
                          <div key={field}><dt>{field}</dt><dd>{trackingField(transaction, field)}</dd></div>
                        ))}
                      </dl>
                    </article>
                  ))}
                </div>
              </details>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

const careerJobs = [
  {
    id: 'telesales-executive',
    title: 'Telesales Executive',
    department: 'Sales & Business Development',
    location: 'BTM Corporate Office',
    experience: '1–3 Years',
    type: 'Full Time',
    postedDate: '12 Sep 2026',
    deadline: 'Open until filled',
    summary: 'Contact existing and inactive customers regularly, follow up on digital leads, maintain service records, and help convert sales opportunities through clear communication and consistent customer follow-up.',
    responsibilities: [
      'Contact existing customers regularly to collect service feedback and understand business requirements.',
      'Reach out to stopped or inactive customers to revive business and encourage repeat engagement.',
      'Handle digital marketing campaign enquiries and lead follow-ups in a timely manner.',
      'Maintain accurate customer call logs, feedback records, and lead tracking data.',
      'Coordinate with internal teams to resolve customer queries and service requests efficiently.',
      'Monitor branch CCTV systems and report operational or security concerns promptly.',
      'Identify additional customer needs and business opportunities through regular interaction.',
      'Prepare daily and weekly call reports, follow-up logs, and lead status updates.',
    ],
    qualifications: [
      'Minimum 2 years of experience in telesales, telecalling, customer service or a similar field.',
      'Good verbal communication and customer interaction skills.',
      'Comfort with outbound calls, lead follow-up and service-driven sales conversations.',
      'Proficiency in MS Office applications and basic reporting discipline.',
    ],
    skills: [
      'Customer communication',
      'Lead follow-up',
      'Relationship management',
      'Sales coordination',
      'Reporting discipline',
    ],
    preferredSkills: [
      'Experience in logistics, courier or field sales environments',
      'CRM or lead tracking system exposure',
      'Ability to work in a target-driven environment',
    ],
    offer: [
      'Performance-based incentives and recognition',
      'Structured sales coaching and customer interaction development',
      'Growth opportunities in internal sales and business roles',
    ],
  },
  {
    id: 'business-development-manager',
    title: 'Business Development Manager',
    department: 'Operations / Branch Management',
    location: 'Bommasandra, Mahadevapura',
    experience: '5+ Years',
    type: 'Full Time',
    postedDate: '18 Sep 2026',
    deadline: 'Open until filled',
    summary: 'Drive new business by generating leads, coordinating with branch teams, securing client acquisition, and improving branch revenue through customer retention and strategic sales conversion.',
    responsibilities: [
      'Generate leads through cold calling and field work.',
      'Identify profitable business opportunities and customer expansion areas.',
      'Coordinate with delivery executives, branches, and territory heads for verified leads.',
      'Schedule customer meetings, support quotation approvals, and follow up on conversion.',
      'Share consignments and customer information with the customer care team on time.',
      'Escalate customer issues and coordinate with management on tailored client needs.',
      'Drive monthly performance reviews and strengthen client retention.',
      'Upsell and cross-sell services to existing and potential clients.',
      'Manage RFQ documents and maintain daily and monthly reports.',
      'Support revenue generation for assigned branches and sectors.',
    ],
    qualifications: [
      '5+ years of experience in courier, express cargo or logistics operations.',
      'Graduate-level qualification preferred.',
      'Strong customer communication, coordination and relationship-building capability.',
      'Comfortable working with field calls, branch teams and business conversion goals.',
    ],
    skills: [
      'Business development',
      'Lead generation',
      'Client acquisition',
      'Branch coordination',
      'Reporting',
    ],
    preferredSkills: [
      'Prior experience in Bengaluru operations',
      'Strong understanding of branch-level logistics workflows',
      'Ability to manage corporate and SME client relationships',
    ],
    offer: [
      'Business travel and team collaboration opportunities',
      'Leadership growth in regional commercial roles',
      'Exposure to high-value client and network operations',
    ],
  },
  {
    id: 'receptionist',
    title: 'Receptionist',
    department: 'Administration / Front Office',
    location: 'Agara, Sarakki',
    experience: '0–2 Years',
    type: 'Full Time',
    postedDate: '20 Sep 2026',
    deadline: 'Open until filled',
    summary: 'Welcome customers, answer queries, manage front-office operations, and ensure a smooth customer experience at the branch while supporting branch administrative activities.',
    responsibilities: [
      'Answer customer queries and share information about company services.',
      'Handle customer complaints and concerns in a professional manner.',
      'Support branch system work including data entry and documentation.',
      'Assist with filing, record upkeep and administrative coordination.',
      'Provide a positive experience to walk-in customers and callers.',
      'Coordinate with internal teams to support branch operations.',
    ],
    qualifications: [
      'Good communication and presentation skills.',
      'Familiarity with office systems and basic computer usage.',
      'Professional and customer-friendly attitude.',
      'Basic knowledge of courier services is preferred.',
    ],
    skills: [
      'Customer support',
      'Office coordination',
      'Documentation',
      'Branch front office',
      'Service orientation',
    ],
    preferredSkills: [
      'Front office or customer support experience',
      'Comfortable operating a branch reception desk',
      'Experience with internal service coordination',
    ],
    offer: [
      'Supportive branch environment and structured onboarding',
      'Exposure to customer-facing logistics operations',
      'Opportunity to grow in administrative and operations roles',
    ],
  },
  {
    id: 'branch-manager',
    title: 'Branch Manager',
    department: 'Operations / Branch Management',
    location: 'Hoskote, Nagnathpura',
    experience: '3–5 Years',
    type: 'Full Time',
    postedDate: '25 Sep 2026',
    deadline: 'Open until filled',
    summary: 'Lead branch operations, maintain service standards, manage staff discipline, improve customer experience, and drive branch-level performance and revenue growth.',
    responsibilities: [
      'Maintain branch reporting discipline and operational timelines.',
      'Monitor attendance and reporting of delivery executives and reception staff.',
      'Assign delivery routes and ensure all shipments are delivered and picked up on time.',
      'Ensure branch receipt of parcels and documents as per SLA from the operations hub.',
      'Review staff performance and ensure daily task completion.',
      'Inspect delivery routes and verify adherence to service levels.',
      'Check holding shipments, return consignments and update records accurately.',
      'Manage customer relationships and resolve branch-related complaints.',
      'Ensure collections and pending accounts are routed for follow-up appropriately.',
      'Assign pickup schedules and monitor daily execution.',
      'Coordinate with sales teams on customer leads and branch growth opportunities.',
    ],
    qualifications: [
      'Strong leadership and operational control skills.',
      'Relevant industry experience in branch operations or service management preferred.',
      'Ability to supervise delivery teams, front-office staff and customer operations.',
      'Fluency in English, Kannada and Hindi is preferred.',
    ],
    skills: [
      'Branch operations',
      'Leadership',
      'Customer escalation handling',
      'Collections follow-up',
      'Operational discipline',
    ],
    preferredSkills: [
      'Prior branch management or supervisory experience',
      'Strong understanding of SLA and service operations',
      'Experience managing team performance and customer escalations',
    ],
    offer: [
      'Leadership exposure in regional branch operations',
      'Performance-driven growth and team management opportunities',
      'Opportunity to lead operational excellence initiatives',
    ],
  },
] as const;

export function CareersPage() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<string>(careerJobs[0].id);
  const [applicationStep, setApplicationStep] = useState(1);
  const [appError, setAppError] = useState('');
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [careerSubmitted, setCareerSubmitted] = useState(false);
  const [careerSubmittedViaEmail, setCareerSubmittedViaEmail] = useState(false);
  const [resumeSubmitting, setResumeSubmitting] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeSubmitted, setResumeSubmitted] = useState(false);
  const [resumeSubmittedViaEmail, setResumeSubmittedViaEmail] = useState(false);
  const [application, setApplication] = useState({
    fullName: '',
    email: '',
    mobile: '',
    location: '',
    position: String(careerJobs[0].title),
    currentCompany: '',
    experience: '',
    skills: '',
    linkedin: '',
    portfolio: '',
    resume: '',
    coverNote: '',
  });
  const [resume, setResume] = useState({
    fullName: '',
    email: '',
    mobile: '',
    location: '',
    skills: '',
    message: '',
  });

  const filteredJobs = useMemo(() => {
    return careerJobs.filter((job) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || [job.title, job.department, job.location, job.summary, job.skills.join(' '), job.qualifications.join(' ')].join(' ').toLowerCase().includes(query);
      const matchesLocation = locationFilter === 'All' || job.location === locationFilter;
      const matchesDepartment = departmentFilter === 'All' || job.department === departmentFilter;
      const matchesExperience = experienceFilter === 'All' || job.experience === experienceFilter;
      const matchesType = typeFilter === 'All' || job.type === typeFilter;
      return matchesSearch && matchesLocation && matchesDepartment && matchesExperience && matchesType;
    });
  }, [search, locationFilter, departmentFilter, experienceFilter, typeFilter]);

  const currentJob = filteredJobs.find((job) => job.id === selectedJob) ?? careerJobs.find((job) => job.id === selectedJob) ?? careerJobs[0];
  const locationOptions = ['All', ...new Set(careerJobs.map((job) => job.location))];
  const departmentOptions = ['All', ...new Set(careerJobs.map((job) => job.department))];
  const experienceOptions = ['All', ...new Set(careerJobs.map((job) => job.experience))];
  const typeOptions = ['All', ...new Set(careerJobs.map((job) => job.type))];

  const clearFilters = () => {
    setSearch('');
    setLocationFilter('All');
    setDepartmentFilter('All');
    setExperienceFilter('All');
    setTypeFilter('All');
  };

  const nextApplicationStep = () => {
    setAppError('');
    if (applicationStep === 1) {
      if (!application.fullName.trim()) { setAppError('Please enter your full name.'); return; }
      if (!application.email.trim() || !/\S+@\S+\.\S+/.test(application.email)) { setAppError('Please enter a valid email address.'); return; }
      if (!application.mobile.trim() || application.mobile.trim().length < 7) { setAppError('Please enter a valid mobile number.'); return; }
      if (!application.location.trim()) { setAppError('Please enter your current location.'); return; }
    }
    if (applicationStep === 2) {
      if (!application.experience.trim()) { setAppError('Please enter your years of experience.'); return; }
      if (!application.skills.trim()) { setAppError('Please enter your relevant skills.'); return; }
    }
    setApplicationStep((step) => Math.min(4, step + 1));
  };

  const handleApplicationChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = event.target;
    const value = event.target instanceof HTMLInputElement && event.target.type === 'file' ? event.target.files?.[0]?.name ?? '' : event.target.value;
    setApplication((current) => ({ ...current, [name]: value }));
  };

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setResume((current) => ({ ...current, [name]: value }));
  };

  const submitCareerApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppError('');
    setAppSubmitting(true);

    const payload = {
      name: application.fullName.trim(),
      company: application.currentCompany?.trim() || '',
      email: application.email.trim(),
      phone: application.mobile.trim(),
      serviceInterest: application.position,
      subject: `Job Application - ${application.position}`,
      message: [
        `Current Location: ${application.location}`,
        `Experience: ${application.experience}`,
        `Skills: ${application.skills}`,
        `LinkedIn: ${application.linkedin || 'Not provided'}`,
        `Portfolio: ${application.portfolio || 'Not provided'}`,
        `Resume: ${application.resume || 'Not provided'}`,
      ].join('\n'),
      source: 'careers-page',
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setCareerSubmitted(true);
        setAppSubmitting(false);
        return;
      }

      if (response.status >= 400 && response.status < 500) {
        const errJson = await response.json().catch(() => null);
        setAppError(errJson?.message || 'Please check your application information and try again.');
        setAppSubmitting(false);
        return;
      }
    } catch (error) {
      console.warn('Careers API unavailable, falling back to mailto', error);
    }

    const body = [
      `Position Applying For: ${application.position}`,
      `Full Name: ${application.fullName}`,
      `Email: ${application.email}`,
      `Mobile: ${application.mobile}`,
      `Current Location: ${application.location}`,
      `Current Company: ${application.currentCompany || 'Not provided'}`,
      `Experience: ${application.experience}`,
      `Skills: ${application.skills}`,
      `LinkedIn: ${application.linkedin || 'Not provided'}`,
      `Portfolio: ${application.portfolio || 'Not provided'}`,
      `Resume: ${application.resume || 'Not provided'}`,
      `Cover Note: ${application.coverNote || 'Not provided'}`,
    ].join('\n');
    setAppSubmitting(false);
    setCareerSubmittedViaEmail(true);
    setCareerSubmitted(true);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Job Application - ${application.position}`)}&body=${encodeURIComponent(body)}`;
  };

  const submitTalentNetwork = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResumeError('');
    setResumeSubmitting(true);

    const payload = {
      name: resume.fullName.trim(),
      email: resume.email.trim(),
      phone: resume.mobile.trim(),
      serviceInterest: 'General Resume Submission',
      subject: 'General Resume Submission',
      message: [
        `Current Location: ${resume.location || 'Not provided'}`,
        `Core Skills: ${resume.skills || 'Not provided'}`,
        `Message: ${resume.message || 'Not provided'}`,
      ].join('\n'),
      source: 'talent-network',
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setResumeSubmitted(true);
        setResumeSubmitting(false);
        return;
      }

      if (response.status >= 400 && response.status < 500) {
        const errJson = await response.json().catch(() => null);
        setResumeError(errJson?.message || 'Please check your details and try again.');
        setResumeSubmitting(false);
        return;
      }
    } catch (error) {
      console.warn('Talent network API unavailable, falling back to mailto', error);
    }

    const body = [
      `Full Name: ${resume.fullName}`,
      `Email: ${resume.email}`,
      `Mobile: ${resume.mobile}`,
      `Current Location: ${resume.location}`,
      `Core Skills: ${resume.skills}`,
      `Message: ${resume.message || 'Not provided'}`,
    ].join('\n');
    setResumeSubmitting(false);
    setResumeSubmittedViaEmail(true);
    setResumeSubmitted(true);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('General Resume Submission')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <PageHeading
        eyebrow="Careers"
        title="Careers at Atlant Global India"
        intro="Explore opportunities to grow your career with Atlant Global India and The Professional Couriers."
      />

      <section className="section section-sm career-search-section">
        <div className="container">
          <div className="career-search-panel">
            <div className="career-intro-bar">
              <div>
                <div className="section-label">Find your opportunity</div>
                <h2>Find the right role for you.</h2>
              </div>
              <div className="career-cta-row">
                <a href="#job-listings" className="btn btn-primary">View Open Positions</a>
                <a href="#resume-form" className="btn btn-outline">Submit Your Resume</a>
              </div>
            </div>

            <div className="career-search-controls active">
              <div className="career-search-field search-wide">
                <label htmlFor="career-search">Search by keyword</label>
                <input id="career-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title, keyword or skill" />
              </div>

              <div className="career-filter-row">
                <div className="career-search-field">
                  <label htmlFor="career-location">Location</label>
                  <select id="career-location" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                    {locationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="career-search-field">
                  <label htmlFor="career-department">Category</label>
                  <select id="career-department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                    {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="career-search-field">
                  <label htmlFor="career-experience">Experience</label>
                  <select id="career-experience" value={experienceFilter} onChange={(event) => setExperienceFilter(event.target.value)}>
                    {experienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="career-search-field">
                  <label htmlFor="career-type">Job Type</label>
                  <select id="career-type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    {typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="career-search-field search-actions">
                  <span className="search-label">Action</span>
                  <div className="search-button-row">
                    <button type="button" className="btn btn-primary" onClick={() => document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Search Jobs</button>
                    <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="job-listings" className="section section-sm career-list-section">
        <div className="container career-layout">
          <div className="career-list-column">
            <div className="section-heading-row">
              <div>
                <div className="section-label">Current openings</div>
                <h2>Current Job Openings</h2>
              </div>
              <span className="job-count-chip">{filteredJobs.length} open</span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="no-jobs-box" role="status">
                <div className="section-label">No roles available</div>
                <h3>No Matching Opportunities Found</h3>
                <p>We couldn't find a role matching your selected filters.</p>
                <button type="button" className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="career-list">
                {filteredJobs.map((job) => (
                  <article key={job.id} className={`career-role-card ${selectedJob === job.id ? 'active' : ''}`}>
                    <div className="career-role-header">
                      <div>
                        <h3>{job.title}</h3>
                        <span>{job.department}</span>
                      </div>
                      <button type="button" className="text-link" onClick={() => setSelectedJob(job.id)}>View Position <ArrowUpRight size={13} /></button>
                    </div>
                    <div className="career-role-meta">
                      <span>{job.location}</span>
                      <span>{job.experience}</span>
                      <span>{job.type}</span>
                    </div>
                    <p>{job.summary}</p>
                    <div className="career-role-footer">
                      <div className="meta-col"><strong>Posted</strong><span>{job.postedDate}</span></div>
                      <div className="meta-col"><strong>Deadline</strong><span>{job.deadline}</span></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside id="career-detail-panel" className="career-detail-panel">
            <div className="section-label">Role details</div>
            <h3>{currentJob.title}</h3>
            <div className="career-detail-meta-grid">
              <div><span>Department</span><strong>{currentJob.department}</strong></div>
              <div><span>Location</span><strong>{currentJob.location}</strong></div>
              <div><span>Experience</span><strong>{currentJob.experience}</strong></div>
              <div><span>Employment Type</span><strong>{currentJob.type}</strong></div>
              <div><span>Posted</span><strong>{currentJob.postedDate}</strong></div>
              <div><span>Deadline</span><strong>{currentJob.deadline}</strong></div>
            </div>

            <div className="job-detail-block">
              <h4>About the Role</h4>
              <p>{currentJob.summary}</p>
            </div>

            <div className="job-detail-block">
              <h4>Key Responsibilities</h4>
              <ul>{currentJob.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <div className="job-detail-block">
              <h4>Qualifications</h4>
              <ul>{currentJob.qualifications.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <div className="job-detail-block">
              <h4>Core Skills</h4>
              <ul>{currentJob.skills.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <div className="job-detail-block">
              <h4>Preferred Skills</h4>
              <ul>{currentJob.preferredSkills.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <div className="career-side-apply">
              <div className="section-label">Interested in this position?</div>
              <button type="button" className="btn btn-primary" onClick={() => {
                setApplication((current) => ({ ...current, position: currentJob.title }));
                document.getElementById('career-application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>Apply Now</button>
            </div>
          </aside>
        </div>
      </section>

      <section id="career-application-form" className="section section-sm career-application-section">
        <div className="container application-panel">
          <div className="section-label">Apply now</div>
          <h2>Submit Your Application</h2>

          {careerSubmitted ? (
            <div className="application-confirmation">
              <h3>{careerSubmittedViaEmail ? 'Complete Your Application' : 'Application Successfully Submitted'}</h3>
              <p>{careerSubmittedViaEmail
                ? <>Your email application has opened with the details. Please send it to complete your application. You can also email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</>
                : 'Thank you for your interest in joining Atlant Global India. Your application has been received successfully.'}</p>
            </div>
          ) : (
            <form className="career-multi-step-form" onSubmit={submitCareerApplication}>
              {appError && (
                <div className="error-message" role="alert" style={{ marginBottom: '16px' }}>{appError}</div>
              )}
              {applicationStep === 1 && (
                <div className="career-step-form">
                  <h3>Step 1 — Personal Details</h3>
                  <div className="career-multi-grid">
                    <div className="field">
                      <label htmlFor="career-app-name">Full Name *</label>
                      <input id="career-app-name" name="fullName" value={application.fullName} onChange={handleApplicationChange} required autoComplete="name" />
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-email">Email *</label>
                      <input id="career-app-email" name="email" type="email" value={application.email} onChange={handleApplicationChange} required autoComplete="email" />
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-mobile">Mobile *</label>
                      <input id="career-app-mobile" name="mobile" type="tel" value={application.mobile} onChange={handleApplicationChange} required autoComplete="tel" />
                    </div>
                    <div className="field full">
                      <label htmlFor="career-app-location">Current Location *</label>
                      <input id="career-app-location" name="location" value={application.location} onChange={handleApplicationChange} required />
                    </div>
                  </div>
                </div>
              )}

              {applicationStep === 2 && (
                <div className="career-step-form">
                  <h3>Step 2 — Professional Details</h3>
                  <div className="career-multi-grid">
                    <div className="field">
                      <label htmlFor="career-app-position">Position</label>
                      <select id="career-app-position" name="position" value={application.position} onChange={handleApplicationChange}>
                        {careerJobs.map((job) => <option key={job.id} value={job.title}>{job.title}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-company">Current Company</label>
                      <input id="career-app-company" name="currentCompany" value={application.currentCompany} onChange={handleApplicationChange} />
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-experience">Experience *</label>
                      <input id="career-app-experience" name="experience" value={application.experience} onChange={handleApplicationChange} required placeholder="e.g. 2 years" />
                    </div>
                    <div className="field full">
                      <label htmlFor="career-app-skills">Relevant Skills *</label>
                      <input id="career-app-skills" name="skills" value={application.skills} onChange={handleApplicationChange} required placeholder="e.g. Sales, CRM, Operations" />
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-linkedin">LinkedIn</label>
                      <input id="career-app-linkedin" name="linkedin" value={application.linkedin} onChange={handleApplicationChange} placeholder="Profile URL" />
                    </div>
                    <div className="field">
                      <label htmlFor="career-app-portfolio">Portfolio / Website</label>
                      <input id="career-app-portfolio" name="portfolio" value={application.portfolio} onChange={handleApplicationChange} placeholder="Website URL" />
                    </div>
                  </div>
                </div>
              )}

              {applicationStep === 3 && (
                <div className="career-step-form">
                  <h3>Step 3 — Resume</h3>
                  <div className="upload-wrap">
                    <label className="upload-input" htmlFor="career-app-resume">
                      <span>Upload resume</span>
                      <input id="career-app-resume" type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleApplicationChange} />
                    </label>
                    <p>{application.resume ? `Selected: ${application.resume}` : 'Accepted formats: PDF / DOC / DOCX'}</p>
                  </div>
                </div>
              )}

              {applicationStep === 4 && (
                <div className="career-step-form">
                  <h3>Step 4 — Review &amp; Submit</h3>
                  <div className="review-box">
                    <p><strong>Name:</strong> {application.fullName}</p>
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Mobile:</strong> {application.mobile}</p>
                    <p><strong>Position:</strong> {application.position}</p>
                    <p><strong>Experience:</strong> {application.experience}</p>
                    <p><strong>Skills:</strong> {application.skills}</p>
                  </div>
                </div>
              )}

              <div className="career-multi-actions">
                {applicationStep > 1 && <button type="button" className="btn btn-outline" onClick={() => setApplicationStep((step) => Math.max(1, step - 1))}>Previous</button>}
                {applicationStep < 4 && <button type="button" className="btn btn-primary" onClick={nextApplicationStep}>Next</button>}
                {applicationStep === 4 && <button type="submit" className="btn btn-primary" disabled={appSubmitting}>{appSubmitting ? 'Submitting…' : 'Submit Application'}</button>}
              </div>
            </form>
          )}
        </div>
      </section>

      <section id="resume-form" className="section section-sm talent-network-section">
        <div className="container talent-network-box">
          <div>
            <div className="section-label">Open application</div>
            <h2>Don't see the right opportunity?</h2>
            <p>Share your profile with us and we can consider it for relevant future openings.</p>
          </div>

          {resumeSubmitted ? (
            <div className={resumeSubmittedViaEmail ? 'error-message' : 'success-message'}>
              {resumeSubmittedViaEmail
                ? <>Your email application has opened with your profile details. Please send it to complete submission. You can also email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</>
                : 'Your profile has been submitted for future opportunity consideration.'}
            </div>
          ) : (
            <form className="talent-network-form" onSubmit={submitTalentNetwork}>
              {resumeError && (
                <div className="error-message" role="alert">{resumeError}</div>
              )}
              <div className="career-multi-grid">
                <div className="field">
                  <label htmlFor="talent-name">Full Name *</label>
                  <input id="talent-name" name="fullName" value={resume.fullName} onChange={handleResumeChange} required autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="talent-email">Email *</label>
                  <input id="talent-email" name="email" type="email" value={resume.email} onChange={handleResumeChange} required autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="talent-mobile">Mobile *</label>
                  <input id="talent-mobile" name="mobile" type="tel" value={resume.mobile} onChange={handleResumeChange} required autoComplete="tel" />
                </div>
                <div className="field full">
                  <label htmlFor="talent-location">Current Location</label>
                  <input id="talent-location" name="location" value={resume.location} onChange={handleResumeChange} />
                </div>
                <div className="field full">
                  <label htmlFor="talent-skills">Core Skills</label>
                  <input id="talent-skills" name="skills" value={resume.skills} onChange={handleResumeChange} />
                </div>
                <div className="field full">
                  <label htmlFor="talent-message">Tell us about yourself</label>
                  <textarea id="talent-message" name="message" value={resume.message} onChange={handleResumeChange} rows={4} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={resumeSubmitting}>
                {resumeSubmitting ? 'Submitting…' : 'Submit Your Resume'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="section section-sm career-cross-nav">
        <div className="container cross-nav-box">
          <div>
            <div className="section-label">Looking for a business opportunity instead?</div>
            <h2>Explore franchise and channel partner opportunities</h2>
          </div>
          <Link href="/business" className="btn btn-primary">Become a Business Partner</Link>
        </div>
      </section>
    </>
  );
}

export function OpportunitiesPage() {
  return (
    <>
      <PageHeading
        eyebrow="Opportunities"
        title="Opportunities at Atlant Global India"
        intro="Explore opportunities to build your career or grow your business with Atlant Global India."
      />

      <section className="section section-sm opportunities-page">
        <div className="container opportunities-grid">
          <Link href="/careers" className="opportunity-card opportunity-card-career">
            <div className="opportunity-card-inner">
              <span className="opportunity-tag">Career Opportunities</span>
              <h2>Build Your Career With Us</h2>
              <p>Explore current job opportunities and discover your next professional challenge with Atlant Global India.</p>
              <div className="opportunity-cta-row">
                <span>Explore Careers</span>
                <ArrowRight size={15} />
              </div>
              <div className="opportunity-meta-row">
                <span>Jobs</span>
                <span>Professional Growth</span>
                <span>Open Positions</span>
              </div>
            </div>
          </Link>

          <Link href="/business" className="opportunity-card opportunity-card-business">
            <div className="opportunity-card-inner">
              <span className="opportunity-tag">Business Opportunities</span>
              <h2>Build Your Courier &amp; Logistics Business</h2>
              <p>Explore Franchise and Channel Partner opportunities and build your presence in the courier and logistics industry with Atlant Global India.</p>
              <div className="opportunity-cta-row">
                <span>Become a Business Partner</span>
                <ArrowRight size={15} />
              </div>
              <div className="opportunity-meta-row">
                <span>Franchise</span>
                <span>Channel Partner</span>
                <span>Business Opportunity</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}

export function BusinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    businessName: '',
    businessType: '',
    yearsInBusiness: '',
    state: '',
    city: '',
    area: '',
    operatingLocation: '',
    interest: 'Franchise / Branch Opportunity',
    gstRegistered: 'No',
    gstNumber: '',
    courierExperience: 'No',
    infrastructure: '',
  });

  const updateField = (field: string, value: string) => {
    setSubmissionError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const nextStep = () => {
    setSubmissionError('');
    if (currentStep === 1) {
      if (!form.fullName.trim() || !form.mobile.trim() || !form.email.trim()) {
        setSubmissionError('Please provide your full name, mobile number, and email address.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setSubmissionError('Please provide a valid email address.');
        return;
      }
    } else if (currentStep === 2) {
      if (!form.businessName.trim() || !form.businessType.trim() || !form.yearsInBusiness.trim()) {
        setSubmissionError('Please provide your business name, business type, and years in business.');
        return;
      }
    } else if (currentStep === 3) {
      if (!form.state.trim() || !form.city.trim() || !form.area.trim() || !form.operatingLocation.trim()) {
        setSubmissionError('Please fill in the state, city, area, and proposed operating location.');
        return;
      }
    } else if (currentStep === 4) {
      if (form.gstRegistered === 'Yes' && !form.gstNumber.trim()) {
        setSubmissionError('Please provide your GST number or change GST registration to "No".');
        return;
      }
    }
    setCurrentStep((step) => Math.min(step + 1, 5));
  };

  const previousStep = () => {
    setSubmissionError('');
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError('');
    setSubmitting(true);
    const payload = {
      name: form.fullName,
      company: form.businessName,
      email: form.email,
      phone: form.mobile,
      serviceInterest: form.interest,
      subject: 'Partnership Enquiry',
      message: [
        `Business Type: ${form.businessType}`,
        `Years in Business: ${form.yearsInBusiness}`,
        `State: ${form.state}`,
        `City: ${form.city}`,
        `Area: ${form.area}`,
        `Operating Location: ${form.operatingLocation}`,
        `GST Registered: ${form.gstRegistered}`,
        `GST Number: ${form.gstNumber || 'Not provided'}`,
        `Courier Experience: ${form.courierExperience}`,
        `Infrastructure: ${form.infrastructure || 'Not provided'}`,
      ].join('\n'),
      source: 'business-page',
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSubmissionError(response.status >= 500
          ? 'We couldn’t submit your enquiry due to a temporary service issue. Please try again or contact our team.'
          : 'We couldn’t submit your enquiry. Please review the information and try again.');
        return;
      }
      const result: unknown = await response.json();
      setReference(isRecord(result) && typeof result.id === 'string' ? result.id : '');
      setSubmitted(true);
    } catch (error) {
      console.warn('Business enquiry submission failed', error);
      setSubmissionError('We couldn’t connect to the enquiry service. Please check your connection or contact our team.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (submitted) {
      return (
        <div className="partner-confirmation">
          <div className="section-label">Partnership enquiry</div>
          <h2>Thank You for Your Interest</h2>
          <p>Thank you for your interest in partnering with Atlant Global India. Our team has received your enquiry and will review the information provided.</p>
          {reference && <div className="reference-box"><span>Enquiry Reference</span><strong>{reference}</strong></div>}
          <Link className="btn btn-primary" href="/careers">Explore Career Opportunities</Link>
        </div>
      );
    }

    const isLastStep = currentStep === 5;

    return (
      <form className="partner-form" onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div className="partner-form-step">
            <h3>Step 1 — Personal Information</h3>
            <div className="partner-grid">
              <div className="field">
                <label htmlFor="biz-fullname">Full Name *</label>
                <input id="biz-fullname" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="biz-mobile">Mobile Number *</label>
                <input id="biz-mobile" type="tel" value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)} required autoComplete="tel" />
              </div>
              <div className="field full">
                <label htmlFor="biz-email">Email Address *</label>
                <input id="biz-email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required autoComplete="email" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="partner-form-step">
            <h3>Step 2 — Business Information</h3>
            <div className="partner-grid">
              <div className="field">
                <label htmlFor="biz-company">Business / Company Name *</label>
                <input id="biz-company" value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} required autoComplete="organization" />
              </div>
              <div className="field">
                <label htmlFor="biz-type">Existing Business Type *</label>
                <input id="biz-type" value={form.businessType} onChange={(e) => updateField('businessType', e.target.value)} required placeholder="e.g. Retail, Logistics, Distribution" />
              </div>
              <div className="field full">
                <label htmlFor="biz-years">Years in Business *</label>
                <input id="biz-years" value={form.yearsInBusiness} onChange={(e) => updateField('yearsInBusiness', e.target.value)} required placeholder="e.g. 3 years" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="partner-form-step">
            <h3>Step 3 — Location</h3>
            <div className="partner-grid">
              <div className="field">
                <label htmlFor="biz-state">State *</label>
                <input id="biz-state" value={form.state} onChange={(e) => updateField('state', e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="biz-city">City *</label>
                <input id="biz-city" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="biz-area">Area / Locality *</label>
                <input id="biz-area" value={form.area} onChange={(e) => updateField('area', e.target.value)} required />
              </div>
              <div className="field full">
                <label htmlFor="biz-operating">Proposed Operating Location *</label>
                <input id="biz-operating" value={form.operatingLocation} onChange={(e) => updateField('operatingLocation', e.target.value)} required placeholder="Target locality or premises address" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="partner-form-step">
            <h3>Step 4 — Partnership Information</h3>
            <div className="partner-option-group">
              <p>What type of opportunity are you interested in?</p>
              {['Franchise / Branch Opportunity', 'Channel Partner', 'Business Association', 'Other'].map((option, idx) => (
                <label key={option} htmlFor={`biz-opp-${idx}`} className="radio-option">
                  <input id={`biz-opp-${idx}`} type="radio" name="interest" checked={form.interest === option} onChange={() => updateField('interest', option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="partner-option-group">
              <p>Are you currently registered under GST?</p>
              {['Yes', 'No'].map((option, idx) => (
                <label key={option} htmlFor={`biz-gst-${idx}`} className="radio-option">
                  <input id={`biz-gst-${idx}`} type="radio" name="gstRegistered" checked={form.gstRegistered === option} onChange={() => updateField('gstRegistered', option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            {form.gstRegistered === 'Yes' && (
              <div className="field full">
                <label htmlFor="biz-gst-number">GST Number *</label>
                <input id="biz-gst-number" value={form.gstNumber} onChange={(e) => updateField('gstNumber', e.target.value)} required placeholder="22AAAAA0000A1Z5" />
              </div>
            )}

            <div className="partner-option-group">
              <p>Do you have logistics / courier experience?</p>
              {['Yes', 'No'].map((option, idx) => (
                <label key={option} htmlFor={`biz-exp-${idx}`} className="radio-option">
                  <input id={`biz-exp-${idx}`} type="radio" name="courierExperience" checked={form.courierExperience === option} onChange={() => updateField('courierExperience', option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="field full">
              <label htmlFor="biz-infra">Available Infrastructure</label>
              <textarea id="biz-infra" value={form.infrastructure} onChange={(e) => updateField('infrastructure', e.target.value)} rows={4} placeholder="Provide relevant details about your available space, vehicle fleet, or operational readiness." />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="partner-form-step">
            <h3>Step 5 — Submit</h3>
            <div className="review-box">
              <p><strong>Name:</strong> {form.fullName}</p>
              <p><strong>Mobile:</strong> {form.mobile}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Business:</strong> {form.businessName}</p>
              <p><strong>Location:</strong> {form.city}, {form.state}</p>
              <p><strong>Interest:</strong> {form.interest}</p>
              <p><strong>GST:</strong> {form.gstRegistered}</p>
              <p><strong>Courier Experience:</strong> {form.courierExperience}</p>
            </div>
          </div>
        )}

        <div className="partner-form-actions">
          {submissionError && <div className="error-message" role="alert">{submissionError} <a href={`mailto:${EMAIL}`}>Email {EMAIL}</a>.</div>}
          {currentStep > 1 && !submitted && <button type="button" className="btn btn-outline" onClick={previousStep}>Previous</button>}
          {!submitted && currentStep < 5 && <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>}
          {!submitted && isLastStep && <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Partnership Enquiry'}</button>}
        </div>
      </form>
    );
  };

  return (
    <>
      <PageHeading
        eyebrow="Business opportunities"
        title="Start Your Courier &amp; Logistics Business"
        intro="Explore opportunities to become a Franchise or Channel Partner and build your presence in the courier and logistics industry with the support of Atlant Global India."
      />

      <section className="section section-sm business-partner-hero">
        <div className="container partner-hero-grid">
          <div className="partner-hero-copy">
            <div className="section-label">Business opportunity</div>
            <h2>Start Your Courier &amp; Logistics Business with Atlant Global India</h2>
            <p>Explore opportunities to become a Franchise or Channel Partner and build your presence in the courier and logistics industry with the support of Atlant Global India.</p>
            <div className="hero-actions">
              <a href="#partnership-enquiry" className="btn btn-primary">Explore Partnership</a>
            </div>
          </div>
          <div className="partner-hero-panel">
            <div className="metric-card"><strong>Local Network</strong><span>Established presence in Bengaluru and surrounding regions</span></div>
            <div className="metric-card"><strong>Business Model</strong><span>Franchise and channel partnership opportunities</span></div>
            <div className="metric-card"><strong>Operational Support</strong><span>Relevant support for courier and logistics operations</span></div>
          </div>
        </div>
      </section>

      <section className="section why-partner-section">
        <div className="container">
          <div className="section-label">Why partner with us</div>
          <h2>Why Partner With Atlant Global India?</h2>
          <div className="partner-feature-grid">
            <article className="partner-feature-card"><Building2 size={18} /><h3>Established Network</h3><p>Connect with an established courier and logistics network.</p></article>
            <article className="partner-feature-card"><PackageCheck size={18} /><h3>Operational Support</h3><p>Receive relevant support for courier and logistics operations.</p></article>
            <article className="partner-feature-card"><Clock3 size={18} /><h3>Industry Experience</h3><p>Benefit from experience in courier, cargo and logistics operations.</p></article>
            <article className="partner-feature-card"><ArrowUpRight size={18} /><h3>Business Opportunity</h3><p>Build and develop your own courier and logistics business.</p></article>
            <article className="partner-feature-card"><Headset size={18} /><h3>Technology &amp; Operations</h3><p>Use relevant systems and operational processes supporting courier activities.</p></article>
            <article className="partner-feature-card"><Globe2 size={18} /><h3>Growth Potential</h3><p>Develop your business presence in your selected market.</p></article>
          </div>
        </div>
      </section>

      <section className="section section-sm partnership-process">
        <div className="container">
          <div className="section-label">How the partnership works</div>
          <h2>How the Partnership Works</h2>
          <div className="process-grid">
            <div className="process-step"><span>01</span><h3>Submit Your Enquiry</h3><p>Provide your personal, business and location details.</p></div>
            <div className="process-step"><span>02</span><h3>Application Review</h3><p>Our team reviews your information.</p></div>
            <div className="process-step"><span>03</span><h3>Discussion &amp; Evaluation</h3><p>Discuss the proposed business location, infrastructure and operational requirements.</p></div>
            <div className="process-step"><span>04</span><h3>Partnership Onboarding</h3><p>Complete applicable formalities and begin the onboarding process.</p></div>
          </div>
        </div>
      </section>

      <section className="section who-can-partner-section">
        <div className="container">
          <div className="section-label">Who can become a partner</div>
          <h2>Who Can Become a Partner?</h2>
          <div className="partner-audience-grid">
            <span>Entrepreneurs</span>
            <span>Existing business owners</span>
            <span>Retail / business operators</span>
            <span>Logistics professionals</span>
            <span>Individuals interested in courier and logistics</span>
            <span>Businesses looking to expand into logistics</span>
          </div>
        </div>
      </section>

      <section id="partnership-enquiry" className="section partner-enquiry-section">
        <div className="container partner-enquiry-box">
          <div className="partner-enquiry-copy">
            <div className="section-label">Partnership enquiry</div>
            <h2>Start a Strategic Conversation</h2>
            <p>Share your details and our team will review your enquiry for the right partnership opportunity.</p>
            <div className="partner-enquiry-points">
              <div><Check size={16} /><span>Business and location information</span></div>
              <div><Check size={16} /><span>Operational and GST details</span></div>
              <div><Check size={16} /><span>Evaluation for franchise or channel partnership</span></div>
            </div>
          </div>
          {renderStep()}
        </div>
      </section>

      <section className="section section-sm partner-footer-cta">
        <div className="container partner-cross-link">
          <div>
            <div className="section-label">Need shipping or seeking employment?</div>
            <h2>Explore Our Other Solutions</h2>
          </div>
          <div className="hero-actions">
            <Link href="/services#quote" className="btn btn-primary">Get a Shipping Quote</Link>
            <Link href="/careers" className="btn btn-outline">Explore Careers</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutPage() {
  const qualities = [
    ['Experience', 'Established on July 2, 1990 by Mr. Suresh Surendranath.'],
    ['Network', '65 branches serving Bengaluru South and East.'],
    ['Infrastructure', 'Distribution hub at Kudlu Gate, Hosur Road.'],
    ['Fleet', 'Own containerized fleet with GPS tracking.'],
    ['Visibility', 'MIS shipment status updates.'],
    ['Security', 'CCTV at warehouse and branches.'],
  ];
  return (
    <>
      <PageHeading eyebrow="About Atlant Global India" title="Experience that moves business." intro="Atlant Global India (Inc) was established on July 2, 1990 by Mr. Suresh Surendranath and operates under The Professional Couriers." />
      <section className="section section-sm" id="infrastructure">
        <div className="container intro-grid">
          <div className="intro-photo-wrap"><picture className="intro-photo-picture"><source srcSet={`${import.meta.env.BASE_URL}images/Wharehousing.webp`} type="image/webp" /><img className="intro-photo" src={`${import.meta.env.BASE_URL}images/Operation_Hub.png`} alt="Atlant Global India operations hub at Kudlu Gate, Bengaluru" loading="lazy" decoding="async" /></picture></div>
          <div className="intro-copy">
            <div className="section-label">Local operations</div>
            <h2>A Bengaluru base with a wider network.</h2>
            <p>The company serves Bengaluru South and East through a network of 65 branches, with a distribution hub at Kudlu Gate, Hosur Road.</p>
            <p>Its listed services include Domestic, Pro Premium, Priority Class, International and Warehousing for individuals and businesses.</p>
            <div className="fact-row"><div className="fact"><strong>1990</strong><span>Established</span></div><div className="fact"><strong>65</strong><span>Branches</span></div><div className="fact"><strong>5,000+</strong><span>Clients</span></div></div>
            <Link className="btn btn-navy" href="/services">Explore services <ArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="container about-values">
          {qualities.map(([title, text], index) => <article className="about-value" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>
      <section className="section network-band">
        <div className="container network-grid">
          <div className="network-visual"><img className="network-map-image" src={`${import.meta.env.BASE_URL}images/BangloreSouth%20East.png`} alt="Map highlighting Bengaluru South and Bengaluru East" loading="lazy" decoding="async" /></div>
          <div><div className="section-label">Network</div><h2>Rooted in Bengaluru.<br />Connected beyond it.</h2><p className="section-lead">Through The Professional Couriers network, Atlant Global India supports domestic and international courier and cargo requirements. Its local service area is Bengaluru South and East.</p><Link className="btn btn-navy" href="/contact">Contact the company <ArrowRight size={14} /></Link></div>
        </div>
      </section>
      <section className="section section-sm" id="leadership">
        <div className="container">
          <div className="section-label">Leadership</div><h2>Led with experience.</h2>
          <div className="leadership">
            <img className="portrait-image" src={`${import.meta.env.BASE_URL}images/CEO-compressed-1-e1562394173820-180x220.jpg`} alt="Mr. Suresh Surendranath Nair, Chief Executive Officer" loading="lazy" decoding="async" />
            <div>
              <h3>Mr. Suresh Surendranath Nair</h3>
              <div className="role">Chief Executive Officer</div>
              <p>Mr. Suresh Surendranath founded Atlant Global India in 1990 and continues to lead the company with a long-standing commitment to customer trust, service quality, and reliable logistics operations.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type ShippingMethod = 'surface' | 'air';

interface ShippingMethodConfig {
  id: ShippingMethod;
  name: string;
  subtitle: string;
  divisor: number;
  formula: string;
}

const SHIPPING_METHODS: Record<ShippingMethod, ShippingMethodConfig> = {
  surface: {
    id: 'surface',
    name: 'Surface Cargo (Road / Sea)',
    subtitle: 'Divisor: 5,000',
    divisor: 5000,
    formula: 'Length (cm) x Width (cm) x Height (cm) / 5000',
  },
  air: {
    id: 'air',
    name: 'Air Cargo',
    subtitle: 'Divisor: 6,000',
    divisor: 6000,
    formula: 'Length (cm) × Width (cm) × Height (cm) ÷ 6000',
  },
};

export function VolumetricCalculator() {
  const [method, setMethod] = useState<ShippingMethod>('surface');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ length?: boolean; width?: boolean; height?: boolean }>({});

  const activeConfig = SHIPPING_METHODS[method];

  const validateAndCalculate = (
    selectedMethod: ShippingMethod,
    lStr: string,
    wStr: string,
    hStr: string,
  ): boolean => {
    const lTrim = lStr.trim();
    const wTrim = wStr.trim();
    const hTrim = hStr.trim();

    if (!lTrim || !wTrim || !hTrim) {
      setValidationError(null);
      setFieldErrors({});
      setCalculatedResult(null);
      return false;
    }

    const lNum = Number(lTrim);
    const wNum = Number(wTrim);
    const hNum = Number(hTrim);

    const errors: { length?: boolean; width?: boolean; height?: boolean } = {};
    if (!Number.isFinite(lNum) || lNum <= 0) errors.length = true;
    if (!Number.isFinite(wNum) || wNum <= 0) errors.width = true;
    if (!Number.isFinite(hNum) || hNum <= 0) errors.height = true;

    if (errors.length || errors.width || errors.height) {
      setValidationError('Dimensions must be valid positive numbers greater than 0.');
      setFieldErrors(errors);
      setCalculatedResult(null);
      return false;
    }

    setFieldErrors({});
    setValidationError(null);
    const divisor = SHIPPING_METHODS[selectedMethod].divisor;
    const volumetricWeight = (lNum * wNum * hNum) / divisor;
    setCalculatedResult(volumetricWeight);
    return true;
  };

  const handleMethodChange = (newMethod: ShippingMethod) => {
    setMethod(newMethod);
    validateAndCalculate(newMethod, length, width, height);
  };

  const handleInputChange = (field: 'length' | 'width' | 'height', value: string) => {
    const nextLength = field === 'length' ? value : length;
    const nextWidth = field === 'width' ? value : width;
    const nextHeight = field === 'height' ? value : height;
    setLength(nextLength);
    setWidth(nextWidth);
    setHeight(nextHeight);
    validateAndCalculate(method, nextLength, nextWidth, nextHeight);
  };

  const handleReset = () => {
    setMethod('surface');
    setLength('');
    setWidth('');
    setHeight('');
    setCalculatedResult(null);
    setValidationError(null);
    setFieldErrors({});
  };

  return (
    <div className="calculator" aria-labelledby="calc-heading">
      <div className="section-label">Shipping reference</div>
      <h3 id="calc-heading">Volumetric weight calculator</h3>
      <p className="calc-intro">
        Estimate volumetric weight for road/sea or air consignments. The chargeable weight will be the greater of actual gross weight and volumetric weight.
      </p>

      {/* Shipping Method Selector */}
      <div className="calc-mode-selector">
        <label className="calc-section-title">Shipping Method</label>
        <div className="calc-mode-group" role="radiogroup" aria-label="Shipping Method">
          <button
            type="button"
            role="radio"
            aria-checked={method === 'surface'}
            className={`calc-mode-btn ${method === 'surface' ? 'active' : ''}`}
            onClick={() => handleMethodChange('surface')}
            data-testid="calc-mode-surface"
          >
            <span className="calc-mode-icon" aria-hidden="true">
              <Truck size={18} />
            </span>
            <span className="calc-mode-content">
              <strong>Surface Cargo (Road / Sea)</strong>
              <small>Divisor: 5,000</small>
            </span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={method === 'air'}
            className={`calc-mode-btn ${method === 'air' ? 'active' : ''}`}
            onClick={() => handleMethodChange('air')}
            data-testid="calc-mode-air"
          >
            <span className="calc-mode-icon" aria-hidden="true">
              <Plane size={18} />
            </span>
            <span className="calc-mode-content">
              <strong>Air Cargo</strong>
              <small>Divisor: 6,000</small>
            </span>
          </button>
        </div>
      </div>

      {/* Input Dimensions */}
      <div>
        <div className="calc-row">
          <div className="calc-input-wrap">
            <label htmlFor="calc-length">Length (cm) *</label>
            <input
              className={`calc-input ${fieldErrors.length ? 'input-error' : ''}`}
              id="calc-length"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 100"
              value={length}
              onChange={(e) => handleInputChange('length', e.target.value)}
              aria-invalid={fieldErrors.length ? 'true' : 'false'}
              data-testid="input-calc-length"
            />
          </div>
          <div className="calc-input-wrap">
            <label htmlFor="calc-width">Width (cm) *</label>
            <input
              className={`calc-input ${fieldErrors.width ? 'input-error' : ''}`}
              id="calc-width"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 50"
              value={width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              aria-invalid={fieldErrors.width ? 'true' : 'false'}
              data-testid="input-calc-width"
            />
          </div>
          <div className="calc-input-wrap">
            <label htmlFor="calc-height">Height (cm) *</label>
            <input
              className={`calc-input ${fieldErrors.height ? 'input-error' : ''}`}
              id="calc-height"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 40"
              value={height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              aria-invalid={fieldErrors.height ? 'true' : 'false'}
              data-testid="input-calc-height"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="calc-actions">
          <button
            type="button"
            className="btn btn-outline calc-btn-reset"
            onClick={handleReset}
            data-testid="btn-calc-reset"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Friendly Validation Error Message */}
      {validationError && (
        <div className="calc-error-banner" role="alert" data-testid="calc-error-message">
          <Circle size={16} aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Result Display */}
      <div className="calc-result-panel" data-testid="calc-result-panel">
        <div className="calc-result-top">
          <div className="calc-result-label">
            <span>Volumetric Weight</span>
            <small className="calc-result-subtext">
              {activeConfig.name} · Divisor: {activeConfig.divisor.toLocaleString()}
            </small>
          </div>
          <div className="calc-result-value">
            <strong>{calculatedResult !== null ? `${calculatedResult.toFixed(2)} kg` : '—'}</strong>
          </div>
        </div>

        <div className="calc-formula-display">
          <span className="calc-formula-tag">Active Formula</span>
          <code>
            {calculatedResult !== null && length && width && height
              ? `${Number(length)} × ${Number(width)} × ${Number(height)} ÷ ${activeConfig.divisor} = ${calculatedResult.toFixed(2)} kg`
              : `${activeConfig.formula} = Volumetric Weight (kg)`}
          </code>
        </div>

        <div className="calc-notes">
          <p>
            <strong>Commercial Freight Rule:</strong> Courier and cargo carriers apply charges on the basis of chargeable weight, which is whichever is higher between actual gross weight and volumetric weight.
          </p>
        </div>

        <div className="calc-footer-cta">
          <Link className="btn btn-primary btn-sm" href="/services#quote">
            Request a Quote for this Consignment <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResourcesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  return (
    <>
      <PageHeading eyebrow="Resources" title="Helpful answers for shipping." intro="Find practical information about the local network and services, plus a volumetric weight estimate. Confirm applicable service terms with Atlant Global India." />
      <section className="section section-sm">
        <div className="container resource-grid">
          <div>
            <div className="section-label">Frequently asked</div><h2>Clear answers.</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => <div className="faq-item" key={faq.q}>
                <button className="faq-question" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? null : index)} data-testid={`button-faq-${index}`}>{faq.q}<ChevronDown size={16} /></button>
                {activeFaq === index && <div className="faq-answer">{faq.a}</div>}
              </div>)}
            </div>
            <a className="faq-link" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Shipping question')}`}>Ask Atlant Global India <ArrowRight size={13} /></a>
          </div>
          <VolumetricCalculator />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-label">Shipping notes</div><h2>Plan the next conversation.</h2>
          <div className="resources-cards">
            <article className="resource-card"><span className="resource-cat">Shipping basics</span><h3>Preparing a consignment</h3><p>Confirm packaging, service availability and shipment details with a nearby branch.</p><a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Packaging and shipment preparation question')}`}>Ask the team <ArrowRight size={12} /></a></article>
            <article className="resource-card"><span className="resource-cat">Business shipping</span><h3>Planning recurring shipments</h3><p>Share locations, shipment type and expected frequency in a business enquiry.</p><Link href="/business">Start a business enquiry <ArrowRight size={12} /></Link></article>
            <article className="resource-card"><span className="resource-cat">Shipment visibility</span><h3>Need a consignment update?</h3><p>Use the tracking page to review the latest status and contact Atlant Global India if you need further assistance.</p><Link href="/tracking">Go to tracking <ArrowRight size={12} /></Link></article>
          </div>
        </div>
      </section>
    </>
  );
}

type BranchRecord = {
  code: string;
  area: string;
  franchisee: string;
  landline: string | null;
  mobile: string | null;
  address: string;
  map_link: string | null;
};

const offices: BranchRecord[] = officesData;

const mainOffices = [
  {
    name: 'Corporate Office',
    address: '#136, 7th Cross, 29th Main Road, Lake Road, BTM 2nd Stage, Bengaluru, Karnataka 560076',
    pincode: '560076',
    map: 'https://maps.app.goo.gl/PrDEJi5HG4fnZYEo6',
  },
  {
    name: 'Operations Office · Kudlu Gate',
    address: 'VJPQ+H74, 51/2, Chikka Begur Gate, Lakshmi Layout Main Rd, Hosur, Bengaluru, Karnataka 560068',
    pincode: '560068',
    map: 'https://maps.app.goo.gl/bXvW6bkRdBFCmKDL9',
  },
];

const normalizeOfficeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function ContactPage() {
  const [query, setQuery] = useState('');
  const [isBranchListOpen, setIsBranchListOpen] = useState(false);
  const branchSearchRef = useRef<HTMLDivElement>(null);
  const branchToggleRef = useRef<HTMLButtonElement>(null);
  const queryTerms = normalizeOfficeSearchText(query).split(/\s+/).filter(Boolean);
  const filteredOffices = offices.filter((office) => {
    const searchableValues = [
      office.code,
      office.area,
      office.franchisee,
      office.landline ?? '',
      office.mobile ?? '',
      office.address,
    ];
    const searchableText = normalizeOfficeSearchText(searchableValues.join(' '));
    const searchableDigits = searchableValues.map((value) => value.replace(/\D/g, '')).join(' ');
    return queryTerms.every((term) => (
      searchableText.includes(term) || (/^\d+$/.test(term) && searchableDigits.includes(term))
    ));
  });

  useEffect(() => {
    if (!isBranchListOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !branchSearchRef.current?.contains(event.target)) {
        setIsBranchListOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBranchListOpen(false);
        branchToggleRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBranchListOpen]);

  return (
    <>
      <PageHeading eyebrow="Contact & branches" title="Here when you need us." intro="Get in touch with Atlant Global India in Bengaluru. The company serves Bengaluru South and East through 65 branches; the verified office details below are searchable." />
      <section className="section section-sm">
        <div className="container">
          <div className="branch-search-heading">
            <div className="section-label">Find a listed office</div>
            <h2>Search by area or PIN code.</h2>
          </div>
          <div className="primary-office-grid">
            {mainOffices.map((office) => <article className="contact-card" key={office.name}>
              <h3>{office.name}</h3>
              <p><MapPin size={14} /> {office.address}</p>
              <p><MapPin size={14} /> PIN code: {office.pincode}</p>
              <p><Phone size={14} /> <a href={`tel:${PHONE}`}>+91 7411 708 958</a></p>
              <p><Clock3 size={14} /> Monday–Saturday, 10am–6pm</p>
              <div className="contact-links">
                <a href={office.map} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={12} /></a>
                <a href={`tel:${PHONE}`}>Call +91 7411 708 958</a>
              </div>
            </article>)}
          </div>
          <div className="branch-search" ref={branchSearchRef}>
            <label className="sr-only" htmlFor="branch-search">Search office by area or PIN code</label>
            <input
              id="branch-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.trim()) setIsBranchListOpen(true);
              }}
              placeholder="Search office by area or PIN code"
              data-testid="input-branch-search"
            />
            <button
              ref={branchToggleRef}
              className="btn btn-outline branch-dropdown-trigger"
              type="button"
              aria-expanded={isBranchListOpen}
              aria-controls="branch-directory-panel"
              onClick={() => setIsBranchListOpen((open) => !open)}
            >
              View Branches <ChevronDown size={16} aria-hidden="true" />
            </button>
            <div
              id="branch-directory-panel"
              className={`branch-dropdown-panel${isBranchListOpen ? ' is-open' : ''}`}
              role="region"
              aria-label="Branch locations"
              aria-hidden={!isBranchListOpen}
              inert={!isBranchListOpen}
            >
              {filteredOffices.length > 0 ? (
                <div className="contact-grid">
                  {filteredOffices.map((office) => <article className="contact-card" key={`${office.address}-${office.mobile ?? 'team'}`}>
                    <h3>Branch Code: {office.code}</h3>
                    <div className="branch-result-details">
                      <p><strong>Area:</strong><span>{office.area}</span></p>
                      <p><strong>Franchisee:</strong><span>{office.franchisee}</span></p>
                      <p><strong>Address:</strong><span>{office.address}</span></p>
                      {office.landline && <p><strong>Landline:</strong><span><a href={`tel:${office.landline}`}>{office.landline}</a></span></p>}
                      {office.mobile && <p><strong>Mobile:</strong><span><a href={`tel:${office.mobile}`}>{office.mobile}</a></span></p>}
                    </div>
                    {office.map_link && <div className="contact-links">
                      <a href={office.map_link} target="_blank" rel="noreferrer">Get Directions <ArrowUpRight size={12} /></a>
                    </div>}
                  </article>)}
                </div>
              ) : (
                <div className="branch-result" role="status">No branches found. Please try another search.</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section network-band">
        <div className="container contact-bottom-grid">
          <div><div className="section-label">Get in touch</div><h2>Speak with the team.</h2><div className="contact-methods"><p><Phone size={15} /><a href={`tel:${PHONE}`}>+91 7411 708 958</a></p><p><Headset size={15} /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p><p><Clock3 size={15} />Monday–Saturday, 10am–6pm</p></div></div>
          <div className="contact-note"><h3>Pickup through nearby branches</h3><p>Pickup is available through nearby branches. Contact Atlant Global India to confirm options for your area.</p><Link className="btn btn-primary" href="/services">View services <ArrowRight size={14} /></Link></div>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <section className="page-heading section site-error-page">
      <div className="container not-found">
        <div className="section-label">404 · Page not found</div>
        <h1>Oops! The page you're looking for could not be found.</h1>
        <p>The link may be out of date, or the page may have moved.</p>
        <div className="site-error-actions">
          <Link className="btn btn-primary" href="/">Go to Homepage <ArrowRight size={14} /></Link>
          <button className="btn btn-outline" type="button" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    </section>
  );
}
