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
  message,
  Tooltip,
  Modal,
  Spin,
  Badge
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
  MessageOutlined,
  RobotOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    sentiment: 'all',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1
  });

  // AI Summary modal state
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    loading: false,
    text: '',
    productName: '',
    count: 0
  });

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sentiment !== 'all') params.append('sentiment', filters.sentiment);
      params.append('page', filters.page);
      params.append('limit', 10);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews?${params.toString()}`,
        {
          headers: { Authorization: "Bearer " + token },
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

  // ─── Review Actions ─────────────────────────────────────────────────────────

  const updateReviewStatus = async (reviewId, status, adminComment = '') => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${reviewId}/status`,
        { status, adminComment },
        { headers: { Authorization: "Bearer " + token } }
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
        { headers: { Authorization: "Bearer " + token } }
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
        { headers: { Authorization: "Bearer " + token } }
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

  // ─── AI Summary ─────────────────────────────────────────────────────────────

  const generateSummary = async (productId, productName) => {
    setSummaryModal({ open: true, loading: true, text: '', productName, count: 0 });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/review-summary/${productId}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      if (res.data.success) {
        setSummaryModal(prev => ({
          ...prev,
          loading: false,
          text: res.data.summary,
          count: res.data.reviewCount
        }));
      } else {
        message.warning(res.data.message);
        setSummaryModal(prev => ({ ...prev, open: false, loading: false }));
      }
    } catch (e) {
      console.error("Summary error:", e);
      message.error("Failed to generate AI summary");
      setSummaryModal(prev => ({ ...prev, open: false, loading: false }));
    }
  };

  // ─── Display Helpers ────────────────────────────────────────────────────────

  const getStatusTag = (status) => {
    switch (status) {
      case 'approved':
        return <Tag icon={<CheckCircleOutlined />} color="success">Approved</Tag>;
      case 'rejected':
        return <Tag icon={<CloseCircleOutlined />} color="error">Rejected</Tag>;
      case 'flagged':
        return <Tag icon={<AlertOutlined />} color="volcano">Auto-Flagged</Tag>;
      case 'pending':
      default:
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
    }
  };

  const getSentimentTag = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return (
          <Tag icon={<SmileOutlined />} color="green">
            Positive
          </Tag>
        );
      case 'negative':
        return (
          <Tag icon={<FrownOutlined />} color="red">
            Negative
          </Tag>
        );
      case 'neutral':
        return (
          <Tag icon={<MehOutlined />} color="blue">
            Neutral
          </Tag>
        );
      default:
        return null; // old reviews without AI analysis — show nothing
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const flaggedCount = reviews.filter(r => r.status === 'flagged' || r.flagged).length;

  // ─── Table Columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'Customer & Product',
      key: 'customer',
      width: '28%',
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
                {/* AI Summary button per product */}
                <Button
                  size="small"
                  type="link"
                  icon={<RobotOutlined />}
                  onClick={() => generateSummary(record.productId._id, record.productId.productName)}
                  className="p-0 mt-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  AI Summary
                </Button>
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Rating & Review',
      key: 'review',
      width: '38%',
      render: (_, record) => (
        <div className="flex flex-col">
          <Space className="mb-2">
            <Rate disabled defaultValue={record.rating} className="text-sm text-yellow-400" />
            <Text strong className="text-slate-200">{record.rating}/5</Text>
          </Space>
          <Text className="text-slate-300 line-clamp-3">{record.review}</Text>
          {record.flagReason && (
            <div className="p-2 mt-2 text-sm rounded bg-red-950 border border-red-800">
              <Text strong className="text-red-400">
                <AlertOutlined className="mr-1" />AI Flag Reason:{' '}
              </Text>
              <Text className="text-red-300">{record.flagReason}</Text>
            </div>
          )}
          {record.adminComment && (
            <div className="p-2 mt-2 text-sm rounded bg-slate-800 border border-slate-700">
              <Text strong className="text-cyan-400">
                <MessageOutlined className="mr-1" />Admin Note:{' '}
              </Text>
              <Text className="text-slate-300">{record.adminComment}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status & AI',
      key: 'status',
      width: '18%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {getStatusTag(record.status)}
          {/* AI Flagged badge with tooltip */}
          {record.flagged && (
            <Tooltip title={record.flagReason || 'Auto-flagged by AI moderation'}>
              <Tag icon={<AlertOutlined />} color="volcano" className="cursor-help">
                🚨 AI Flagged
              </Tag>
            </Tooltip>
          )}
          {/* Sentiment badge */}
          {getSentimentTag(record.sentiment)}
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
      width: '16%',
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          {/* Approve/Reject for pending & flagged reviews */}
          {(record.status === 'pending' || record.status === 'flagged') && (
            <Space className="w-full">
              <Tooltip title="Approve this review">
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-600 hover:bg-green-500 border-0"
                  icon={<CheckCircleOutlined />}
                  onClick={() => updateReviewStatus(record._id, 'approved')}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject this review">
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
              </Tooltip>
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

  // ─── Row Styling: highlight flagged rows ────────────────────────────────────
  const rowClassName = (record) => {
    if (record.status === 'flagged' || record.flagged) {
      return 'bg-red-950/30 border-l-2 border-red-600';
    }
    return '';
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1 !text-slate-100">Customer Reviews</Title>
          <Text className="text-slate-400">Manage and moderate product reviews with AI assistance</Text>
        </div>
        <Tag
          icon={<RobotOutlined />}
          color="cyan"
          className="text-sm px-3 py-1"
        >
          AI Moderation Active
        </Tag>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Pending</Text>
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
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Approved</Text>
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
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm bg-slate-800 border border-red-900">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-red-400 font-medium">🚨 AI Flagged</Text>
                <Title level={2} className="!mt-1 !mb-0 !text-red-400">
                  {reviews.filter(r => r.status === 'flagged' || r.flagged).length}
                </Title>
              </div>
              <div className="p-3 rounded-xl bg-red-950">
                <AlertOutlined className="text-2xl text-red-500" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="border-0 shadow-sm bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-slate-400">Total Reviews</Text>
                <Title level={2} className="!mt-1 !mb-0 !text-slate-100">
                  {pagination.total || reviews.length}
                </Title>
              </div>
              <div className="p-3 rounded-xl bg-slate-700">
                <MessageOutlined className="text-2xl text-cyan-500" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card className="border-0 shadow-sm bg-slate-800">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:flex-wrap">
          <Search
            placeholder="Search by name, email, or review content..."
            allowClear
            onSearch={(value) => setFilters(prev => ({ ...prev, search: value, page: 1 }))}
            style={{ maxWidth: 360 }}
            size="large"
            className="flex-1"
          />
          {/* Status filter */}
          <Select
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            style={{ width: 160 }}
            size="large"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'flagged', label: '🚨 Auto-Flagged' },
            ]}
            suffixIcon={<FilterOutlined />}
          />
          {/* AI Sentiment filter */}
          <Select
            value={filters.sentiment}
            onChange={(value) => setFilters(prev => ({ ...prev, sentiment: value, page: 1 }))}
            style={{ width: 175 }}
            size="large"
            options={[
              { value: 'all', label: '🤖 All Sentiment' },
              { value: 'positive', label: '😊 Positive' },
              { value: 'neutral', label: '😐 Neutral' },
              { value: 'negative', label: '😞 Negative' },
            ]}
            suffixIcon={<RobotOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="_id"
          loading={loading}
          rowClassName={rowClassName}
          pagination={{
            current: filters.page,
            pageSize: 10,
            total: pagination.total,
            onChange: (page) => setFilters(prev => ({ ...prev, page }))
          }}
          className="overflow-hidden"
        />
      </Card>

      {/* AI Review Summary Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined className="text-cyan-400" />
            <span className="text-slate-100">AI Review Summary</span>
            {summaryModal.productName && (
              <Text className="text-slate-400 font-normal text-sm">
                — {summaryModal.productName}
              </Text>
            )}
          </Space>
        }
        open={summaryModal.open}
        onCancel={() => setSummaryModal(prev => ({ ...prev, open: false }))}
        footer={
          !summaryModal.loading && (
            <Button
              onClick={() => setSummaryModal(prev => ({ ...prev, open: false }))}
              className="border-slate-600 text-slate-300"
            >
              Close
            </Button>
          )
        }
        styles={{
          content: { backgroundColor: '#1e293b', border: '1px solid #334155' },
          header: { backgroundColor: '#1e293b', borderBottom: '1px solid #334155' },
          footer: { backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
          mask: { backdropFilter: 'blur(4px)' }
        }}
      >
        {summaryModal.loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Spin size="large" />
            <Text className="text-slate-400">Analyzing {summaryModal.productName} reviews with AI...</Text>
          </div>
        ) : (
          <div className="py-2">
            <Text className="text-slate-400 text-sm block mb-4">
              Based on <strong className="text-cyan-400">{summaryModal.count}</strong> approved reviews:
            </Text>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 border border-slate-600">
              <RobotOutlined className="text-cyan-400 text-lg mb-3 block" />
              <Text className="text-slate-200 leading-relaxed text-base">
                {summaryModal.text}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}