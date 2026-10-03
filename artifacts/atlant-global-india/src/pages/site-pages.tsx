import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Headset,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
  Warehouse,
} from 'lucide-react';

const OFFICIAL_TRACKING = 'https://www.tpcindia.com/multiple-tracking.aspx';
const EMAIL = 'connect@atlantglobalindia.com';
const PHONE = '+917411708958';
const STOCK_NOTE = 'Representative stock photography via Pexels; not Atlant Global India-owned imagery.';

const services = [
  {
    title: 'Domestic',
    text: 'Courier and cargo services for shipments moving across India.',
    image: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1000',
    alt: 'Warehouse team handling cartons in a logistics facility',
    icon: PackageCheck,
    features: ['Courier', 'Cargo', 'Domestic destinations'],
  },
  {
    title: 'Pro Premium',
    text: 'A time-sensitive service option for important documents and consignments.',
    image: 'https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=1000',
    alt: 'Courier professional preparing a parcel',
    icon: FileText,
    features: ['AM–PM delivery', 'Visa applications', 'Legal and important documents'],
  },
  {
    title: 'Priority Class',
    text: 'Express courier and cargo services for business requirements.',
    image: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1000',
    alt: 'Parcels being sorted for onward shipment',
    icon: Truck,
    features: ['Business shipments', 'Express delivery', 'Cargo'],
  },
  {
    title: 'International',
    text: 'International courier and cargo connectivity through The Professional Couriers network and applicable partners.',
    image: 'https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1000',
    alt: 'Freight containers at a commercial port',
    icon: Globe2,
    features: ['Courier', 'Cargo', 'International destinations'],
  },
  {
    title: 'Warehousing',
    text: 'Storage, handling and distribution support at the Kudlu Gate facility.',
    image: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=1000',
    alt: 'Warehouse aisle with stored goods and logistics equipment',
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
    a: 'Use The Professional Couriers official tracking service. This website does not display shipment status or create tracking updates.',
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
  const [submitted, setSubmitted] = useState(false);
  const submitQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Shipping enquiry — ${data.get('name')}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.get('name')}`,
        `Company: ${data.get('company') || 'Not provided'}`,
        `Mobile: ${data.get('mobile')}`,
        `Email: ${data.get('email')}`,
        `Pickup: ${data.get('pickup')}`,
        `Delivery: ${data.get('delivery')}`,
        `Shipment type: ${data.get('type')}`,
        `Weight: ${data.get('weight') || 'Not provided'}`,
        `Dimensions: ${data.get('dimensions') || 'Not provided'}`,
        `Monthly volume: ${data.get('volume') || 'Not provided'}`,
        `Requirement: ${data.get('requirement') || 'Not provided'}`,
      ].join('\n'),
    );
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
      <button className="btn btn-primary" type="submit" data-testid="button-request-quote">Request a quote <ArrowRight size={14} /></button>
      <p className="form-disclaimer">
        No backend is connected. This form opens your default email app with the
        details you entered addressed to {EMAIL}. Review and send the email to
        submit your enquiry.
      </p>
      {submitted && (
        <div className="success-message" role="status">
          Your email app should open with your enquiry. If it did not, email{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> directly.
        </div>
      )}
    </form>
  );
}

export function HomePage() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src="https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=2000"
          alt="Courier professional handling a parcel in a logistics workspace"
        />
        <div className="hero-content">
          <div className="eyebrow">Local knowledge. Wider reach.</div>
          <h1>Move more.<br />Deliver further.</h1>
          <p>Your one-stop solution for courier and cargo requirements. Reliable logistics for people and businesses in Bengaluru and destinations across India and beyond.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/business">Get a quote <ArrowRight size={15} /></Link>
            <Link className="btn btn-outline" href="/tracking">Track shipment <ArrowUpRight size={15} /></Link>
            <Link className="btn btn-outline" href="/services">Explore services</Link>
          </div>
          <div className="hero-note">Established 2 July 1990 · Operating under The Professional Couriers</div>
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
      <section className="actions-band" aria-label="Quick actions">
        <div className="container quick-grid">
          <div className="quick-card"><PackageCheck className="quick-icon" size={21} /><strong>Track a shipment</strong><p>Continue to the official tracking service.</p><Link href="/tracking">Track now <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><FileText className="quick-icon" size={21} /><strong>Get a quote</strong><p>Tell us about your courier or cargo requirement.</p><Link href="/business">Start an enquiry <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Truck className="quick-icon" size={21} /><strong>Arrange a pickup</strong><p>Pickup is available through nearby branches.</p><Link href="/contact">Contact a branch <ArrowRight size={12} /></Link></div>
          <div className="quick-card"><Building2 className="quick-icon" size={21} /><strong>Business solutions</strong><p>Discuss regular, bulk or time-sensitive shipping.</p><Link href="/business">Explore options <ArrowRight size={12} /></Link></div>
        </div>
      </section>
      <section className="section">
        <div className="container intro-grid">
          <div className="intro-photo-wrap">
            <img className="intro-photo" src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Warehouse aisle with goods and logistics equipment" loading="lazy" />
            <div className="photo-caption">Bengaluru operations, connected to a wider network.</div>
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
          <div className="hero-actions"><Link className="btn btn-primary" href="/business">Request a quote <ArrowRight size={14} /></Link><Link className="btn btn-outline" href="/contact">Contact our team</Link></div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const Icon = service.icon;
  return (
    <article className="service-card">
      <img className="service-photo" src={service.image} alt={service.alt} loading="lazy" />
      <div className="service-body">
        <h3><Icon size={17} aria-hidden="true" /> {service.title}</h3>
        <p>{service.text}</p>
        <p className="service-features">{service.features.join(' · ')}</p>
        <Link href="/business">Enquire about this service <ArrowRight size={13} /></Link>
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
          <p className="service-notice">{STOCK_NOTE}</p>
        </div>
      </section>
      <section className="section dark-section">
        <div className="container service-support">
          <div><div className="section-label">Need help choosing?</div><h2>Tell us where it’s going.</h2><p className="section-lead">Share your pickup, delivery and shipment details. The team can help you discuss the available service options.</p></div>
          <div className="service-callout"><Check size={20} /><p>Pickup is available through nearby branches. Atlant Global India serves Bengaluru South and East.</p><Link className="btn btn-outline" href="/contact">Find contact details <ArrowRight size={14} /></Link></div>
          <div className="service-callout"><PackageCheck size={20} /><p>For a consignment already in transit, use The Professional Couriers official tracking page.</p><Link className="btn btn-outline" href="/tracking">Track a shipment <ArrowRight size={14} /></Link></div>
        </div>
      </section>
    </>
  );
}

export function TrackingPage() {
  const [consignment, setConsignment] = useState('');
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consignment.trim()) {
      setMessage('Enter your CNOTE / AWB number to continue.');
      return;
    }
    setMessage('The official tracking page is open in a new tab. Keep your CNOTE / AWB number ready to enter there.');
    window.open(OFFICIAL_TRACKING, '_blank', 'noopener,noreferrer');
  };
  return (
    <>
      <PageHeading eyebrow="Shipment visibility" title="Track your shipment." intro="Atlant Global India tracking redirects to The Professional Couriers. Continue to its official multiple-consignment tracking page; no shipment status is simulated here." />
      <section className="section section-sm">
        <div className="container">
          <div className="tracking-panel">
            <div className="tracking-left">
              <div className="section-label">CNOTE / AWB lookup</div>
              <h2>Continue to official tracking.</h2>
              <p className="section-lead">Have your consignment number ready for The Professional Couriers tracking service.</p>
              <form className="track-form" onSubmit={submit}>
                <label className="sr-only" htmlFor="track-number">CNOTE / AWB number</label>
                <input id="track-number" value={consignment} onChange={(event) => setConsignment(event.target.value)} placeholder="Enter CNOTE / AWB number" data-testid="input-tracking-number" />
                <button className="btn btn-primary" type="submit" data-testid="button-track">Open tracker <ArrowRight size={14} /></button>
              </form>
              {message && <div className="success-message" role="status">{message}</div>}
              <p className="track-note">This site does not access shipment data or report booked, picked up, in-transit or delivered statuses. Tracking is handled by the official service.</p>
              <a className="btn btn-outline" href={OFFICIAL_TRACKING} target="_blank" rel="noreferrer">Go to TPC tracking page <ArrowUpRight size={14} /></a>
            </div>
            <aside className="track-side"><PackageCheck size={26} color="#bd573c" /><h3>Updates through MIS</h3><p>Atlant Global India states that shipment status updates are supported through its MIS. For an update or assistance, contact the team.</p><Link href="/contact">Contact Atlant Global India <ArrowRight size={13} /></Link></aside>
          </div>
        </div>
      </section>
    </>
  );
}

export function BusinessPage() {
  return (
    <>
      <PageHeading eyebrow="Business shipping" title="Logistics for business." intro="Discuss regular, bulk and time-sensitive courier or cargo requirements with Atlant Global India. Share the shipment pattern and destinations relevant to your business." />
      <section className="section section-sm">
        <div className="container business-layout">
          <div>
            <div className="section-label">Operational capabilities</div>
            <h2>Support for the movement behind your work.</h2>
            <p className="section-lead">Atlant Global India serves Bengaluru South and East through 65 branches, with a Kudlu Gate distribution hub and a wider network through The Professional Couriers.</p>
            <div className="business-tags"><span>Corporate courier</span><span>B2B shipments</span><span>Bulk consignments</span><span>Priority shipments</span><span>International</span><span>Warehousing</span></div>
            <div className="capability-list">
              <div className="capability"><Check size={17} /><div><strong>MIS updates</strong><span>Shipment status updates through the company's MIS.</span></div></div>
              <div className="capability"><Check size={17} /><div><strong>GPS-tracked fleet</strong><span>Own containerized fleet with GPS tracking.</span></div></div>
              <div className="capability"><Check size={17} /><div><strong>Operational security</strong><span>CCTV at warehouse and branches.</span></div></div>
              <div className="capability"><Check size={17} /><div><strong>Talk through your needs</strong><span>Share your shipping pattern in an enquiry.</span></div></div>
            </div>
          </div>
          <div className="business-image-wrap">
            <img className="business-image" src="https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Courier worker preparing a parcel for dispatch" loading="lazy" />
            <p className="photo-disclaimer">{STOCK_NOTE}</p>
          </div>
        </div>
      </section>
      <section className="section quote-section" id="business-enquiry">
        <div className="container quote-grid">
          <div className="quote-aside">
            <div className="section-label">Business enquiry</div>
            <h2>Tell us what you need to move.</h2>
            <p>This form prepares an email enquiry on your device. There is no backend submission.</p>
            <p><strong>Prefer to speak?</strong><br /><a href={`tel:${PHONE}`}>+91 7411 708 958</a><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <p>Monday–Saturday, 10am–6pm</p>
          </div>
          <QuoteForm />
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
      <section className="section section-sm">
        <div className="container intro-grid">
          <div className="intro-photo-wrap"><img className="intro-photo" src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Warehouse aisle with goods and logistics equipment" loading="lazy" /><div className="photo-caption">Representative logistics stock imagery.</div></div>
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
          <div className="network-visual" aria-label="Static illustration marking Bengaluru"><div className="india-shape" aria-hidden="true" /><span className="map-pin" aria-hidden="true" /><span className="map-label">Bengaluru</span><div className="map-key"><span>Local operations</span> · Wider network via The Professional Couriers</div></div>
          <div><div className="section-label">Network</div><h2>Rooted in Bengaluru.<br />Connected beyond it.</h2><p className="section-lead">Through The Professional Couriers network, Atlant Global India supports domestic and international courier and cargo requirements. Its local service area is Bengaluru South and East.</p><Link className="btn btn-navy" href="/contact">Contact the company <ArrowRight size={14} /></Link></div>
        </div>
      </section>
      <section className="section section-sm">
        <div className="container">
          <div className="section-label">Leadership</div><h2>Led with experience.</h2>
          <div className="leadership"><div className="portrait-placeholder" aria-label="Portrait not provided"><Building2 size={45} strokeWidth={1.2} /></div><div><h3>Mr. Suresh Surendranath Nair</h3><div className="role">Chief Executive Officer</div><p>Mr. Suresh Surendranath founded Atlant Global India in 1990. No approved biography or portrait is currently available for this presentation.</p></div></div>
          <p className="photo-disclaimer">{STOCK_NOTE}</p>
        </div>
      </section>
    </>
  );
}

export function ResourcesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const volumetric = useMemo(() => {
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);
    return l > 0 && w > 0 && h > 0 ? (l * w * h) / 5000 : null;
  }, [height, length, width]);
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
          <div className="calculator">
            <div className="section-label">Shipping reference</div><h3>Volumetric weight calculator</h3>
            <p>Estimate volumetric weight with L × W × H ÷ 5,000. Enter dimensions in centimetres. Confirm the applicable divisor and chargeable weight with the team.</p>
            <div className="calc-row">
              <div className="calc-input-wrap"><label htmlFor="calc-l">Length (cm)</label><input className="calc-input" id="calc-l" type="number" min="0" step="any" value={length} onChange={(event) => setLength(event.target.value)} /></div>
              <div className="calc-input-wrap"><label htmlFor="calc-w">Width (cm)</label><input className="calc-input" id="calc-w" type="number" min="0" step="any" value={width} onChange={(event) => setWidth(event.target.value)} /></div>
              <div className="calc-input-wrap"><label htmlFor="calc-h">Height (cm)</label><input className="calc-input" id="calc-h" type="number" min="0" step="any" value={height} onChange={(event) => setHeight(event.target.value)} /></div>
            </div>
            <div className="calc-result"><span>Volumetric weight</span><strong>{volumetric === null ? '—' : `${volumetric.toFixed(2)} kg`}</strong></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-label">Shipping notes</div><h2>Plan the next conversation.</h2>
          <div className="resources-cards">
            <article className="resource-card"><span className="resource-cat">Shipping basics</span><h3>Preparing a consignment</h3><p>Confirm packaging, service availability and shipment details with a nearby branch.</p><a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Packaging and shipment preparation question')}`}>Ask the team <ArrowRight size={12} /></a></article>
            <article className="resource-card"><span className="resource-cat">Business shipping</span><h3>Planning recurring shipments</h3><p>Share locations, shipment type and expected frequency in a business enquiry.</p><Link href="/business">Start a business enquiry <ArrowRight size={12} /></Link></article>
            <article className="resource-card"><span className="resource-cat">Shipment visibility</span><h3>Need a consignment update?</h3><p>Use the official tracking service or contact Atlant Global India for assistance.</p><Link href="/tracking">Go to tracking <ArrowRight size={12} /></Link></article>
          </div>
        </div>
      </section>
    </>
  );
}

