import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token và lấy thông tin user nếu đã đăng nhập
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.email) setUser(data);
        })
        .catch(() => {});
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Xóa lỗi validation khi user bắt đầu nhập
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({}); // Xóa validation errors cũ
    
    // Kiểm tra validation cơ bản trước khi submit
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        // Xử lý thông báo lỗi từ backend
        const errorMessage = data.message || 'Đăng nhập thất bại';
        
        // Kiểm tra nếu lỗi liên quan đến email
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          setValidationErrors(prev => ({
            ...prev,
            email: errorMessage
          }));
        }
        // Kiểm tra nếu lỗi liên quan đến mật khẩu
        else if (errorMessage.includes('mật khẩu') || errorMessage.includes('Mật khẩu') || 
                 errorMessage.includes('ký tự đặc biệt') || errorMessage.includes('password')) {
          setValidationErrors(prev => ({
            ...prev,
            password: errorMessage
          }));
        }
        // Các lỗi khác hiển thị ở error chung
        else {
          setError(errorMessage);
        }
        return;
      }
      
      // Sau khi đăng nhập user thường thành công:
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);
      setUser(data.user);
      // Điều hướng theo vai trò
      // if (data.user.role === 'Admin') {
      //   navigate('/taotaikhoan');
      // } else 
      
      if (data.user.role === 'Độc giả') {
        navigate('/');
      } else {
        setError('Vai trò không hợp lệ');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="login-logo"
              style={{ cursor: 'pointer' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          </Link>
          <div className="login-title" style={{ display: 'none' }}>
            <h1>LOGO</h1>
          </div>
          <div className="login-title">
            <h1>Đăng nhập</h1>
            <p className="subtitle">Chào mừng bạn quay trở lại!</p>
          </div>
        </div>

        {/* Hiển thị thông tin tài khoản nếu đã đăng nhập */}
        {user && (
          <div className="user-info" style={{ marginBottom: 16, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
            <b>Đã đăng nhập:</b> {user.name} ({user.email})<br/>
            <span>Vai trò: {user.role}</span>
            <button style={{ marginLeft: 16 }} onClick={handleLogout}>Đăng xuất</button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!user && (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? 'error-input' : ''}
              />
              {validationErrors.email && (
                <div className="validation-error">{validationErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={validationErrors.password ? 'error-input' : ''}
              />
              {validationErrors.password && (
                <div className="validation-error">{validationErrors.password}</div>
              )}
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="login-button">
              Đăng nhập
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Chưa có tài khoản? <Link to="/dangky">Đăng ký ngay</Link></p>
          <p>&copy; 2024 Bản quyền thuộc về chúng tôi</p>
        </div>
      </div>
    </div>
  );
}

export default Login; 