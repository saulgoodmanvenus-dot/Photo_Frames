import { useState } from 'react';
import './Pricing.css';

const categories = {
  rectangular: {
    label: 'Rectangular',
    sizes: [
      { size: '8×6"', frame: 399, original: 684, print: 141 },
      { size: '10×8"', frame: 499, original: 850, print: 168 },
      { size: '12×8"', frame: 599, original: 999, print: 182 },
      { size: '14×10"', frame: 699, original: 1140, print: 210 },
      { size: '16×12"', frame: 899, original: 1500, print: 250 },
      { size: '20×16"', frame: 1199, original: 1999, print: 350 },
    ],
  },
  portrait: {
    label: 'Portrait',
    sizes: [
      { size: '8×10"', frame: 499, original: 850, print: 160 },
      { size: '10×14"', frame: 699, original: 1140, print: 220 },
      { size: '12×18"', frame: 999, original: 1650, print: 300 },
      { size: '16×24"', frame: 1499, original: 2500, print: 450 },
      { size: '20×30"', frame: 1999, original: 3200, print: 580 },
    ],
  },
  square: {
    label: 'Square',
    sizes: [
      { size: '8×8"', frame: 449, original: 750, print: 150 },
      { size: '10×10"', frame: 599, original: 999, print: 195 },
      { size: '12×12"', frame: 749, original: 1250, print: 240 },
      { size: '16×16"', frame: 1099, original: 1800, print: 340 },
      { size: '20×20"', frame: 1499, original: 2500, print: 460 },
    ],
  },
  popular: {
    label: 'Popular',
    sizes: [
      { size: '8×6"', frame: 399, original: 684, print: 141, popular: true },
      { size: '12×8"', frame: 599, original: 999, print: 182, popular: true },
      { size: '12×18"', frame: 999, original: 1650, print: 300 },
      { size: '16×24"', frame: 1499, original: 2500, print: 450 },
      { size: '20×30"', frame: 1999, original: 3200, print: 580, popular: true },
    ],
  },
};

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('rectangular');
  const currentCategory = categories[activeTab];

  const handleOrder = (size) => {
    const msg = encodeURIComponent(
      `Hi! I'd like to order a photo frame.\n\nSize: ${size.size}\nWith Frame: ₹${size.frame}\n\nPlease share the details.`
    );
    window.open(`https://wa.me/918667219624?text=${msg}`, '_blank');
  };

  return (
    <section className="pricing-section section" id="pricing">
      <div className="container">
        <div className="section-title">
          <h2>Sizes & Pricing</h2>
          <div className="section-divider"></div>
          <p>Premium quality prints and frames at the best prices in India</p>
        </div>

        <div className="pricing-tabs">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              className={`pricing-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="pricing-grid">
          {currentCategory.sizes.map((size, i) => (
            <div className={`pricing-card ${size.popular ? 'popular' : ''}`} key={i}>
              <div className="pricing-size">{size.size}</div>
              <div className="pricing-type">Photo Frame</div>
              <div className="pricing-prices">
                <div className="pricing-frame-price">
                  <span className="pricing-frame-value">₹{size.frame}</span>
                  <span className="pricing-frame-original">₹{size.original}</span>
                </div>
                <div className="pricing-print-price">Print only: ₹{size.print}</div>
              </div>
              <button className="pricing-order-btn" onClick={() => handleOrder(size)}>
                Order Now
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-offer">
          <h3>🎉 Buy 1 Get 1 Free!</h3>
          <p>
            Add any two Photo Frame Prints to cart and apply coupon code{' '}
            <code>BUY1GET1</code> at checkout. No limit on discount value!
          </p>
        </div>
      </div>
    </section>
  );
}
