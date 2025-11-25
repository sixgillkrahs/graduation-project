import styles from "@/styles/404.module.css";
import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <section className="min-h-screen bg-white py-10 font-['Arvo']">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl text-center">
            <div className={styles.bgImage}>
              <h1 className="text-8xl font-bold text-white drop-shadow-lg">404</h1>
            </div>
            <div className="-mt-12">
              <h3 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
                Look like you're lost
              </h3>
              <p className="mb-6 text-lg text-gray-600">
                the page you are looking for not available!
              </p>
              <a
                href="/"
                className="inline-block rounded bg-green-600 px-6 py-3 text-white transition duration-300 hover:bg-green-700"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
