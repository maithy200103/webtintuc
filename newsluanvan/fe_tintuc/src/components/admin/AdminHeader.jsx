import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AdminHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const name = localStorage.getItem('adminName');
    const email = localStorage.getItem('adminEmail');
    const role = localStorage.getItem('adminRole');
    if (name && email) {
      setAdminInfo({ name, email, role });
    }
  }, []);

  
  // Đăng xuất
  const handleLogout = () => {
    // Xóa tất cả thông tin user và admin
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    
    // Xóa thông tin admin
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminInfo');
    
    navigate('/');
  };

  return (
    <header style={{ background: '#222', color: '#fff', padding: '0.5rem 0' }}>
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img src="/images/logo.png" alt="Admin Logo" style={{ height: 40, marginRight: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 22 }}>ADMIN PANEL</span>
        </div>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/admin/taotaikhoan" className={`nav-link${location.pathname.includes('taotaikhoan') ? ' active' : ''}`} style={{ color: '#fff' }}>Tài khoản</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/duyetbai" className={`nav-link${location.pathname.includes('duyettin') ? ' active' : ''}`} style={{ color: '#fff' }}>Duyệt bài</Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/quanlydanhmuc" className={`nav-link${location.pathname.includes('quanlydanhmuc') ? ' active' : ''}`} style={{ color: '#fff' }}>Quản lí danh mục</Link>
            </li>
            
            <li
              className="nav-item position-relative"
              onMouseEnter={() => setShowArticleMenu(true)}
              onMouseLeave={() => setShowArticleMenu(false)}
            >
              <Link
                to="/admin/quanlybaiviet"
                className={`nav-link${location.pathname.includes('quanlybaiviet') ? ' active' : ''}`}
                style={{ color: '#fff' }}
              >
                Quản lí bài viết
                
              </Link>
              {showArticleMenu && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: 200,
                    background: '#fff',
                    color: '#222',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    marginTop: 2,
                  }}
                >
                  <li>
                    <Link className="dropdown-item" to="/admin/quanlybaiviet?status=approved">
                      Bài báo đã duyệt
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/quanlybaiviet?status=pending">
                      Bài báo chưa duyệt
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/quanlybaiviet?status=rejected">
                      Bài báo bị từ chối
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="nav-item">
              <Link to="/admin/thongke" className={`nav-link${location.pathname.includes('thongke') ? ' active' : ''}`} style={{ color: '#fff' }}>Thống kê</Link>
            </li>
          </ul>
        </nav>
        <div
          className="position-relative"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setShowUserMenu(true)}
          onMouseLeave={() => setShowUserMenu(false)}
        >
          <i className="fa fa-user-circle" style={{ fontSize: 28, color: '#fff' }} />
          {showUserMenu && (
            <div
              style={{
                position: 'fixed',
                top: 60,
                right: 20,
                background: '#fff',
                color: '#222',
                border: '1px solid #ddd',
                borderRadius: 4,
                minWidth: 200,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: 16,
              }}
            >
              <div><b>{adminInfo.name}</b></div>
              <div style={{ fontSize: 13, color: '#666' }}>{adminInfo.email}</div>
              <hr />
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader; 