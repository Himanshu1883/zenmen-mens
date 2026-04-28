import Contact from "@/app/components/sections/Contact";
import CtaBanner from "@/app/components/sections/CtaBanner";
import Hero from "@/app/components/sections/Hero";
import Marquee from "@/app/components/sections/Marquee";
import Process from "@/app/components/sections/Process";
import Products from "@/app/components/sections/Products";
import Services from "@/app/components/sections/Services";
import Testimonials from "@/app/components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <Products />
      <Process />
      <Testimonials />
      <CtaBanner />
      <Contact />
    </>
  );
}
