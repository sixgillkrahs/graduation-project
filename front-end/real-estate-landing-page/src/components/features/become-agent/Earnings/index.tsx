import { Card, Slider } from "@/components/ui";

const Earnings = () => {
  return (
    <section className=" bg-black/10 py-20">
      <div className="max-w-4xl mx-auto relative overflow-hidden container mx-auto">
        <div
          className="absolute -top-[20px] -right-[20px] size-40 
                 border-4 border-black/10 
                 rounded-bl-[100%]"
        />
        <div className="text-center bg-white  py-12 rounded-t-3xl shadow-lg">
          <div className="text-3xl! font-bold! cs-paragraph mb-1">
            Estimate Your Potential Earnings
          </div>
          <div className="text-lg! cs-paragraph-gray">
            See how much you could earn with Havenly's commission structure
          </div>
        </div>
        <div className="p-12 bg-white rounded-b-3xl grid grid-cols-1 gap-6 shadow-lg">
          <div className="flex justify-between">
            <span className="cs-typography font-bold! text-lg!">
              Homes sold per month
            </span>
            <span className="cs-typography-red font-black! text-4xl!">4</span>
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
          <div className="flex justify-between items-center p-8 bg-black/10 rounded-2xl">
            <span className="grid grid-cols-1 gap-2">
              <div className="cs-paragraph-gray font-bold! text-lg!">
                ESTIMATED YEARLY INCOME
              </div>
              <div className="cs-paragraph-gray font-medium! text-sm!">
                *Based on avg. home price of $400k
              </div>
            </span>
            <span>
              <span className="cs-typography-red font-black! text-4xl!">
                $144,000
              </span>
              <span className="cs-typography-gray font-black! text-base!">
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
