import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const initialUsers = [
  { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, name: 'Nguyễn Văn Đọc', email: 'docgia@example.com', role: 'đọc giả' },
  { id: 3, name: 'Trần Tác Giả', email: 'tacgia@example.com', role: 'tác giả' },
  { id: 4, name: 'Lê Duyệt Tin', email: 'duyettin@example.com', role: 'duyệt tin' },
];

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Biên tập viên', value: 'biên tập viên' }
];

function TaoTaiKhoan() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [roleToAdd, setRoleToAdd] = useState('');
  const [success, setSuccess] = useState('');
  const [roleSuccess, setRoleSuccess] = useState(''); // Thông báo riêng cho modal vai trò
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Hàm load danh sách users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/taotaikhoan');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
      console.error('Lỗi load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
    } else if (form.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({}); // Xóa validation errors cũ
    
    // Kiểm tra validation trước khi submit
    if (!validateForm()) {
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3000/api/taotaikhoan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Xử lý thông báo lỗi từ backend
        const errorMessage = data.message || 'Lỗi tạo tài khoản!';
        
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
      
      // Reset form và đóng modal
      setForm({ name: '', email: '', password: '', role: 'admin' });
      setError('');
      setShowForm(false);
      
      // Hiển thị thông báo thành công
      setSuccess('Tạo tài khoản thành công!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload danh sách users
      await loadUsers();
    } catch (err) {
      setError('Lỗi kết nối server!');
    }
  };

  const currentUserEmail = localStorage.getItem('adminEmail'); // hoặc adminId nếu có

  const handleDelete = async (id, email) => {
    if (email === currentUserEmail) {
      alert('Bạn không thể xóa chính mình');
      return;
    }
    
    // Xác nhận ngắn gọn
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/taotaikhoan/${id}`, {
        method: 'DELETE',
        headers: {
          'x-current-user-id': localStorage.getItem('adminId'), // nếu dùng id
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Lỗi xóa người dùng!');
        return;
      }
      
      // Hiển thị thông báo thành công
      setSuccess('Xóa người dùng thành công!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload danh sách users
      await loadUsers();
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };

  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleShowRole = async (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);

    // Lấy tất cả vai trò
    const rolesRes = await fetch('http://localhost:3000/api/roles');
    const rolesData = await rolesRes.json();
    setAllRoles(rolesData);

    // Lấy vai trò của user
    const userRolesRes = await fetch(`http://localhost:3000/api/user_role?user_id=${user.id}`);
    const userRolesData = await userRolesRes.json();
    setUserRoles(userRolesData);
  };

  // Thêm vai trò cho user
  const handleAddRole = async () => {
    if (!roleToAdd) return;
    try {
      const res = await fetch('http://localhost:3000/api/user_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id, role_id: roleToAdd }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Lỗi thêm vai trò!');
        return;
      }
      
      // Reload lại vai trò user
      const userRolesRes = await fetch(`http://localhost:3000/api/user_role?user_id=${selectedUser.id}`);
      const userRolesData = await userRolesRes.json();
      setUserRoles(userRolesData);
      setRoleToAdd('');
      
      // Reload lại danh sách users chính
      await loadUsers();
      
      // Hiển thị thông báo thành công
      setRoleSuccess('Thêm vai trò thành công!');
      setTimeout(() => setRoleSuccess(''), 3000);
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };

  // Xóa vai trò khỏi user
  const handleDeleteRole = async (role_id) => {
    // Tìm tên vai trò để hiển thị trong xác nhận
    const roleToDelete = userRoles.find(r => r.role_id === role_id);
    const roleName = roleToDelete ? roleToDelete.role_name : 'vai trò này';
    
    // Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa vai trò "${roleName}" khỏi người dùng "${selectedUser.name}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/user_role`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id, role_id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message || 'Lỗi xóa vai trò!');
        return;
      }
      
      // Reload lại vai trò user
      const userRolesRes = await fetch(`http://localhost:3000/api/user_role?user_id=${selectedUser.id}`);
      const userRolesData = await userRolesRes.json();
      setUserRoles(userRolesData);
      
      // Reload lại danh sách users chính
      await loadUsers();
      
      // Hiển thị thông báo thành công từ backend
      setRoleSuccess(data.message || 'Xóa vai trò thành công!');
      setTimeout(() => setRoleSuccess(''), 4000); // Tăng thời gian hiển thị vì thông báo dài hơn
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };

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
          
          <h3 className="mb-3">Danh sách người dùng</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Mã người dùng</th>
                {/* <th>ID</th> */}
                <th>Tên</th>
                <th>Email</th>
                {/* <th>Vai trò</th> */}
                <th>Hành động</th>
                <th>
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    Thêm tài khoản
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">Đang tải dữ liệu...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Không có người dùng nào.</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    {/* <td>{user.id}</td> */}
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    {/* <td>{user.role || '-'}</td> */}
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={user.email === currentUserEmail}
                      >
                        Xóa
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleShowRole(user)}
                      >
                        Vai trò
                      </button>
                    </td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {success && <div className="alert alert-success">{success}</div>}

          {/* Modal Form */}
          {showForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', position: 'relative' }}>
                <button
                  onClick={() => { setShowForm(false); setError(''); }}
                  style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}
                  title="Đóng"
                >×</button>
                <h4 className="mb-3">Thêm tài khoản mới</h4>
                <form onSubmit={handleAddUser} noValidate>
                  <div className="form-row align-items-center">
                    <div className="form-group col-md-12 mb-2">
                      <input type="text" className="form-control" name="name" placeholder="Tên người dùng" value={form.name} onChange={handleChange} />
                      {validationErrors.name && <div className="text-danger mt-1">{validationErrors.name}</div>}
                    </div>
                    <div className="form-group col-md-12 mb-2">
                      <input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                      {validationErrors.email && <div className="text-danger mt-1">{validationErrors.email}</div>}
                    </div>
                    <div className="form-group col-md-12 mb-2">
                      <input type="password" className="form-control" name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} />
                      {validationErrors.password && <div className="text-danger mt-1">{validationErrors.password}</div>}
                    </div>
                    <div className="form-group col-md-12 mb-2">
                      <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-12 mb-2 text-right">
                      <button type="submit" className="btn btn-success">Lưu</button>
                    </div>
                  </div>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </form>
              </div>
            </div>
          )}

          {showRoleModal && selectedUser && (
            <div className="modal" style={{
              display: 'block',
              background: 'rgba(0,0,0,0.3)',
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 9999
            }}>
              <div className="modal-dialog" style={{maxWidth: 400, margin: '10% auto'}}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Vai trò của user: {selectedUser.name}</h5>
                    <button type="button" className="btn-close" onClick={() => { setShowRoleModal(false); setRoleSuccess(''); }}></button>
                  </div>
                  <div className="modal-body">
                    {roleSuccess && <div className="alert alert-success mb-3">{roleSuccess}</div>}
                    <div>
                      <strong>Hiện tại:</strong>
                      <ul>
                        {userRoles.length === 0 ? (
                          <li className="text-muted">Chưa có vai trò nào</li>
                        ) : (
                          userRoles.map(r => (
                            <li key={r.role_id}>
                              {r.role_name}
                              <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDeleteRole(r.role_id)}>Xóa</button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                    <div>
                      <strong>Thêm vai trò:</strong>
                      <select className="form-control" value={roleToAdd} onChange={e => setRoleToAdd(e.target.value)}>
                        <option value="">-- Chọn vai trò --</option>
                        {allRoles
                          .filter(r => !userRoles.some(ur => ur.role_id === r.id))
                          .map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                      </select>
                      <button className="btn btn-success btn-sm mt-2" onClick={handleAddRole}>Thêm</button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => { setShowRoleModal(false); setRoleSuccess(''); }}>Đóng</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaoTaiKhoan;
