import TestimonialCard from "@/app/components/ui/TestimonialCard";
import { testimonials } from "@/app/data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonials">
      <div className="section-label">Client Stories</div>

      <h2 className="section-title">
        Words from our <em>Gentlemen</em>
      </h2>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    </section>
  );
}
