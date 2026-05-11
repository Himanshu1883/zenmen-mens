type Testimonial = {
  text: string;
  initials: string;
  author: string;
  title: string;
};

export default function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="testimonial-card">
      <span className="quote-mark">&quot;</span>

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

// nothing just to make commit and push the changes in other files, as they are not being tracked by git due to the recent edits.
