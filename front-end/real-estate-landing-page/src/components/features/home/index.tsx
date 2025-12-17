import React from "react";
import bg from "@/assets/bg.png";

const Home = () => {
  return (
    <section
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
      className="flex items-center justify-center"
    >
      <div>
        <div className="max-w-4xl text-center text-white font-bold text-7xl mx-auto my-auto mb-3">
          Find Your Dream Home with AI Insights
        </div>
        <div className="text-white text-[20px] max-w-4xl mx-auto text-center">
          Discover the perfect property with our advanced AI-powered search
          engine that understands your lifestyle needs
        </div>
        <div className="bg-white rounded-2xl p-4"></div>
      </div>
    </section>
  );
};

export default Home;
