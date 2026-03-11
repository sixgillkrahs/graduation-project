import { Card } from "antd";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="grid gap-7">
      <div className="grid grid-cols-3 gap-7">
        <Card
          style={{
            height: 300,
          }}
        >
          {t("activeAgents")}
        </Card>
        <Card>{t("activeAgents")}</Card>
        <Card>{t("activeAgents")}</Card>
      </div>
      <div className="grid grid-cols-3 gap-7">
        <div className="col-span-2">
          {" "}
          <Card>{t("activeAgents")}</Card>
        </div>
        <div className="col-span-1">
          <Card>
            <div className="mb-6 text-2xl font-bold">{t("quickActions")}</div>
            <div className="grid grid-cols-2 grid-rows-2 gap-6">
              <div className="flex h-34 items-center justify-center rounded-md border border-dashed border-gray-300">
                {t("addList")}
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                {t("marketingMaterial")}
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                {t("scheduleShowing")}
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                {t("commissionCalc")}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
