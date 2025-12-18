import { Icon } from "../ui/Icon/Icon";

const Label = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col  w-full items-center gap-2 ${className}`}>
      <div className="flex justify-between items-center gap-2 w-full">
        <span className="cs-paragraph-white text-[16px]!">{label}</span>
        <span className="text-sm! cs-paragraph-gray">{value}</span>
      </div>
      <div className="w-full h-[0.5px] cs-bg-gray"></div>
    </div>
  );
};

const Footer = () => {
  const classIcon =
    "text-white cs-bg-gray p-2 rounded-full w-10 h-10 active:scale-90 transition-all duration-300 cursor-pointer";
  const classText = "cs-paragraph-white text-[16px]!";
  const classLi = "text-sm! cs-paragraph-gray grid grid-cols-1 gap-3 mt-4";

  return (
    <footer className="p-20 cs-bg-black grid grid-cols-1 ">
      <div className="flex gap-12 justify-between">
        <div className="cs-paragraph-white">
          Every Home Has A Story.
          <br />
          We Help You Write Yours.
        </div>
        <div className="flex gap-15">
          <div className="grid grid-cols-3 gap-20">
            <div>
              <span className={classText}>Browser Havenly</span>
              <ul className={classLi}>
                <li>List for rent</li>
                <li>Publish for sell</li>
                <li>Invest</li>
              </ul>
            </div>
            <div>
              <span className={classText}>Work At Havenly</span>
              <ul className={classLi}>
                <li>Become a Havenly agent</li>
                <li>Be Havenly Photographer </li>
              </ul>
            </div>
            <div>
              <span className={classText}>About Havenly</span>
              <ul className={classLi}>
                <li>Frequently Asked Questions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 min-w-[300px]">
            <Label label="Email" value="contact@realestate.com" />
            <Label label="Phone" value="0966999999" />
            <div className="mt-8">
              <div className={classText}>Follow Us</div>
              <div className="flex gap-4 mt-4">
                <Icon.Facebook className={classIcon} />
                <Icon.TwitterX className={classIcon} />
                <Icon.Youtube className={classIcon} />
                <Icon.Instagram className={classIcon} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-[320px]! cs-typography-gray font-semibold!">
          Havenly
        </div>
      </div>
    </footer>
  );
};

export default Footer;
