// src/pages/admin/CustomersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Badge,
  Descriptions,
  Row,
  Col,
  Statistic,
  Tooltip,
  Dropdown,
  Avatar,
  Typography,
  Popconfirm,
  message,
  notification,
  Divider,
  Tabs,
  Progress,
  Spin,
  Switch,
  InputNumber,
  Radio
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  BlockOutlined,
  CheckOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from 'axios';

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// API Configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    newThisMonth: 0,
    growthPercentage: 0,
    activePercentage: 0
  });
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [blockReason, setBlockReason] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Status configurations
  const statusConfig = {
    active: { 
      color: '#52c41a', 
      label: 'Active', 
      icon: <CheckCircleOutlined />,
    },
    blocked: { 
      color: '#ff4d4f', 
      label: 'Blocked', 
      icon: <BlockOutlined />,
    },
  };

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/customers', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
          status: filters.status,
        },
      });

      if (response.data.success) {
        const customersData = response.data.customers || [];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        setPagination({
          ...pagination,
          total: response.data.pagination?.totalItems || customersData.length,
        });
        
        // Update stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      notification.error({
        message: 'Error Loading Customers',
        description: error.response?.data?.message || 'Failed to fetch customers',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer stats
  const fetchCustomerStats = async () => {
    try {
      const response = await axiosInstance.get('/api/customers/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  // View customer details
  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await axiosInstance.get(`/api/customers/${customerId}`);
      
      if (response.data.success) {
        setSelectedCustomer(response.data.customer);
        setViewModalVisible(true);
      } else {
        throw new Error(response.data.message || 'Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to fetch customer details',
      });
    }
  };

  // Update customer status (block/unblock)
  const updateCustomerStatus = async (customerId, isBlocked) => {
    try {
      const response = await axiosInstance.put(`/api/customers/${customerId}/status`, {
        isBlocked,
        reason: blockReason
      });

      if (response.data.success) {
        message.success(`Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
        fetchCustomers();
        fetchCustomerStats();
        setBlockModalVisible(false);
        setBlockReason('');
      } else {
        throw new Error(response.data.message || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      notification.error({
        message: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update customer status',
      });
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    try {
      const response = await axiosInstance.delete(`/api/customers/${customerId}`);

      if (response.data.success) {
        message.success('Customer deleted successfully');
        fetchCustomers();
        fetchCustomerStats();
      } else {
        throw new Error(response.data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      notification.error({
        message: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete customer',
      });
    }
  };

  // Export customers to Excel/CSV
  const exportCustomers = async () => {
    setExportLoading(true);
    try {
      const response = await axiosInstance.get('/api/customers', {
        params: {
          limit: 1000, // Get all customers
          search: searchText,
          status: filters.status,
        },
      });

      if (response.data.success) {
        const customersData = response.data.customers || [];
        
        // Convert to CSV format
        const headers = ['Name', 'Email', 'Status', 'Created Date', 'Last Active'];
        const csvData = customersData.map(customer => [
          `${customer.firstName} ${customer.lastName}`,
          customer.email,
          customer.isBlocked ? 'Blocked' : 'Active',
          dayjs(customer.createdAt).format('YYYY-MM-DD'),
          customer.lastLogin ? dayjs(customer.lastLogin).format('YYYY-MM-DD') : 'Never'
        ]);

        const csvContent = [
          headers.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${dayjs().format('YYYY-MM-DD')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Customers exported successfully');
      }
    } catch (error) {
      console.error('Error exporting customers:', error);
      notification.error({
        message: 'Export Failed',
        description: 'Failed to export customers',
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar
            src={record.profilePic}
            icon={<UserOutlined />}
            className="mr-3 border border-slate-800"
            size="large"
          >
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <div>
            <div className="font-medium text-slate-100">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-slate-300">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = record.isBlocked ? 'blocked' : 'active';
        const config = statusConfig[status];
        return (
          <Tag 
            color={config.color} 
            className="px-2 py-1 text-xs capitalize"
            icon={config.icon}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Join Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <div className="text-slate-100">{dayjs(date).format('MMM D, YYYY')}</div>
          <div className="text-xs text-slate-400">{dayjs(date).fromNow()}</div>
        </div>
      ),
    },
    {
      title: 'Last Active',
      key: 'lastActive',
      width: 120,
      render: (_, record) => (
        <div>
          {record.lastLogin ? (
            <>
              <div className="text-slate-100">{dayjs(record.lastLogin).format('MMM D')}</div>
              <div className="text-xs text-slate-400">{dayjs(record.lastLogin).fromNow()}</div>
            </>
          ) : (
            <Tag color="default" className="text-xs">Never</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => viewCustomerDetails(record._id)}
              className="text-slate-300 hover:text-slate-200"
              size="small"
            />
          </Tooltip>
          
          <Tooltip title={record.isBlocked ? "Unblock Customer" : "Block Customer"}>
            <Button
              type="text"
              icon={record.isBlocked ? <CheckOutlined /> : <BlockOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setBlockModalVisible(true);
              }}
              className={record.isBlocked ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
              size="small"
            />
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'sendEmail',
                  label: 'Send Email',
                  icon: <MailOutlined />,
                  onClick: () => {
                    window.location.href = `mailto:${record.email}`;
                  },
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: 'Delete Customer',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Delete Customer',
                      content: `Are you sure you want to delete ${record.firstName} ${record.lastName}? This action cannot be undone.`,
                      okText: 'Delete',
                      cancelText: 'Cancel',
                      okButtonProps: { danger: true },
                      onOk: () => deleteCustomer(record._id),
                    });
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="text-gray-600 hover:text-slate-300"
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Apply filters
  const applyFilters = () => {
    let filtered = [...customers];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(customer =>
        customer.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer => 
        filters.status === 'active' ? !customer.isBlocked : customer.isBlocked
      );
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(customer =>
        dayjs(customer.createdAt).isBetween(start, end, 'day', '[]')
      );
    }

    setFilteredCustomers(filtered);
  };

  // Handle table change
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchCustomers();
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, [pagination.current, pagination.pageSize]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, searchText, customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Title level={2} className="!text-slate-100">
            Customers Management
          </Title>
          <Text className="text-slate-300">
            Manage and track your customer base efficiently
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchCustomers();
              fetchCustomerStats();
            }}
            loading={loading}
            className="text-slate-300 border-slate-700 hover:text-slate-200 hover:border-slate-600"
          >
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportCustomers}
            loading={exportLoading}
            className="text-slate-300 border-slate-700 hover:text-slate-200 hover:border-slate-600"
          >
            Export
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="transition-shadow bg-slate-800 border-0 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {stats.total}
                </div>
                <div className="text-sm text-slate-300">
                  Total Customers
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  All registered customers
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800">
                <TeamOutlined className="text-xl text-slate-300" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="transition-shadow bg-slate-800 border-0 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-sm text-slate-300">
                  Active Customers
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats.activePercentage}% of total
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
                <CheckCircleOutlined className="text-xl text-green-600" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="transition-shadow bg-slate-800 border-0 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.blocked}
                </div>
                <div className="text-sm text-slate-300">
                  Blocked Customers
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats.total > 0 ? ((stats.blocked / stats.total) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50">
                <BlockOutlined className="text-xl text-red-600" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="transition-shadow bg-slate-800 border-0 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {stats.newThisMonth}
                </div>
                <div className="text-sm text-slate-300">
                  New This Month
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {stats.growthPercentage}% growth
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
                <BarChartOutlined className="text-xl text-blue-600" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card
        className="bg-slate-800 border-0 shadow-sm"
        title={
          <div className="flex items-center">
            <FilterOutlined className="mr-2 text-slate-300" />
            <span className="text-slate-100">Filters</span>
          </div>
        }
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined className="text-cyan-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border-slate-700 hover:border-slate-600 focus:border-teal-500"
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              className="border-slate-700 hover:border-slate-600"
            >
              <Option value="all">All Customers</Option>
              <Option value="active">Active Only</Option>
              <Option value="blocked">Blocked Only</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              className="border-slate-700 hover:border-slate-600"
              placeholder={['Join Date From', 'Join Date To']}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button
              block
              onClick={() => {
                setSearchText('');
                setFilters({
                  status: 'all',
                  dateRange: null,
                });
              }}
              className="text-slate-300 border-slate-700 hover:text-slate-200 hover:border-slate-600"
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Customers Table */}
      <Card
        className="bg-slate-800 border-0 shadow-sm"
        title={
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Title level={4} className="!mb-0 !text-slate-100">
                All Customers
              </Title>
              <Text className="text-slate-300">
                {filteredCustomers.length} customers found • {stats.active} active • {stats.blocked} blocked
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-slate-300">
                Showing {((pagination.current - 1) * pagination.pageSize) + 1}-
                {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total}
              </Text>
              <Progress
                percent={Math.round((filteredCustomers.length / (pagination.total || 1)) * 100)}
                size="small"
                strokeColor="#08979c"
                showInfo={false}
                style={{ width: 100 }}
              />
            </div>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <Text className="text-slate-300">
                  {range[0]}-{range[1]} of {total} customers
                </Text>
              ),
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            rowClassName="hover:bg-slate-800 transition-colors"
          />
        </Spin>
      </Card>

      {/* Customer Details Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div>
              <Title level={3} className="!mb-0 !text-slate-100">
                Customer Details
              </Title>
              <Text type="secondary" className="text-slate-300">
                Customer since {selectedCustomer && dayjs(selectedCustomer.createdAt).format('MMMM D, YYYY')}
              </Text>
            </div>
            <div>
              <Tag 
                color={selectedCustomer?.isBlocked ? 'red' : 'green'} 
                className="px-3 py-1 capitalize"
              >
                {selectedCustomer?.isBlocked ? 'Blocked' : 'Active'}
              </Tag>
            </div>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="block"
            type="primary"
            danger={!selectedCustomer?.isBlocked}
            onClick={() => {
              setViewModalVisible(false);
              setBlockModalVisible(true);
            }}
            icon={selectedCustomer?.isBlocked ? <CheckOutlined /> : <BlockOutlined />}
          >
            {selectedCustomer?.isBlocked ? 'Unblock Customer' : 'Block Customer'}
          </Button>,
        ]}
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <Avatar
                    size={120}
                    src={selectedCustomer.profilePic}
                    icon={<UserOutlined />}
                    className="mb-4 border-4 border-slate-800"
                  >
                    {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                  </Avatar>
                  <Title level={4} className="!mb-1 !text-slate-100">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </Title>
                  <Text className="text-slate-300">{selectedCustomer.email}</Text>
                </div>
              </Col>

              <Col xs={24} md={16}>
                <Tabs defaultActiveKey="details">
                  <TabPane tab="Customer Information" key="details">
                    <Descriptions column={1} size="middle">
                      <Descriptions.Item label="Full Name" className="text-slate-100">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email Address" className="text-slate-100">
                        {selectedCustomer.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Account Status" className="text-slate-100">
                        <Tag color={selectedCustomer.isBlocked ? 'red' : 'green'}>
                          {selectedCustomer.isBlocked ? 'Blocked' : 'Active'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Account Type" className="text-slate-100">
                        <Tag color="blue" className="capitalize">
                          {selectedCustomer.type}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Member Since" className="text-slate-100">
                        {dayjs(selectedCustomer.createdAt).format('MMMM D, YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Login" className="text-slate-100">
                        {selectedCustomer.lastLogin 
                          ? dayjs(selectedCustomer.lastLogin).format('MMMM D, YYYY h:mm A')
                          : 'Never logged in'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Account ID" className="text-slate-100">
                        <Text code>{selectedCustomer._id}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  <TabPane tab="Account Activity" key="activity">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-800">
                        <Text strong className="block mb-2 text-slate-100">
                          Account Statistics
                        </Text>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Text className="text-slate-300">Days as Member:</Text>
                            <Text strong className="text-slate-100">
                              {Math.floor((new Date() - new Date(selectedCustomer.createdAt)) / (1000 * 60 * 60 * 24))} days
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Block/Unblock Modal */}
      <Modal
        title={
          <div className="flex items-center">
            {selectedCustomer?.isBlocked ? (
              <>
                <CheckOutlined className="mr-2 text-green-600" />
                <span className="text-slate-100">Unblock Customer</span>
              </>
            ) : (
              <>
                <BlockOutlined className="mr-2 text-red-600" />
                <span className="text-slate-100">Block Customer</span>
              </>
            )}
          </div>
        }
        open={blockModalVisible}
        onCancel={() => {
          setBlockModalVisible(false);
          setBlockReason('');
        }}
        onOk={() => {
          if (selectedCustomer) {
            updateCustomerStatus(selectedCustomer._id, !selectedCustomer.isBlocked);
          }
        }}
        okText={selectedCustomer?.isBlocked ? "Unblock Customer" : "Block Customer"}
        okButtonProps={{
          danger: !selectedCustomer?.isBlocked,
          type: 'primary',
          className: selectedCustomer?.isBlocked ? 'bg-green-600 hover:bg-green-700' : '',
        }}
        cancelButtonProps={{
          className: 'border-slate-700 text-slate-300 hover:text-slate-200',
        }}
        width={500}
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-800">
              <div className="flex items-center space-x-3">
                <Avatar
                  size={48}
                  src={selectedCustomer.profilePic}
                  icon={<UserOutlined />}
                  className="border-2 border-slate-700"
                >
                  {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                </Avatar>
                <div>
                  <Text strong className="text-slate-100">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </Text>
                  <div className="text-sm text-slate-300">{selectedCustomer.email}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-50">
              <div className="flex items-start">
                <ExclamationCircleOutlined className="mt-1 mr-2 text-yellow-600" />
                <div>
                  <Text strong className="text-yellow-700">
                    {selectedCustomer.isBlocked ? "Unblocking this customer will:" : "Blocking this customer will:"}
                  </Text>
                  <ul className="mt-1 ml-4 text-sm text-yellow-600 list-disc">
                    {selectedCustomer.isBlocked ? (
                      <>
                        <li>Allow them to login to their account</li>
                        <li>Allow them to make purchases</li>
                        <li>Restore their account access immediately</li>
                      </>
                    ) : (
                      <>
                        <li>Prevent them from logging in</li>
                        <li>Block all future purchases</li>
                        <li>Keep their data in the system</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <Form layout="vertical">
              <Form.Item
                label={
                  <div className="flex items-center">
                    <span className="text-slate-200">
                      {selectedCustomer.isBlocked ? "Unblock Reason (Optional)" : "Block Reason"}
                    </span>
                    {!selectedCustomer.isBlocked && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </div>
                }
              >
                <Input.TextArea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={
                    selectedCustomer.isBlocked
                      ? "Optional: Enter reason for unblocking..."
                      : "Enter reason for blocking this customer..."
                  }
                  className="border-slate-700 hover:border-slate-600"
                  required={!selectedCustomer.isBlocked}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;