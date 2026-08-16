import { Outlet } from "react-router-dom";
import DashNav from "../Dashboard/HomePage/DashNav";

export default function DashBoard() {
  return (
    <div className="dashboard">
      <DashNav />

      <main className="dashboard__content">
        <Outlet />
      </main>
    </div>
  );
}
