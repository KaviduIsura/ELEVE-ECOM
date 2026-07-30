// src/components/admin/dashboard/RecentOrders.jsx
import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RecentOrders = ({ orders = [] }) => {
  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <Text strong className="text-slate-200">{text}</Text>,
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <Text className="text-slate-300">
          {record.shippingInfo?.firstName} {record.shippingInfo?.lastName}
        </Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total",
      key: "total",
      render: (total) => <Text strong className="text-cyan-400">${total?.toFixed(2)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          completed: { color: "green", label: "Completed" },
          pending: { color: "orange", label: "Pending" },
          processing: { color: "blue", label: "Processing" },
          cancelled: { color: "red", label: "Cancelled" },
          preparing: { color: "purple", label: "Preparing" },
          shipped: { color: "cyan", label: "Shipped" },
          delivered: { color: "success", label: "Delivered" }
        };
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return (
          <Tag color={config.color} className="px-3 py-1 rounded-full uppercase text-xs">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <Text className="text-slate-400">{dayjs(date).format('MMM D, YYYY')}</Text>
    },
  ];

  return (
    <Card
      title={<Title level={4} className="!text-slate-100 !mb-0">Recent Orders</Title>}
      className="bg-slate-800 border-0 shadow-md"
      extra={
        <a href="/admin/orders" className="text-slate-300 hover:text-cyan-400">View All</a>
      }
    >
      <Table
        size="middle"
        columns={columns}
        dataSource={orders}
        pagination={false}
        rowKey="_id"
      />
    </Card>
  );
};

export default RecentOrders;