import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import DashNav from "../Dashboard/HomePage/DashNav";
import { getCurrentUser } from "../../services/auth.service";

export default function DashBoard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        console.log("Current User:", data);
        if (data?.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Get Current User Error:", error);
      }
    };

    fetchUser();
  }, []);

  const getUserInitials = (name = "") => {
    const words = name.trim().split(/\s+/);
    if (!words.length) return "U";
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  return (
    <div className="dashboard">
      <DashNav
        userName={user?.userName || "User"}
        userInitials={getUserInitials(user?.userName)}
      />

      <main className="dashboard__content">
        <Outlet />
      </main>
    </div>
  );
}
