"use client";

export default function Contact() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,600&family=Montserrat:wght@400;500;600&display=swap');

        .contact-premium {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(1200px 380px at 20% -20%, rgba(201, 168, 76, 0.12), transparent 65%),
            radial-gradient(900px 360px at 90% 120%, rgba(201, 168, 76, 0.08), transparent 65%),
            #0a0806;
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          padding: 86px 22px;
        }

        .contact-shell {
          max-width: 1220px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 28px;
        }

        .contact-panel {
          border: 1px solid rgba(201, 168, 76, 0.2);
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
          backdrop-filter: blur(2px);
          padding: 34px 30px;
        }

        .premium-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          letter-spacing: 3.5px;
          font-weight: 600;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 12px;
        }

        .premium-title {
          font-family: 'Playfair Display', serif;
          color: #f5f0e8;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.06;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
        }

        .premium-title em {
          color: #c9a84c;
          font-style: italic;
        }

        .premium-sub {
          font-family: 'Montserrat', sans-serif;
          color: rgba(245, 240, 232, 0.72);
          font-size: 13px;
          line-height: 1.85;
          max-width: 560px;
          margin-bottom: 26px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .detail-card {
          border: 1px solid rgba(201, 168, 76, 0.18);
          background: rgba(7, 6, 5, 0.55);
          padding: 12px 14px;
        }

        .detail-card span {
          display: block;
        }

        .detail-k {
          font-family: 'Montserrat', sans-serif;
          color: rgba(201, 168, 76, 0.95);
          font-size: 9px;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .detail-v {
          font-family: 'Playfair Display', serif;
          color: #f5f0e8;
          font-size: 18px;
          line-height: 1.35;
        }

        .contact-form-panel {
          border: 1px solid rgba(201, 168, 76, 0.24);
          background:
            linear-gradient(150deg, rgba(201, 168, 76, 0.12) -70%, transparent 30%),
            rgba(9, 7, 5, 0.92);
          padding: 34px 30px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          color: #f5f0e8;
          font-size: 28px;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-family: 'Montserrat', sans-serif;
          color: rgba(245, 240, 232, 0.64);
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          border: 1px solid rgba(201, 168, 76, 0.25);
          background: rgba(16, 13, 10, 0.9);
          color: #f5f0e8;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          letter-spacing: 0.4px;
          padding: 12px 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(245, 240, 232, 0.42);
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: rgba(201, 168, 76, 0.58);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }

        .form-textarea {
          min-height: 122px;
          resize: vertical;
        }

        .send-btn {
          margin-top: 4px;
          border: none;
          background: #c9a84c;
          color: #0a0806;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s;
        }

        .send-btn:hover {
          background: #dfbe68;
          transform: translateY(-1px);
        }

        @media (max-width: 960px) {
          .contact-shell {
            grid-template-columns: 1fr;
          }

          .contact-premium {
            padding: 70px 16px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section id="contact" className="contact-premium">
        <div className="contact-shell">
          <div className="contact-panel">
            <div className="premium-label">Private Consultation</div>
            <h2 className="premium-title">
              Visit Our <em>Atelier</em>
            </h2>
            <p className="premium-sub">
              Experience a one-on-one styling consultation with master
              craftsmen. From sherwani and suiting to shirts and formalwear, we
              tailor every detail to your personality and occasion.
            </p>

            <div className="detail-grid">
              <div className="detail-card">
                <span className="detail-k">Studio Hours</span>
                <span className="detail-v">Mon-Sat, 11 AM - 8 PM</span>
              </div>
              <div className="detail-card">
                <span className="detail-k">Consultation</span>
                <span className="detail-v">By Appointment & Walk-ins</span>
              </div>
              <div className="detail-card">
                <span className="detail-k">Turnaround</span>
                <span className="detail-v">10-21 Days, Rush Available</span>
              </div>
              <div className="detail-card">
                <span className="detail-k">Specialty</span>
                <span className="detail-v">Bespoke Groom & Occasionwear</span>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            <h3 className="form-title">Reserve Your Fitting</h3>
            <p className="form-subtitle">
              Share your date, occasion, and preferred style
            </p>

            <form className="contact-form">
              <input
                placeholder="Your Name"
                className="form-input"
                type="text"
              />
              <input
                placeholder="Email Address"
                className="form-input"
                type="email"
              />
              <input
                placeholder="Phone Number"
                className="form-input"
                type="tel"
              />
              <textarea
                className="form-textarea"
                placeholder="Tell us your occasion, timeline, and preferred look"
              />

              <button className="send-btn" type="submit">
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
