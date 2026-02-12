import { Calendar, MapPin, Clock, Plus } from "lucide-react";

interface SidebarRightProps {
  schedules?: {
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    location: string;
    type: string;
  }[];
}

const SidebarRight = ({ schedules = [] }: SidebarRightProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border cs-outline-gray">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl! cs-typography">
            Today's Schedule
          </h3>
          <button className="text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
          {schedules.length === 0 ? (
            <p className="cs-paragraph-gray text-sm">No schedules for today.</p>
          ) : (
            schedules.map((item, index) => (
              <div
                key={item.id || index}
                className="relative group cursor-pointer"
              >
                <div
                  className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white box-content ${
                    index === 0 ? "cs-bg-red" : "bg-gray-300"
                  } group-hover:scale-125 transition-transform`}
                ></div>
                <p className="text-xs! font-semibold cs-paragraph-gray flex items-center gap-1 mb-1">
                  <Clock size={12} /> {item.startTime} - {item.endTime}
                </p>
                <h4 className="font-medium cs-typography text-sm! mb-1 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs! cs-paragraph-gray flex items-center gap-1">
                  <MapPin size={12} /> {item.location}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-black p-6 rounded-2xl border cs-outline-black relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 rounded-full blur-3xl opacity-20 -mr-8 -mt-8"></div>

        <h3 className="font-semibold text-lg text-white mb-2 relative z-10">
          Sourcing Opportunities
        </h3>
        <p className="text-sm text-gray-400 mb-4 relative z-10 font-normal">
          3 New Landlords listed properties in{" "}
          <span className="font-semibold text-white">Cau Giay</span>.
        </p>
        <button className="cs-bg-red hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg w-full transition-colors relative z-10 shadow-sm shadow-red-900/20">
          Review & Claim
        </button>
      </div>
    </div>
  );
};

export default SidebarRight;
