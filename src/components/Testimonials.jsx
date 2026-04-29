import './Testimonials.css';

const testimonials = [
  {
    stars: 5,
    text: "Absolutely blown away by the quality! The colors are so vibrant and the frame is premium. The 3D preview feature is a game changer — I knew exactly what I was getting.",
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    initial: 'P',
  },
  {
    stars: 5,
    text: "Ordered a 16x24 family portrait and it turned out stunning. The packaging was excellent and it arrived within 4 days. Already ordered 3 more for gifts!",
    name: 'Rajesh Kumar',
    location: 'Delhi, NCR',
    initial: 'R',
  },
  {
    stars: 5,
    text: "The 12-color printing really shows. My landscape photos look like they're straight out of a gallery. Best online photo printing service in India, hands down.",
    name: 'Ananya Patel',
    location: 'Bangalore, Karnataka',
    initial: 'A',
  },
  {
    stars: 5,
    text: "I was skeptical about ordering prints online, but the 3D configurator gave me total confidence. The actual product was even better than the preview!",
    name: 'Vikram Singh',
    location: 'Jaipur, Rajasthan',
    initial: 'V',
  },
  {
    stars: 5,
    text: "Used the WhatsApp support to customize my order. The team was super responsive and helpful. Got a beautiful collage frame for my anniversary.",
    name: 'Meera Nair',
    location: 'Kochi, Kerala',
    initial: 'M',
  },
  {
    stars: 5,
    text: "Corporate bulk order of 200+ frames was handled flawlessly. Great quality consistency across all prints. Will definitely use again for our company events.",
    name: 'Arjun Reddy',
    location: 'Hyderabad, Telangana',
    initial: 'A',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section section" id="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>What Our Clients Say</h2>
          <div className="section-divider"></div>
          <p>Trusted by 50,000+ happy customers across India</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">
                {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initial}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-location">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials-cta">
          <button
            className="btn btn-outline"
            onClick={() => document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' })}
          >
            🖼️ Try the 3D Configurator
          </button>
        </div>
      </div>
    </section>
  );
}
