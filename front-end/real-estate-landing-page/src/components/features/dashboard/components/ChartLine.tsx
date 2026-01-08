"use client";

import { Tabs } from "@/components/ui";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

const ChartLine = () => {
  const options: Highcharts.Options = {
    chart: {
      type: "line",
    },
    title: {
      text: "",
    },
    subtitle: {
      text: "",
    },
    xAxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yAxis: {
      title: {
        text: "Views",
      },
    },
    series: [
      {
        type: "areaspline",
        name: "Views",
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 grid grid-cols-1 gap-10">
      <div className="flex justify-between">
        <div>
          <div className="cs-typography">Profile Views Analytics</div>
          <div className="cs-paragraph-gray">
            Performance over the last 30 days
          </div>
        </div>
        <div className="flex items-center">
          <Tabs
            items={[
              { title: "30 Days" },
              { title: "7 Days" },
              { title: "24 Hours" },
            ]}
          />
        </div>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default ChartLine;
