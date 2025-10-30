import React, { useState, useEffect } from 'react';
import { DatePicker, Table, Card, Typography, Spin, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import moment from 'moment';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Added Link import

const { RangePicker } = DatePicker;
const { Title } = Typography;

function ThongKe() {
  const [dates, setDates] = useState([null, null]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy dữ liệu thống kê từ API
  const fetchStats = async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = 'http://localhost:3000/api/articles-views/stats-by-date';
      const params = new URLSearchParams();
      
      if (startDate && endDate) {
        params.append('start_date', startDate.format('YYYY-MM-DD'));
        params.append('end_date', endDate.format('YYYY-MM-DD'));
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      console.log('Fetching URL:', url);
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      setStatsData(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy thống kê:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu theo khoảng ngày
  const filteredData = React.useMemo(() => {
    // Không cần filter ở frontend vì đã filter ở backend
    return statsData;
  }, [statsData]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDateChange = (values) => {
    setDates(values || [null, null]);
    if (values && values[0] && values[1]) {
      fetchStats(values[0], values[1]);
    } else {
      fetchStats();
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lượt xem',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <div className="container py-4">
      <div style={{ display: 'flex', minHeight: '70vh' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: '#f8f9fa', borderRadius: 8, marginRight: 24, padding: '24px 0' }}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left'}}>
              <li style={{ marginBottom: 16 }}>
                <Link to="/admin/taotaikhoan" style={{ color: '#222', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fa fa-users mr-2" /> Quản lý tài khoản
                </Link>
              </li>
              <li>
                <Link to="/admin/quanlydanhmuc" style={{ color: '#222', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fa fa-circle" /> Quản lí danh mục
                </Link>
              </li>
              <li>
                <Link to="/admin/duyetbai" style={{ color: '#222', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fa fa-circle" /> Duyệt bài
                </Link>
              </li>
              <li>
                <Link to="/admin/quanlybaiviet" style={{ color: '#222', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fa fa-circle" /> Quản lí danh sách bài viết
                </Link>
              </li>
              <li>
                <Link to="/admin/thongke" style={{ color: '#222', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fa fa-circle" /> Thống kê
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <Title level={2}>Thống kê lượt xem bài báo theo ngày</Title>
          
          <Card style={{ marginBottom: 24 }}>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              style={{ width: 300 }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Card>

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Card style={{ marginBottom: 24 }}>
            <Spin spinning={loading}>
              <Table
                dataSource={filteredData.map((item, idx) => ({ ...item, key: idx }))}
                columns={columns}
                pagination={false}
                locale={{
                  emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu'
                }}
              />
            </Spin>
          </Card>

          {/* Debug Info */}
          

          <Card>
            <Title level={4}>Biểu đồ lượt xem bài báo</Title>
            <Spin spinning={loading}>
              {filteredData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={d => moment(d).format('DD/MM')} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={d => moment(d).format('DD/MM/YYYY')} />
                    <Bar dataKey="count" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                  {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu để hiển thị'}
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ThongKe;