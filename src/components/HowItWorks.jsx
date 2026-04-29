import './HowItWorks.css';

const steps = [
  {
    number: 1,
    icon: '📤',
    title: 'Upload Photo',
    desc: 'Upload your favorite high-resolution photo in any format — JPG, PNG, WEBP, or HEIC.',
  },
  {
    number: 2,
    icon: '🖼️',
    title: 'Choose Frame & Size',
    desc: 'Select from our range of premium frame materials, colors, and sizes to match your style.',
  },
  {
    number: 3,
    icon: '👁️',
    title: 'Preview in 3D',
    desc: 'See a realistic 3D preview of your framed photo mounted on a wall before you order.',
  },
  {
    number: 4,
    icon: '🚀',
    title: 'Order & Deliver',
    desc: 'Place your order securely. We print, frame, and deliver to your doorstep — free shipping!',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="section-title">
          <h2>How It Works</h2>
          <div className="section-divider"></div>
          <p>From photo to framed masterpiece in 4 simple steps</p>
        </div>

        <div className="steps-timeline">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <span className="step-icon">{step.icon}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
