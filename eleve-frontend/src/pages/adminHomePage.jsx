// src/pages/adminHomePage.jsx
import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout, Modal, FloatButton } from "antd";
import {
  LogoutOutlined,
  GlobalOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Sidebar from "../components/admin/Sidebar";
import HeaderComponent from "../components/admin/Header";
import DashboardPage from "./admin/DashboardPage";
import DefaultPage from "./admin/DefaultPage";

// Import your existing pages (unchanged)
import AdminProductsPage from "./admin/adminProductsPage";
import AddProductForm from "./admin/addProductForm";
import EditProductForm from "./admin/editProductForm";
import AddUserForm from "./admin/addAdminForm";
import AdminAdminstratorPage from "./admin/adminAdminsitratorPage";
import AdminReviewPage from "./admin/adminReviewPage";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import ProfilePage from "../components/admin/ProfilePage";
import CustomersPage from "./admin/CustomersPage";
import AdminsPage from "./admin/AdminsPage";
import AdminDocumentsPage from "./admin/AdminDocumentsPage";

const { Content } = Layout;

export default function AdminHomePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    setLogoutModalVisible(false);
  };

  return (
    <Layout className="min-h-screen bg-slate-900">
      {/* Sidebar - UPDATED: Added onLogoutClick prop */}
      <Sidebar 
        collapsed={collapsed} 
        isDarkMode={isDarkMode} 
        onLogoutClick={() => setLogoutModalVisible(true)}
      />

      {/* Main Content Area */}
      <Layout
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-[280px]"
        }`}
        style={{ minHeight: "100vh" }}
      >
        {/* Header */}
        <HeaderComponent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setLogoutModalVisible={setLogoutModalVisible}
        />

        {/* Content */}
        <Content className="p-6 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<DefaultPage />} />
            
            {/* Your existing routes */}
            <Route path="/products" element={<AdminProductsPage />} />
            <Route path="/products/add" element={<AddProductForm />} />
            <Route path="/products/edit/:productId" element={<EditProductForm />} />
            <Route path="/orders" element={<AdminOrdersPage />} />
            <Route path="/orders/:status" element={<AdminOrdersPage />} />
           
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/admins" element={<AdminsPage />} />
            <Route path="/admins/add" element={<AdminsPage />} />
            <Route path="/reviews" element={<AdminReviewPage />} />
            <Route path="/documents" element={<AdminDocumentsPage />} />

            {/* Profile Page Route */}
            <Route path="/profile" element={<ProfilePage />} />

          </Routes>
        </Content>
      </Layout>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          icon: <LogoutOutlined />,
        }}
        className="rounded-lg"
      >
        <div className="py-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 border border-slate-800">
            <LogoutOutlined className="text-3xl text-cyan-400" />
          </div>
          <h4 className="mb-2 text-lg font-semibold text-slate-100">
            Are you sure you want to logout?
          </h4>
          <p className="text-slate-400">
            You will be redirected to the login page.
          </p>
        </div>
      </Modal>

      {/* Floating Action Button */}
      <FloatButton.Group
        shape="circle"
        style={{ right: 24, bottom: 24 }}
        icon={<SettingOutlined className="text-cyan-400" />}
        trigger="hover"
        className="shadow-lg"
      >
        <FloatButton
          icon={<GlobalOutlined />}
          tooltip="View Site"
          onClick={() => window.open("/", "_blank")}
          className="hover:bg-slate-800"
        />
        <FloatButton 
          icon={<FileTextOutlined />} 
          tooltip="Documentation" 
          className="hover:bg-slate-800"
        />
        <FloatButton 
          icon={<DatabaseOutlined />} 
          tooltip="Backup" 
          className="hover:bg-slate-800"
        />
      </FloatButton.Group>
    </Layout>
  );
}