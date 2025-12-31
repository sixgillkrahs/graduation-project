import { Card } from "antd";

const Dashboard = () => {
  return (
    <div className="grid gap-7">
      <div className="grid grid-cols-3 gap-7">
        <Card
          style={{
            height: 300,
          }}
        >
          Active Agents
        </Card>
        <Card>Active Agents</Card>
        <Card>Active Agents</Card>
      </div>
      <div className="grid grid-cols-3 gap-7">
        <div className="col-span-2">
          {" "}
          <Card>Active Agents</Card>
        </div>
        <div className="col-span-1">
          <Card>
            <div className="mb-6 text-2xl font-bold">Quick Actions</div>
            <div className="grid grid-cols-2 grid-rows-2 gap-6">
              <div className="flex h-34 items-center justify-center rounded-md border border-dashed border-gray-300">
                Add List
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                Marketing Material
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                Schedule Showing
              </div>
              <div className="flex size-full items-center justify-center rounded-md border border-dashed border-gray-300">
                Commission Calc
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
