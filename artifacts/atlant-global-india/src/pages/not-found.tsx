import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <section className="site-error-page">
      <div className="site-error-card">
        <span className="site-error-icon"><AlertCircle size={25} aria-hidden="true" /></span>
        <span className="site-error-code">404 · Page not found</span>
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
