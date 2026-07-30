// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Spin, message, List, Avatar } from 'antd';
import StatsCards from '../../components/admin/dashboard/StatsCards';
import RecentOrders from '../../components/admin/dashboard/RecentOrders';
import QuickActions from '../../components/admin/dashboard/QuickActions';
import axios from 'axios';

const { Title, Text } = Typography;

// API Configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstance.get('/api/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          message.error('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        message.error('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-slate-800 to-slate-900">
        <Row align="middle">
          <Col xs={24} md={16}>
            <Title level={3} className="!text-slate-100">
              Welcome back to your Dashboard! 👋
            </Title>
            <Text className="text-slate-300">
              Here's what's happening with your store today. You have {stats?.recentOrders?.length || 0} recent orders to process.
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
      <StatsCards stats={stats} />

      {/* Charts and Recent Orders */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <RecentOrders orders={stats?.recentOrders || []} />
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Title level={4} className="!text-slate-100 !mb-0">Top Products</Title>}
            className="bg-slate-800 border-0 shadow-md"
            bodyStyle={{ padding: 0 }}
          >
            <List
              dataSource={stats?.topProducts || []}
              renderItem={item => (
                <List.Item className="px-6 py-4 border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={48} src={item.image} />}
                    title={<Text strong className="text-slate-100">{item.name}</Text>}
                    description={<Text className="text-slate-400">{item.totalSold} items sold</Text>}
                  />
                  <div className="text-right">
                    <Text strong className="text-cyan-400 block">${item.revenue.toFixed(2)}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default DashboardPage;