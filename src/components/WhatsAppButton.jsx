import './WhatsAppButton.css';

const WHATSAPP_NUMBER = '918667219624';
const DEFAULT_MESSAGE = encodeURIComponent(
  'Hi! I am interested in your photo frame printing services. Could you please share the details?'
);

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`,
      '_blank'
    );
  };

  return (
    <div className="whatsapp-float">
      <div className="whatsapp-tooltip">💬 Chat with us on WhatsApp</div>
      <button
        className="whatsapp-btn"
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        💬
      </button>
    </div>
  );
}