export function CareersPage() {
  return (
    <>
      <PageHeading eyebrow="Careers & franchise enquiries" title="Grow with Atlant Global India." intro="Contact the company directly to discuss career or franchise enquiries. Current openings and franchise terms are not published on this site." />
      <section className="section section-sm">
        <div className="container opportunity-layout">
          <div className="opportunity-image">
            <img src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Logistics workers handling cartons in a warehouse" loading="lazy" />
            <p className="photo-disclaimer">{STOCK_NOTE}</p>
          </div>
          <div>
            <div className="section-label">Start a conversation</div>
            <h2>Interested in working with us?</h2>
            <p className="section-lead">For career enquiries, send a short introduction, your location and a CV attachment by email. The company can confirm current requirements directly.</p>
            <div className="opportunity-panel"><h3>Career enquiry</h3><p>No vacancies are listed here. Reach out to ask about current opportunities.</p><a className="btn btn-navy" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Career enquiry')}&body=${encodeURIComponent('Hello Atlant Global India team,\n\nI would like to enquire about career opportunities.\n\nName:\nLocation:\nContact number:\n\nI will attach my CV to this email.')}`}>Email a career enquiry <ArrowUpRight size={14} /></a></div>
            <div className="opportunity-panel"><h3>Franchise enquiry</h3><p>Contact the team to discuss whether a franchise opportunity is available and what it may involve.</p><a className="btn btn-outline" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Franchise enquiry')}`}>Email a franchise enquiry <ArrowUpRight size={14} /></a></div>
          </div>
        </div>
      </section>
    </>
  );
}

