import React from "react";

const Footer = () => {
  return (
    <footer className="p-6">
      <div className="grid grid-cols-4 gap-12">
        <div></div>
        <div>
          <span>COMPANY</span>
          <ul className="text-sm text-[#999999]">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <span>COMPANY</span>
          <ul className="text-sm text-[#999999]">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <span>COMPANY</span>
          <ul className="text-sm text-[#999999]">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="bg-gray-200 w-full h-[1px] my-6"></div>
      <div className="flex justify-between">
        <span>2025 PropAI Inc.All rights reserved</span>
        <span>English(US)</span>
      </div>
    </footer>
  );
};

export default Footer;
