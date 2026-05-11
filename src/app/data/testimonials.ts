type Testimonial = {
  id: number;
  initials: string;
  text: string;
  author: string;
  title: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    initials: "RK",
    text: "ZENmen transformed how I present myself. My wedding suit was a masterpiece — everyone asked where I got it. The attention to detail was extraordinary.",
    author: "Rahul Kumar",
    title: "Entrepreneur · Delhi",
  },
  {
    id: 2,
    initials: "AS",
    text: "As someone who travels frequently for business, having a wardrobe from ZENmen gives me unmatched confidence in every boardroom. Impeccable craftsmanship.",
    author: "Arjun Sharma",
    title: "Director · Mumbai",
  },
  {
    id: 3,
    initials: "VP",
    text: "I've tried many tailors but ZENmen is truly bespoke. The fabric selection is premium, the fit is flawless, and the team genuinely listens to your vision.",
    author: "Vikram Patel",
    title: "Architect · Ahmedabad",
  },
];
