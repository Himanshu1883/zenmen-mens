// src/app/data/process.ts

import type { ProcessStep } from "@/app/types";

export const processSteps: ProcessStep[] = [
  {
    id: 1,
    num: "I",
    title: "Consultation",
    description:
      "A private style consultation to define silhouette, purpose, and personal expression before the first cut.",
  },
  {
    id: 2,
    num: "II",
    title: "Measurement",
    description:
      "Over 30 precision measurements are mapped to your posture and proportions for a truly bespoke foundation.",
  },
  {
    id: 3,
    num: "III",
    title: "Craft & Fit",
    description:
      "Master craftsmen hand-cut and construct your garment, then refine it through fitting for exact balance and comfort.",
  },
  {
    id: 4,
    num: "IV",
    title: "Delivery",
    description:
      "Your completed piece is final-pressed, quality-checked, and presented in our signature ZENmen delivery package.",
  },
];
