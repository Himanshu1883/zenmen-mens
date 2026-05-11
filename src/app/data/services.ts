type Service = {
  number: string;
  name: string;
  description: string;
  price: string;
  icon: string;
};

export const services: Service[] = [
  {
    number: "01",
    name: "Bespoke Suits",
    description:
      "Full canvas construction, over 30 measurements, and multiple fittings ensure a suit that is uniquely yours — from single to double-breasted.",
    price: "Starting from ₹18,000",
    icon: "suit",
  },
  {
    number: "02",
    name: "Custom Shirts",
    description:
      "Egyptian cotton, Italian poplin, or Oxford weaves — crafted with your preferred collar, cuffs, and fit for every occasion.",
    price: "Starting from ₹2,500",
    icon: "shirt",
  },
  {
    number: "03",
    name: "Tailored Trousers",
    description:
      "Slim, regular, or wide leg — crafted with precision pleating, belt loops, and hand-stitched hems to complement every suit or shirt.",
    price: "Starting from ₹4,500",
    icon: "trouser",
  },
  {
    number: "04",
    name: "Alterations",
    description:
      "Transform off-the-rack into perfectly fitted. Our skilled tailors handle everything from simple hemming to full jacket reconstruction.",
    price: "Starting from ₹500",
    icon: "alter",
  },
  {
    number: "05",
    name: "Wedding Collection",
    description:
      "From sherwani-inspired suits to classic three-piece ensembles — make your special day unforgettable with a garment crafted just for you.",
    price: "Starting from ₹25,000",
    icon: "wedding",
  },
  {
    number: "06",
    name: "Corporate Wardrobe",
    description:
      "Dress codes curated, bulk orders accommodated, and consistent quality guaranteed for businesses and professionals who mean business.",
    price: "Custom Pricing",
    icon: "corporate",
  },
];
