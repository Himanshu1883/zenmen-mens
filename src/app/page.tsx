import Contact from "@/app/components/sections/Contact";
import Hero from "@/app/components/sections/Hero";
import HomeCategoryStrip from "@/app/components/sections/HomeCategoryStrip";
import Process from "@/app/components/sections/Process";
import Products from "@/app/components/sections/Products";
import Reels from "@/app/components/sections/Reels";
import Services from "@/app/components/sections/Services";
import Testimonials from "@/app/components/sections/Testimonials";
// import HomeSections from "@/app/components/sections/HomeSections";
import ShopByCategory from "@/app/components/sections/HomeSections";
import ProductSlider from "./components/sections/ProductSlider";
import StoresSection from "./components/sections/StoresSection";
import AccessoriesSection from "./components/sections/AccessoriesSection";
import ProductVideosSection from "./components/sections/ProductVideosSection";

export default function Home() {
  return (
    <>
      <HomeCategoryStrip />
      <Hero />
      <ShopByCategory />
      <ProductSlider />
      {/* <Marquee /> */}
      {/* <Services /> */}
      <ProductVideosSection />
      <Products />
      <Reels />
      {/* <FounderSection /> */}
      <AccessoriesSection />
      <Process />
      <Testimonials />
      <StoresSection />
      {/* <CtaBanner /> */}
      <Contact />
    </>
  );
}
