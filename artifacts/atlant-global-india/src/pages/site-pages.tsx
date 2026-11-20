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
export { CareersPage } from "./careers-page";

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
    q: 'How can I schedule a pickup for heavy or bulk shipments?',
    a: 'For heavy, large or bulk consignments, contact your nearest branch to confirm pickup arrangements, service availability and applicable charges.',
  },
  {
    q: 'Can the pickup agent refuse to collect my shipment?',
    a: 'Yes. The pickup agent may refuse a shipment if it contains prohibited or restricted items or does not meet applicable shipping requirements.',
  },
  {
    q: 'Can I change my pickup address?',
    a: 'To change your pickup address, cancel the existing pickup request and place a new request with the updated address.',
  },
  {
    q: 'How should I pack my shipment?',
    a: 'Customers are responsible for packing their shipments, as packing services are not provided. Fragile items must be packed securely to reduce the risk of damage during transit.',
  },
  {
    q: 'What should I do if my shipment is damaged or items are missing?',
    a: 'Please report any damage or shortage to the booking branch within 24 hours of delivery. The branch will guide you through the next steps as per the applicable process.',
  },
  {
    q: 'Why might my shipment not be delivered?',
    a: (
      <>
        <p>A shipment may not be delivered for reasons such as:</p>
        <ul>
          <li>Incorrect or incomplete delivery address</li>
          <li>Incorrect contact number</li>
          <li>The recipient refusing to accept the shipment</li>
        </ul>
      </>
    ),
  },
  {
    q: 'Will I receive delivery updates?',
    a: (
      <p>
        For Pro Premium bookings, delivery updates are provided through SMS, subject to the service terms.
        For regular bookings, check your shipment status through our{' '}
        <Link href="/tracking">Shipment Tracking Portal</Link>.
      </p>
    ),
  },
  {
    q: 'Which items cannot be shipped?',
    a: (
      <>
        <p>Items prohibited by law or restricted by applicable courier, airline or transport regulations cannot be accepted. These may include:</p>
        <ul>
          <li>Currency and bearer negotiable instruments</li>
          <li>Precious stones, jewellery and similar valuables, where restricted</li>
          <li>Explosives, firearms and ammunition</li>
          <li>Flammable, toxic, infectious or corrosive substances</li>
          <li>Radioactive materials and certain magnetic materials</li>
          <li>Illegal drugs and prohibited substances</li>
          <li>Pornographic material prohibited by law</li>
          <li>Certain chemicals, powders, gases and dangerous goods</li>
          <li>Machinery or equipment containing oil, fuel, grease or batteries, where restricted</li>
          <li>Items prohibited under applicable Indian law or airline regulations</li>
        </ul>
        <p>Please contact your nearest branch before booking any item that may be restricted. Acceptance depends on the item, destination and applicable shipping regulations.</p>
      </>
    ),
  },
  {
    q: 'Can I send a TV, painting or other fragile item?',
    a: 'Certain fragile items may be accepted if they meet the applicable packaging requirements. Suitable transit insurance may also be required. Contact your nearest branch before booking to confirm acceptance, packaging and insurance requirements.',
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
            <h1>Courier and cargo<br />that move you forward.</h1>
            <p>From Bengaluru South and East to destinations across India and beyond, find courier, cargo and warehousing services for personal and business shipments.</p>
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
          <div className="quick-card"><PackageCheck className="quick-icon" size={21} /><strong>Track a shipment</strong><p>Check the latest status using your consignment number.</p><Link href="/tracking">Track a shipment <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><FileText className="quick-icon" size={21} /><strong>Get a quote</strong><p>Share your route and shipment details with our team.</p><Link href="/services#quote">Request a quote <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Truck className="quick-icon" size={21} /><strong>Arrange a pickup</strong><p>Ask a nearby branch about pickup options in your area.</p><Link href="/contact">Find contact details <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Building2 className="quick-icon" size={21} /><strong>Business shipping</strong><p>Discuss recurring, bulk or time-sensitive shipments.</p><Link href="/business">Explore business options <ArrowRight size={12} /></Link></div>
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
            <p>Established on July 2, 1990, Atlant Global India (Inc) operates under The Professional Couriers and serves Bengaluru South and East.</p>
            <p>Its Bengaluru network and Kudlu Gate operations hub support courier, cargo and warehousing requirements, with wider domestic and international connectivity.</p>
            <div className="fact-row"><div className="fact"><strong>1990</strong><span>Established</span></div><div className="fact"><strong>65</strong><span>Branches</span></div><div className="fact"><strong>5,000+</strong><span>Clients</span></div></div>
            <Link className="btn btn-navy" href="/about">Discover the company <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
      <section className="section section-sm">
        <div className="container">
          <div className="section-label">Service range</div><h2>Services for the way you ship.</h2>
          <p className="section-lead">Explore domestic courier and cargo, time-sensitive options, international services and warehousing.</p>
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
          <div><div className="section-label">Here to help</div><h2>Let’s find the right next step.</h2></div>
          <div className="hero-actions"><Link className="btn btn-primary" href="/services#quote">Tell us about your shipment <ArrowRight size={14} /></Link><Link className="btn btn-outline" href="/contact">Contact the team</Link></div>
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
      <PageHeading eyebrow="Our services" title="Courier, cargo & warehousing." intro="Compare services for personal and business shipments. Contact our team to confirm availability, rates and delivery options for your route." />
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
            <h2>Tell us what you need to ship.</h2>
            <p>Share your pickup and delivery locations, shipment type and any timing or handling requirements. Our team can discuss applicable services and rates with you.</p>
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
      <PageHeading eyebrow="Get a quote" title="Request a shipping quote." intro="Share your pickup and delivery locations, shipment type and any available specifications. Our team will review your enquiry and discuss suitable service options." />
      <section className="section section-sm quote-section">
        <div className="container quote-grid">
          <div className="quote-aside">
            <div className="section-label">Quick turnaround</div>
            <h2>Start with your shipment details.</h2>
            <p>We serve Bengaluru South and East, with domestic and international connectivity through The Professional Couriers network. Share your route and requirements so the team can guide you.</p>
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
            <p>Enter the number from your booking receipt to view the latest available shipment updates.</p>
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

export function OpportunitiesPage() {
  return (
    <>
      <PageHeading
        eyebrow="Opportunities"
        title="Opportunities at Atlant Global India"
        intro="Choose the path that fits your next move: explore current roles or enquire about a courier and logistics partnership."
      />

      <section className="section section-sm opportunities-page">
        <div className="container opportunities-grid">
          <Link href="/careers" className="opportunity-card opportunity-card-career">
            <div className="opportunity-card-inner">
              <span className="opportunity-tag">Career Opportunities</span>
              <h2>Find your next role.</h2>
              <p>Browse current openings, filter by role and location, and apply for a position that matches your experience.</p>
              <div className="opportunity-cta-row">
                <span>Explore Careers</span>
                <ArrowRight size={15} />
              </div>
              <div className="opportunity-meta-row">
                <span>Jobs</span>
                <span>Career opportunities</span>
                <span>Current openings</span>
              </div>
            </div>
          </Link>

          <Link href="/business" className="opportunity-card opportunity-card-business">
            <div className="opportunity-card-inner">
              <span className="opportunity-tag">Business Opportunities</span>
              <h2>Explore a business partnership.</h2>
              <p>Share your business background and proposed location to enquire about franchise and channel partner opportunities.</p>
              <div className="opportunity-cta-row">
                <span>Become a Business Partner</span>
                <ArrowRight size={15} />
              </div>
              <div className="opportunity-meta-row">
                <span>Franchise</span>
                <span>Channel Partner</span>
                <span>Partnership enquiry</span>
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
        title="Explore a courier and logistics partnership"
        intro="Tell us about your business, experience and proposed operating location to enquire about franchise or channel partner opportunities."
      />

      <section className="section section-sm business-partner-hero">
        <div className="container partner-hero-grid">
          <div className="partner-hero-copy">
            <div className="section-label">Business opportunity</div>
            <h2>Build your local logistics business.</h2>
            <p>Considering a franchise or channel partnership? Share your business background and proposed location so our team can review your enquiry.</p>
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
          <h2>What to expect from a partnership enquiry</h2>
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
          <h2>From enquiry to evaluation</h2>
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
          <h2>Who can enquire?</h2>
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
            <h2>Start a partnership enquiry</h2>
            <p>Share your details and our team will review your enquiry and follow up about the next steps.</p>
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
  return (
    <>
      <section className="page-heading section">
        <div className="container">
          <div className="section-label">Our Company</div>
          <h1>Your Trusted Partner for Courier and Cargo Services</h1>
        </div>
      </section>
      <section className="section section-sm" id="infrastructure">
        <div className="container intro-grid">
          <div className="intro-photo-wrap"><picture className="intro-photo-picture"><source srcSet={`${import.meta.env.BASE_URL}images/Wharehousing.webp`} type="image/webp" /><img className="intro-photo" src={`${import.meta.env.BASE_URL}images/Operation_Hub.png`} alt="Atlant Global India operations hub at Kudlu Gate, Bengaluru" loading="lazy" decoding="async" /></picture></div>
          <div className="intro-copy">
            <p>Established on 2 July 1990 by Mr. Suresh Surendranath Nair, Atlant Global India Inc. provides domestic and international courier and cargo solutions under The Professional Couriers brand.</p>
            <p>We serve Bangalore South and East through a network of 65 branches across key locations. With a focus on reliable service, efficient operations and customer satisfaction, we help businesses manage their shipping and logistics requirements.</p>
            <p>Our distribution hub at Kudlu Gate, Hosur Road, Bangalore, handles approximately 1.5 lakh documents and 650 tonnes of non-document shipments per month. Our fleet of GPS-tracked, containerized vehicles supports shipment movement between distribution hubs across South India.</p>
            <p>Serving more than 5,000 customers, we continue to strengthen our infrastructure, improve connectivity and expand our operational capabilities to meet changing customer needs.</p>
          </div>
        </div>
      </section>
      <section className="section section-sm" id="leadership">
        <div className="container">
          <h2>Meet Our CEO</h2>
          <div className="leadership">
            <img className="portrait-image" src={`${import.meta.env.BASE_URL}images/CEO-compressed-1-e1562394173820-180x220.jpg`} alt="Mr. Suresh Surendranath Nair, Chief Executive Officer" loading="lazy" decoding="async" />
            <div>
              <h3>Suresh Surendranath Nair</h3>
              <div className="role">CEO</div>
              <p>“With over three decades of experience in the courier and cargo industry, Atlant Global India Inc. continues to adapt to changing business needs and industry developments. By modernizing our infrastructure and improving our operational capabilities, we remain committed to providing reliable services and meeting our customers’ evolving expectations.”</p>
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
      <PageHeading eyebrow="Resources" title="Helpful answers for shipping." intro="Browse answers to common questions, practical shipment notes and a volumetric weight estimate. Contact the team to confirm service availability and applicable terms." />
      <section className="section section-sm">
        <div className="container resource-grid">
          <div>
            <div className="section-label">Frequently asked questions</div><h2>Plan with confidence.</h2>
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
          <div className="section-label">Shipping notes</div><h2>Know what to ask before you ship.</h2>
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
      <PageHeading eyebrow="Contact & branches" title="Find an office or get in touch." intro="Contact Atlant Global India for service and pickup enquiries in Bengaluru South and East. Search the listed offices by area or PIN code, or reach the team by phone or email." />
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
