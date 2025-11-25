import bg from "@/assets/images/login/bg.png";
import bgSmall from "@/assets/images/login/bgsmall.png";
import { Fragment, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = bg;
    img.onload = () => setImageLoaded(true);
  }, []);
  return (
    <Fragment>
      <div className="flex h-screen">
        <div
          className="hidden flex-1 bg-cover bg-center bg-no-repeat transition-opacity duration-500 sm:block"
          style={{
            backgroundImage: imageLoaded ? `url(${bg})` : `url(${bgSmall})`,
            opacity: imageLoaded ? 1 : 0.7,
          }}
        />

        {/* <div
          className="flex-1 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `image-set(url(${bgWebp}) 1x, url(${bg}) 1x)`,
          }}
        /> */}

        <div className="w-full sm:w-1/3">
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
};

export default AuthLayout;
