import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PrevNavBar from "../PreferenceForm/PrevNavBar";
import DigestPage from "../PreferenceForm/DigestPage";
import Footer from "../HeroCTAPAGE/Footer/Footer";
import ConfirmModal from "../../common/ConfirmModal.jsx";

import { logOutUser } from "../../services/auth.service.js";

export default function Preference({ user }) {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const userName = user?.userName || "User";

  const userInitials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Step 1: Navbar logout click
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Step 2: Confirm logout
  const handleConfirmLogout = async () => {
    try {
      setLogoutLoading(true);

      await logOutUser();

      localStorage.removeItem("accessToken");

      setShowLogoutModal(false);

      navigate("/authentication-page", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  // Step 3: Cancel logout
  const handleCloseLogoutModal = () => {
    if (!logoutLoading) {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <PrevNavBar
        userName={userName}
        userInitials={userInitials}
        onLogout={handleLogoutClick}
      />

      <DigestPage userName={user.userName} />

      <Footer />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
        title="Logout from NewsMint?"
        description="Are you sure you want to logout from your NewsMint account?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="logout"
        loading={logoutLoading}
      />
    </>
  );
}
