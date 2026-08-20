import NavBar from "../HeroCTAPAGE/NavBar/NavBar";
import HeroSection from "../HeroCTAPAGE/HeroSection/HeroSection";
import FeaturesShow from "../HeroCTAPAGE/FeatureShow/FeatureShow";
import HowWork from "../HeroCTAPAGE/HowWork/HowWork";
import Footer from "../HeroCTAPAGE/Footer/Footer";
export default function LandingPage() {
  return (
    <>
      <div className="news-page">
        <NavBar />

        <main>
          <HeroSection />
          <FeaturesShow />
          <HowWork />
        </main>

        <Footer />
      </div>
    </>
  );
}