const offices = [
  {
    name: 'Corporate Office',
    address: '#136, 7th Cross, 29th Main Road, Lake Road, BTM 2nd Stage, Bengaluru, Karnataka 560076',
    keywords: 'btm lake road corporate office south bengaluru 560076',
    map: 'https://www.google.com/maps/search/?api=1&query=%23136%2C+7th+Cross%2C+29th+Main+Road%2C+Lake+Road%2C+BTM+2nd+Stage%2C+Bengaluru+560076',
  },
  {
    name: 'Operations Office · Kudlu Gate',
    address: 'No 51/2, Chikka Begur Gate, Lakshmi Layout, Hosur Main Road, Kudlu Gate, Bengaluru 560068',
    keywords: 'kudlu gate operations office east bengaluru 560068',
    map: 'https://www.google.com/maps/search/?api=1&query=No+51%2F2%2C+Chikka+Begur+Gate%2C+Lakshmi+Layout%2C+Hosur+Main+Road%2C+Kudlu+Gate%2C+Bengaluru+560068',
  },
];

export function ContactPage() {
  const [query, setQuery] = useState('');
  const filteredOffices = offices.filter((office) => `${office.name} ${office.address} ${office.keywords}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <PageHeading eyebrow="Contact & branches" title="Here when you need us." intro="Get in touch with Atlant Global India in Bengaluru. The company serves Bengaluru South and East through 65 branches; the verified office details below are searchable." />
      <section className="section section-sm">
        <div className="container">
          <div className="section-label">Find a listed office</div><h2>Search by area or PIN code.</h2>
          <div className="branch-search">
            <label className="sr-only" htmlFor="branch-search">Search office by area or PIN code</label>
            <input id="branch-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try BTM, Kudlu Gate or a PIN code" data-testid="input-branch-search" />
            <a className="btn btn-navy" href={`tel:${PHONE}`}><Phone size={14} /> Call the team</a>
          </div>
          <div className="contact-grid">
            {filteredOffices.map((office) => <article className="contact-card" key={office.name}>
              <h3>{office.name}</h3><p><MapPin size={14} /> {office.address}</p>
              <p><Clock3 size={14} /> Monday–Saturday, 10am–6pm</p>
              <div className="contact-links"><a href={office.map} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={12} /></a><a href={`tel:${PHONE}`}>Call +91 7411 708 958</a></div>
            </article>)}
          </div>
          {filteredOffices.length === 0 && <div className="branch-result" role="status">No listed office matches that search. Contact the team for help locating a nearby branch.</div>}
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
    <section className="page-heading section">
      <div className="container not-found">
        <div className="section-label">Page not found</div>
        <h1>This page has moved on.</h1>
        <p>The address may be incorrect or the page may no longer be available.</p>
        <Link className="btn btn-primary" href="/">Return to home <ArrowRight size={14} /></Link>
      </div>
    </section>
  );
}