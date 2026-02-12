import { Phone, User } from "lucide-react";

const inquiries = [
  {
    id: 1,
    name: "Mr. Tony",
    property: "Sunshine Apartment",
    time: "2h ago",
    status: "New",
  },
  {
    id: 2,
    name: "Ms. Sarah",
    property: "Villa Ocean View",
    time: "5h ago",
    status: "Viewed",
  },
  {
    id: 3,
    name: "Mr. David",
    property: "Downtown Office",
    time: "1d ago",
    status: "Viewed",
  },
];

const RecentInquiries = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border cs-outline-gray h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base! cs-typography">
          Recent Inquiries
        </h3>
        <button className="text-sm main-color-red font-medium hover:underline transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {inquiries.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 cs-bg-gray bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <User
                  size={20}
                  className="main-color-black group-hover:main-color-red"
                />
              </div>
              <div>
                <p className="font-medium text-sm text-black">{item.name}</p>
                <p className="text-xs cs-paragraph-gray truncate max-w-[120px]">
                  {item.property}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs cs-paragraph-gray">{item.time}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 ${
                    item.status === "New"
                      ? "bg-red-50 main-color-red"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <button className="w-8 h-8 rounded-full border cs-outline-gray flex items-center justify-center text-gray-500 hover:text-white hover:cs-bg-red hover:border-red-600 transition-all">
                <Phone size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInquiries;
