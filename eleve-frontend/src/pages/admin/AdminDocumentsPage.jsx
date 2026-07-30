import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Popconfirm,
  message,
  Space
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// API Configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/documents');
      if (response.data.success) {
        setDocuments(response.data.documents);
      } else {
        message.error("Failed to load documents.");
      }
    } catch (error) {
      console.error("Fetch docs error:", error);
      message.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (values) => {
    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/documents', values);
      if (response.data.success) {
        message.success(response.data.message);
        setModalVisible(false);
        form.resetFields();
        fetchDocuments();
      } else {
        message.error(response.data.error || "Failed to add document.");
      }
    } catch (error) {
      console.error("Add doc error:", error);
      message.error("Failed to generate AI embedding and save document.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/documents/${id}`);
      if (response.data.success) {
        message.success(response.data.message);
        fetchDocuments();
      } else {
        message.error("Failed to delete document.");
      }
    } catch (error) {
      console.error("Delete doc error:", error);
      message.error("Error deleting document.");
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong className="text-teal-700">{text}</Text>,
    },
    {
      title: 'Content Snippet',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <Text type="secondary">
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </Text>
      ),
    },
    {
      title: 'Added On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Delete this document?"
            description="The AI Chatbot will no longer be able to reference this information."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="text" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={2} className="!mb-1 !text-teal-800">
            AI Knowledge Base
          </Title>
          <Text className="text-teal-600">
            Manage custom documents (Policies, FAQs) that the ELEVÉ Chatbot uses to answer questions.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-teal-600 hover:bg-teal-700 shadow-md"
          onClick={() => setModalVisible(true)}
        >
          Add Document
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm rounded-xl border-teal-100">
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add Document Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2 text-teal-800">
            <FileTextOutlined className="text-xl" />
            <span>Add New Knowledge Base Document</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
          <Text className="text-teal-700 text-sm">
            When you save this document, the backend will automatically send this text to OpenAI to generate a vector embedding. This allows the chatbot to retrieve this information instantly when customers ask related questions.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDocument}
        >
          <Form.Item
            name="title"
            label={<span className="text-teal-800 font-medium">Document Title (e.g., Return Policy)</span>}
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter document title..." size="large" />
          </Form.Item>

          <Form.Item
            name="content"
            label={<span className="text-teal-800 font-medium">Document Content</span>}
            rules={[{ required: true, message: 'Please enter the content' }]}
          >
            <TextArea 
              placeholder="Enter the full text content here..." 
              rows={8} 
              className="resize-y"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Save & Embed Document
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
