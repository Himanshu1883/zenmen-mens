"use client";

import { processSteps } from "@/app/data/process";

export default function Process() {
  return (
    <section id="process" className="process-clean">
      <div className="section-label">How It Works</div>

      <h2 className="section-title">
        The ZENmen <em>Experience</em>
      </h2>

      <p className="process-intro">
        Four deliberate steps. Zero noise.
      </p>

      <div className="process-list">
        {processSteps.map((step, index) => (
          <article key={step.id} className="process-item">
            <div className="process-marker">
              <span>{step.num}</span>
            </div>

            <div className="process-content">
              <span className="process-step-index">Step {index + 1}</span>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.description}</p>
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .process-clean {
          background: var(--black);
          position: relative;
        }

        .process-clean::before {
          content: "";
          position: absolute;
          left: 24px;
          right: 24px;
          top: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(200, 169, 110, 0.25) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .section-label,
        .section-title,
        .process-intro,
        .process-list {
          position: relative;
          z-index: 1;
        }

        .process-intro {
          max-width: 520px;
          font-size: clamp(12px, 1.7vw, 14px);
          line-height: 1.8;
          color: var(--text-light);
          margin-bottom: 40px;
          letter-spacing: 0.6px;
        }

        .process-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
        }

        .process-list::before {
          content: "";
          position: absolute;
          left: 27px;
          top: 12px;
          bottom: 12px;
          width: 1px;
          background: linear-gradient(
            180deg,
            rgba(200, 169, 110, 0.5) 0%,
            rgba(200, 169, 110, 0.12) 100%
          );
        }

        .process-item {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 18px;
          align-items: start;
        }

        .process-marker {
          width: 56px;
          height: 56px;
          border: 1px solid rgba(232, 213, 168, 0.4);
          background: #111;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .process-marker span {
          font-family: "Cormorant Garamond", serif;
          font-size: 25px;
          font-weight: 500;
          color: var(--gold-light);
        }

        .process-content {
          padding: 14px 18px 16px;
          border: 1px solid rgba(232, 213, 168, 0.18);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.01);
          transition: border-color 0.25s ease, background-color 0.25s ease,
            transform 0.25s ease;
        }

        .process-item:hover .process-content {
          border-color: rgba(232, 213, 168, 0.38);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(3px);
        }

        .process-step-index {
          font-size: 9px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--gold);
          display: block;
          margin-bottom: 10px;
        }

        .process-step-title {
          font-family: "Cormorant Garamond", serif;
          font-size: clamp(22px, 2.5vw, 28px);
          line-height: 1.1;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 9px;
        }

        .process-step-desc {
          font-size: clamp(12px, 1.4vw, 13.5px);
          line-height: 1.8;
          color: var(--text-light);
        }

        @media (max-width: 1024px) {
          .process-item {
            grid-template-columns: 52px 1fr;
            gap: 14px;
          }

          .process-marker {
            width: 52px;
            height: 52px;
          }
        }

        @media (max-width: 680px) {
          .process-intro {
            margin-bottom: 24px;
          }

          .process-list::before {
            left: 23px;
          }

          .process-item {
            grid-template-columns: 44px 1fr;
            gap: 12px;
          }

          .process-marker {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }

          .process-marker span {
            font-size: 20px;
          }

          .process-content {
            padding: 12px 14px 14px;
          }

          .process-step-title {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}
