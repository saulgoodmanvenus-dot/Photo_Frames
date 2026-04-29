import './Features.css';

const features = [
  {
    icon: '🎨',
    title: '12-Color Printing',
    desc: 'State-of-the-art 12-color printing machines achieving 98% Pantone shades for unmatched vibrancy.',
  },
  {
    icon: '🖼️',
    title: 'Premium Frames',
    desc: 'Handcrafted frames in wood, metal, and synthetic options with multiple color finishes.',
  },
  {
    icon: '🚚',
    title: 'Free Shipping',
    desc: 'Free delivery across India with secure packaging and full tracking on every order.',
  },
  {
    icon: '✨',
    title: '3D Preview',
    desc: 'Interactive 3D configurator lets you see exactly how your framed photo will look on your wall.',
  },
  {
    icon: '📏',
    title: 'Custom Sizes',
    desc: 'From 4x6" to 54x96" — we offer standard and fully custom dimensions to fit any space.',
  },
  {
    icon: '🛡️',
    title: 'Quality Guarantee',
    desc: '270 GSM imported photo paper with semi-glossy satin pearl finish for lasting quality.',
  },
  {
    icon: '⚡',
    title: 'Fast Processing',
    desc: 'Quick turnaround times for individual and bulk orders. Corporate printing solutions available.',
  },
  {
    icon: '💬',
    title: 'WhatsApp Support',
    desc: 'Get instant support and order updates directly on WhatsApp. We are always here for you.',
  },
];

export default function Features() {
  return (
    <section className="features-section section" id="features">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose Us</h2>
          <div className="section-divider"></div>
          <p>Premium quality, cutting-edge technology, and exceptional service</p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
