export interface Product {
  id: string;
  name: string;
  material: string;
  price: number;
  category: "suit" | "shirt" | "trouser";
  badge?: string;
  badgeOutline?: boolean;
  bgGradient: string;
  description: string;
}

export interface Service {
  number: string;
  name: string;
  description: string;
  price: string;
  icon: "suit" | "shirt" | "trouser" | "alter" | "wedding" | "corporate";
}

export type Testimonial = {
  id: number;
  initials: string;
  text: string;
  author: string;
  title: string;
};

export interface ProcessStep {
  id: number;
  num: string;
  title: string;
  description: string;
}

export interface NavLink {
  href: string;
  label: string;
}
