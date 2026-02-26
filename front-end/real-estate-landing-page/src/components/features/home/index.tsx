import Banner from "./Banner";
import Benefit from "./Benefit";
import FeaturedProperties from "./FeaturedProperties";
import HearCustom from "./HearCustom";
import WhyUs from "./WhyUs";
import TopCities from "./TopCities";
import HowItWorks from "./HowItWorks";
import FinalCTA from "./FinalCTA";

const Home = () => {
  return (
    <>
      <Banner />
      <WhyUs />
      <TopCities />
      <FeaturedProperties />
      <HowItWorks />
      <Benefit />
      <HearCustom />
      <FinalCTA />
    </>
  );
};

export default Home;
