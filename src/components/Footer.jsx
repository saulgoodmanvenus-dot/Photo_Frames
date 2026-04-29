import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              🖼️ Frame<span className="logo-highlight">Craft</span>&nbsp;3D
            </div>
            <p>
              Premium online photo printing and framing service. High-quality prints
              with vibrant colors, beautiful frames, and free delivery across India.
              Experience your memories in stunning 3D before you order.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="YouTube">🎬</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              <li><a href="#configurator">Photo Prints</a></li>
              <li><a href="#pricing">Photo Frames</a></li>
              <li><a href="#">Canvas Prints</a></li>
              <li><a href="#">Acrylic Frames</a></li>
              <li><a href="#">Collage Prints</a></li>
              <li><a href="#">LED Photo Frames</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#configurator">3D Configurator</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Reviews</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+918667219624">+91 8667219624</a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">💬</span>
              <a href="https://wa.me/918667219624" target="_blank" rel="noopener noreferrer">
                WhatsApp Support
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📧</span>
              <a href="mailto:support@framecraft3d.com">support@framecraft3d.com</a>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📍</span>
              <span>India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 FrameCraft 3D. All rights reserved. Premium Photo Printing & Framing.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
