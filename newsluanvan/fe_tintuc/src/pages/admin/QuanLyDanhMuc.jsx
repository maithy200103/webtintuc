import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const QuanLyDanhMuc = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editOrder, setEditOrder] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/category');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải danh mục!');
      // Sắp xếp theo order
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err.message || 'Lỗi tải danh mục!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('http://localhost:3000/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi thêm danh mục!');
      setCategories([...categories, data.category || data]);
      setNewCategory('');
    } catch (err) {
      alert(err.message || 'Lỗi thêm danh mục!');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:3000/api/category/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa danh mục!');
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi xóa danh mục!');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditOrder(cat.order.toString());
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setUpdating(true);
    const newOrderNum = parseInt(editOrder);
    const currentCat = categories.find(cat => cat.id === editingId);
    const targetCat = categories.find(cat => cat.order === newOrderNum && cat.id !== editingId);
    try {
      if (targetCat) {
        // Nếu có danh mục trùng order, hoán đổi order
        await Promise.all([
          fetch(`http://localhost:3000/api/category/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim(), order: newOrderNum }),
          }),
          fetch(`http://localhost:3000/api/category/${targetCat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: targetCat.name, slug: targetCat.slug, order: currentCat.order }),
          })
        ]);
      } else {
        // Nếu không trùng, chỉ cập nhật danh mục đang sửa
        await fetch(`http://localhost:3000/api/category/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim(), order: newOrderNum }),
        });
      }
      await fetchCategories();
      setEditingId(null);
      setEditName('');
      setEditSlug('');
      setEditOrder('');
    } catch (err) {
      alert(err.message || 'Lỗi sửa danh mục!');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
    setEditOrder('');
  };

  const moveCategory = async (catId, direction) => {
    const idx = categories.findIndex(cat => cat.id === catId);
    if (idx === -1) return;
    let swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;
    const current = categories[idx];
    const target = categories[swapIdx];
    const newCurrentOrder = target.order;
    const newTargetOrder = current.order;
    try {
      await Promise.all([
        fetch(`http://localhost:3000/api/category/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: current.name, slug: current.slug, order: newCurrentOrder }),
        }),
        fetch(`http://localhost:3000/api/category/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: target.name, slug: target.slug, order: newTargetOrder }),
        })
      ]);
      await fetchCategories();
    } catch (err) {
      alert('Lỗi đổi vị trí danh mục!');
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
          <h2 className="mb-4">Quản lý danh mục bài viết</h2>
          <form className="mb-3 d-flex" onSubmit={handleAddCategory}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Tên danh mục mới"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              disabled={adding}
            />
            <button className="btn btn-primary" type="submit" disabled={adding}>
              {adding ? 'Đang thêm...' : 'Thêm danh mục'}
            </button>
          </form>
          {loading ? (
            <div>Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Tên danh mục</th>
                    {/* <th>Slug</th> */}
                    <th>Sắp xếp</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">Chưa có danh mục nào.</td>
                    </tr>
                  ) : (
                    categories.map((cat, idx) => (
                      <tr key={cat.id}>
                        <td>{idx + 1}</td>
                        <td>
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              className="form-control"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              disabled={updating}
                            />
                          ) : (
                            cat.name
                          )}
                        </td>
                        {/* <td>
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              className="form-control"
                              value={editSlug}
                              onChange={e => setEditSlug(e.target.value)}
                              disabled={updating}
                            />
                          ) : (
                            cat.slug
                          )}
                        </td> */}
                        <td>
                          {editingId === cat.id ? (
                            <input
                              type="number"
                              className="form-control"
                              value={editOrder}
                              onChange={e => setEditOrder(e.target.value)}
                              disabled={updating}
                              min="1"
                              style={{ width: 80 }}
                            />
                          ) : (
                            <span style={{ minWidth: 40, display: 'inline-block' }}>{cat.order}</span>
                          )}
                        </td>
                        <td>
                          {editingId === cat.id ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={handleUpdateCategory}
                                disabled={updating}
                              >
                                Lưu
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={handleCancelEdit}
                                disabled={updating}
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => handleEditClick(cat)}
                              >
                                Sửa
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                disabled={deletingId === cat.id}
                                onClick={() => handleDelete(cat.id)}
                              >
                                {deletingId === cat.id ? 'Đang xóa...' : 'Xóa'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyDanhMuc;
