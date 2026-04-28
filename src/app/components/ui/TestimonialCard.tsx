import { Testimonial } from "@/app/types";

export default function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="testimonial-card">
      <span className="quote-mark">"</span>

      <p className="testimonial-text">{t.text}</p>

      <div className="testimonial-author">
        <div className="author-avatar">{t.initials}</div>

        <div>
          <p className="author-name">{t.author}</p>
          <span className="author-title">{t.title}</span>
        </div>
      </div>
    </div>
  );
}
