import './Hero.css';

export default function Hero() {
  const scrollToConfigurator = () => {
    const el = document.getElementById('configurator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="hero-particle" />
          ))}
        </div>
      </div>

      <div className="container hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            Premium Quality Prints
          </div>

          <h1>
            Transform Your Photos Into{' '}
            <span className="highlight">Stunning Wall Art</span>
          </h1>

          <p>
            Experience your memories in a whole new dimension. Upload your favorite photos,
            preview them in our interactive 3D configurator, and get premium framed prints
            delivered to your doorstep.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={scrollToConfigurator}>
              🖼️ Upload Photo & Preview
            </button>
            <button className="btn btn-outline btn-lg" onClick={scrollToConfigurator}>
              View 3D Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">12</div>
              <div className="stat-label">Color Machine</div>
            </div>
            <div className="hero-stat">
              <div className="stat-value">4.9★</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-frame-preview">
            <span className="preview-3d-badge">✨ 3D Preview</span>
            <div className="hero-frame-inner">
              <span className="frame-icon">🖼️</span>
              <span className="frame-label">Your Photo Here</span>
            </div>

            <div className="hero-float-card card-1">
              <span className="float-icon">🎨</span>
              High Resolution
            </div>
            <div className="hero-float-card card-2">
              <span className="float-icon">🚚</span>
              Free Shipping
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
