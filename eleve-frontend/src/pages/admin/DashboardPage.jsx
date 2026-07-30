// src/pages/admin/DashboardPage.jsx
import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import StatsCards from '../../components/admin/dashboard/StatsCards';
import RecentOrders from '../../components/admin/dashboard/RecentOrders';
import QuickActions from '../../components/admin/dashboard/QuickActions';

const { Title, Text } = Typography;

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-slate-800 to-slate-900">
        <Row align="middle">
          <Col xs={24} md={16}>
            <Title level={3} className="!text-slate-100">
              Welcome back, Alexander! 👋
            </Title>
            <Text className="text-slate-300">
              Here's what's happening with your store today. You have 12 new
              orders, 3 new reviews, and 5 new customers.
            </Text>
          </Col>
          <Col xs={24} md={8} className="text-right">
            <Button
              type="primary"
              size="large"
              className="border-0 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
            >
              View Reports
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats Grid */}
      <StatsCards />

      {/* Charts and Recent Orders */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <RecentOrders />
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Title level={4} className="!text-slate-100">Top Products</Title>}
            className="bg-slate-800 border-0 shadow-md"
          >
            {/* Add Top Products List here */}
            <div className="py-8 text-center text-slate-300">
              Top Products List
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default DashboardPage;