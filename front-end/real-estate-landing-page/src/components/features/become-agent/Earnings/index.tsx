import { Card, Slider } from "@/components/ui";

const Earnings = () => {
  return (
    <section className=" bg-black/10 py-10 md:py-20">
      <div className="max-w-4xl mx-auto relative overflow-hidden container mx-auto px-4">
        <div
          className="absolute -top-[20px] -right-[20px] size-40 
                 border-4 border-black/10 
                 rounded-bl-[100%]"
        />
        <div className="text-center bg-white py-8 md:py-12 rounded-t-3xl shadow-lg">
          <div className="text-xl md:text-3xl! font-bold! cs-paragraph mb-1">
            Estimate Your Potential Earnings
          </div>
          <div className="text-base md:text-lg! cs-paragraph-gray">
            See how much you could earn with Havenly's commission structure
          </div>
        </div>
        <div className="p-6 md:p-12 bg-white rounded-b-3xl grid grid-cols-1 gap-6 shadow-lg">
          <div className="flex justify-between">
            <span className="cs-typography font-bold! text-base md:text-lg!">
              Homes sold per month
            </span>
            <span className="cs-typography-red font-black! text-2xl md:text-4xl!">
              4
            </span>
          </div>
          <Slider
            hiddenStat={true}
            max={10000}
            min={0}
            step={1000}
            currentValue={4000}
            disabled
          />
          <div className="flex justify-between cs-paragraph-gray text-sm!">
            <span>0 Homes</span>
            <span>5 Homes</span>
            <span>10+ Homes</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 bg-black/10 rounded-2xl gap-4">
            <span className="grid grid-cols-1 gap-2">
              <div className="cs-paragraph-gray font-bold! text-base md:text-lg!">
                ESTIMATED YEARLY INCOME
              </div>
              <div className="cs-paragraph-gray font-medium! text-sm!">
                *Based on avg. home price of $400k
              </div>
            </span>
            <span className="text-center md:text-left">
              <span className="cs-typography-red font-black! text-2xl md:text-4xl!">
                $144,000
              </span>
              <span className="cs-typography-gray font-black! text-sm md:text-base!">
                /yr
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Earnings;
