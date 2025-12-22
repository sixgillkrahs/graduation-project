import * as React from "react";

export const HeadGear = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeWidth="1.91"
      strokeLinecap="square"
      strokeMiterlimit="10"
    >
      <path d="M9.14,22.5V19.68H7.27a2,2,0,0,1-1.95-2V14.86l-1.91-.95 1.9-3.81V9.47a7.86,7.86,0,0,1,7.13-8 7.61,7.61,0,0,1,8.14,7.62 10.49,10.49,0,0,1-2.86,7.2V22.5" />
      <circle cx="12.95" cy="10.09" r="2.86" />
      <line x1="12.95" y1="6.27" x2="12.95" y2="7.23" />
      <line x1="12.95" y1="13.91" x2="12.95" y2="12.95" />
      <line x1="9.65" y1="8.18" x2="10.47" y2="8.66" />
      <line x1="16.26" y1="12" x2="15.43" y2="11.52" />
      <line x1="16.26" y1="8.18" x2="15.43" y2="8.66" />
      <line x1="9.65" y1="12" x2="10.47" y2="11.52" />
    </g>
  </svg>
);
