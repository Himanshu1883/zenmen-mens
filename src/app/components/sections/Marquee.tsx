export default function Marquee() {
  const items = [
    "Bespoke Suits",
    "Custom Shirts",
    "Tailored Trousers",
    "Wedding Attire",
    "Corporate Wardrobes",
  ];

  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="marquee-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
