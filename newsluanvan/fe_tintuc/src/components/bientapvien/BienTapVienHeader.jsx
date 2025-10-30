import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function BienTapVienHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const name = localStorage.getItem('adminName');
    const email = localStorage.getItem('adminEmail');
    const role = localStorage.getItem('adminRole');
    if (name && email) {
      setAdminInfo({ name, email, role });
    }
    // Lấy danh mục
    fetch('http://localhost:3000/api/category')
      .then(res => res.json())
      .then(data => setCategories(data.sort((a, b) => a.order - b.order)))
      .catch(() => setCategories([]));
  }, []);

  // Thêm hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    setAdminInfo(null);
    navigate('/login_ad-btv');
  };

  return (
    <header style={{ background: '#222', color: '#fff', padding: '0.5rem 0' }}>
      <div className="container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <img src="/images/logo.png" alt="Admin Logo" style={{ height: 40, marginRight: 16 }} />
          <span style={{ fontWeight: 700, fontSize: 22 }}>BIÊN TẬP VIÊN PANEL</span>
        </div>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/bientapvien/soanthao" className={`nav-link${location.pathname.includes('soanthao') ? ' active' : ''}`} style={{ color: '#fff' }}>Soạn thảo</Link>
            </li>
            <li className="nav-item">
              <Link to="/bientapvien/quanlybaibao" className={`nav-link${location.pathname.includes('quanlybaibao') ? ' active' : ''}`} style={{ color: '#fff' }}>Quản lý bài báo</Link>
            </li>
            <li className="nav-item">
              <Link to="/bientapvien/bannhap" className={`nav-link${location.pathname.includes('bannhap') ? ' active' : ''}`} style={{ color: '#fff' }}>Danh sách nháp</Link>
            </li>
          </ul>
        </nav>
        <div
          className="position-relative"
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <i
            className="fa fa-user-circle"
            style={{ fontSize: 28, color: '#fff' }}
            onClick={() => setShowUserMenu(v => !v)}
          />
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                background: '#fff',
                color: '#222',
                border: '1px solid #ddd',
                borderRadius: 4,
                minWidth: 200,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: 16,
              }}
              onClick={e => e.stopPropagation()}
            >
              {adminInfo ? (
                <>
                  <div><b>{adminInfo.name}</b></div>
                  <div style={{ fontSize: 13, color: '#666' }}>{adminInfo.email}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{adminInfo.role}</div>
                </>
              ) : (
                <div>Chưa đăng nhập</div>
              )}
              <hr />
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default BienTapVienHeader; 