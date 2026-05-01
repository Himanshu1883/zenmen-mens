import Contact from "@/app/components/sections/Contact";
import CtaBanner from "@/app/components/sections/CtaBanner";
import Hero from "@/app/components/sections/Hero";
import Process from "@/app/components/sections/Process";
import Products from "@/app/components/sections/Products";
import Reels from "@/app/components/sections/Reels";
import Services from "@/app/components/sections/Services";
import Testimonials from "@/app/components/sections/Testimonials";
import FounderSection from "./components/sections/Founder";

export default function Home() {
  return (
    <>
      <Hero />
      {/* <Marquee /> */}
      <Services />
      <Products />
      <Reels />
      <FounderSection />
      <Process />
      <Testimonials />
      <CtaBanner />
      <Contact />
    </>
  );
}
