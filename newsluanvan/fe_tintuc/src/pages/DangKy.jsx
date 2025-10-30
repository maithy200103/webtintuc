import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css'; // Dùng lại style của login

function DangKy() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
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
    
    if (!form.name.trim()) {
      errors.name = 'Vui lòng nhập tên';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else {
      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.email = 'Email không hợp lệ';
      }
      
      // Kiểm tra ký tự đặc biệt trong email
      const specialCharsRegex = /[<>\"'&]/;
      if (specialCharsRegex.test(form.email)) {
        errors.email = 'Email không chứa ký tự đặc biệt';
      }
    }
    
    if (!form.password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } 
    // else if (form.password.length < 6) {
    //   errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    // }
    
    if (!form.confirmPassword.trim()) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    }
    
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setValidationErrors({}); // Xóa validation errors cũ
    
    // Kiểm tra validation cơ bản trước khi submit
    if (!validateForm()) {
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3000/api/taotaikhoan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'đọc giả'
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Xử lý thông báo lỗi từ backend
        const errorMessage = data.message || 'Đăng ký thất bại!';
        
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
        // Kiểm tra nếu lỗi liên quan đến tên
        else if (errorMessage.includes('tên') || errorMessage.includes('Tên') || 
                 errorMessage.includes('name')) {
          setValidationErrors(prev => ({
            ...prev,
            name: errorMessage
          }));
        }
        // Các lỗi khác hiển thị ở error chung
        else {
          setError(errorMessage);
        }
        return;
      }
      
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Lỗi kết nối server!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img 
            src="/images/logo.png" 
            alt="Logo" 
            className="login-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="login-title" style={{ display: 'none' }}>
            <h1>LOGO</h1>
          </div>
          <div className="login-title">
            <h1>Đăng ký</h1>
            <p className="subtitle">Tạo tài khoản đọc giả mới</p>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={validationErrors.name ? 'error-input' : ''}
            />
            {validationErrors.name && (
              <div className="validation-error">{validationErrors.name}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
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
              value={form.password}
              onChange={handleChange}
              className={validationErrors.password ? 'error-input' : ''}
            />
            {validationErrors.password && (
              <div className="validation-error">{validationErrors.password}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={validationErrors.confirmPassword ? 'error-input' : ''}
            />
            {validationErrors.confirmPassword && (
              <div className="validation-error">{validationErrors.confirmPassword}</div>
            )}
          </div>
          <button type="submit" className="login-button">
            Đăng ký
          </button>
        </form>
        <div className="login-footer">
          <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          <p>&copy; 2024 Bản quyền thuộc về chúng tôi</p>
        </div>
      </div>
    </div>
  );
}

export default DangKy;