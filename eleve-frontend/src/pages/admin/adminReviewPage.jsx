import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Card,
  Input,
  Select,
  Tag,
  Button,
  Popconfirm,
  Space,
  Typography,
  Row,
  Col,
  Rate,
  Avatar,
  message
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  AlertOutlined,
  MessageOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', 10);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews?${params.toString()}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const updateReviewStatus = async (reviewId, status, adminComment = '') => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/status`,
        { status, adminComment },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.data.success) {
        message.success(`Review ${status} successfully`);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error updating review status:", error);
      message.error("Failed to update review status");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.data.success) {
        message.success("Review deleted successfully");
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      message.error("Failed to delete review");
    }
  };

  const toggleVisibility = async (reviewId, currentHidden) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/visibility`,
        { hidden: !currentHidden },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.data.success) {
        message.success(`Review ${!currentHidden ? 'hidden' : 'made visible'}`);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      message.error("Failed to update review visibility");
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'approved':
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case 'rejected':
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      case 'pending':
      default:
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
    }
  };

  const columns = [
    {
      title: 'Customer & Product',
      key: 'customer',
      width: '25%',
      render: (_, record) => (
        <Space align="start">
          <Avatar src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />
          <div className="flex flex-col">
            <Text strong className="text-slate-100">{record.userName}</Text>
            <Text type="secondary" className="text-xs text-slate-400">{record.email}</Text>
            {record.productId && (
              <div className="mt-2">
                <Text className="text-xs font-medium text-slate-300">
                  {record.productId.productName}
                </Text>
                {record.productId.images?.[0] && (
                  <img
                    src={record.productId.images[0]}
                    alt={record.productId.productName}
                    className="object-cover w-12 h-12 mt-1 rounded"
                  />
                )}
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Rating & Review',
      key: 'review',
      width: '40%',
      render: (_, record) => (
        <div className="flex flex-col">
          <Space className="mb-2">
            <Rate disabled defaultValue={record.rating} className="text-sm text-yellow-400" />
            <Text strong className="text-slate-200">{record.rating}/5</Text>
          </Space>
          <Text className="text-slate-300 line-clamp-3">{record.review}</Text>
          {record.adminComment && (
            <div className="p-2 mt-2 text-sm rounded bg-slate-800 border border-slate-700">
              <Text strong className="text-cyan-400"><MessageOutlined className="mr-1"/>Admin Note: </Text>
              <Text className="text-slate-300">{record.adminComment}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: '15%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {getStatusTag(record.status)}
          {record.hidden && (
            <Tag icon={<EyeInvisibleOutlined />} color="default">Hidden</Tag>
          )}
          <Text type="secondary" className="text-xs text-slate-400">
            {dayjs(record.createdAt).format('MMM D, YYYY')}
          </Text>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          {record.status === 'pending' && (
            <Space className="w-full">
              <Button
                type="primary"
                size="small"
                className="bg-green-600 hover:bg-green-500 border-0"
                icon={<CheckCircleOutlined />}
                onClick={() => updateReviewStatus(record._id, 'approved')}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  const comment = prompt("Rejection reason (optional):");
                  if (comment !== null) {
                    updateReviewStatus(record._id, 'rejected', comment);
                  }
                }}
              >
                Reject
              </Button>
            </Space>
          )}
          
          <Space className="w-full">
            <Button
              size="small"
              icon={record.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => toggleVisibility(record._id, record.hidden)}
              className="w-24 text-slate-300 border-slate-600 hover:text-cyan-400 hover:border-cyan-400"
            >
              {record.hidden ? "Show" : "Hide"}
            </Button>
            
            <Popconfirm
              title="Delete Review"
              description="Are you sure you want to delete this review permanently?"
              onConfirm={() => deleteReview(record._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Title level={2} className="!mb-1 !text-slate-100">Customer Reviews</Title>
        <Text className="text-slate-400">Manage and moderate product reviews</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Pending Reviews</Text>
                <Title level={2} className="!mt-1 !mb-0 !text-slate-100">
                  {reviews.filter(r => r.status === 'pending').length}
                </Title>
              </div>
              <div className="p-3 rounded-xl bg-slate-700">
                <ClockCircleOutlined className="text-2xl text-yellow-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Approved Reviews</Text>
                <Title level={2} className="!mt-1 !mb-0 !text-slate-100">
                  {reviews.filter(r => r.status === 'approved').length}
                </Title>
              </div>
              <div className="p-3 rounded-xl bg-slate-700">
                <CheckCircleOutlined className="text-2xl text-green-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Total Reviews</Text>
                <Title level={2} className="!mt-1 !mb-0 !text-slate-100">
                  {reviews.length}
                </Title>
              </div>
              <div className="p-3 rounded-xl bg-slate-700">
                <AlertOutlined className="text-2xl text-cyan-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card className="border-0 shadow-sm bg-slate-800">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <Search
            placeholder="Search by name, email, or review content..."
            allowClear
            onSearch={(value) => setFilters(prev => ({ ...prev, search: value, page: 1 }))}
            style={{ maxWidth: 400 }}
            size="large"
            className="flex-1"
          />
          <Select
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            style={{ width: 200 }}
            size="large"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            suffixIcon={<FilterOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: 10,
            total: pagination.total,
            onChange: (page) => setFilters(prev => ({ ...prev, page }))
          }}
          className="overflow-hidden"
        />
      </Card>
    </div>
  );
}