import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Link } from 'react-router-dom';

const QuanLyBaiViet = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [viewArticle, setViewArticle] = useState(null);
  const [editArticle, setEditArticle] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editStatus, setEditStatus] = useState('draft');

  useEffect(() => {
    fetchArticles(statusFilter);
    fetchCategories();
  }, [statusFilter]);

  const fetchArticles = async (status = 'all') => {
    setLoading(true);
    try {
      let url = 'http://localhost:3000/api/articles';
      if (status !== 'all') {
        url += `?status=${status}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setArticles([]);
      setError('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/category');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa bài viết!');
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi xóa bài viết!');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (article) => {
    setViewArticle(article);
  };

  const handleEdit = (article) => {
    setEditArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategoryId(article.category_id || '');
    setEditStatus(article.status || 'draft');
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/articles/${editArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          category_id: editCategoryId,
          status: editStatus
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật!');
      
      // Reload lại danh sách bài viết thay vì cập nhật thủ công
      await fetchArticles(statusFilter);
      
      setEditArticle(null);
      alert('Cập nhật bài viết thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật!');
    } finally {
      setUpdating(false);
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
          <h2 className="mb-4">Quản lý danh sách bài viết</h2>
          {/* Combo box lọc trạng thái */}
          <div className="mb-3">
            <label className="form-label me-2">Lọc theo trạng thái:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          </div>
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
                    <th>Tiêu đề</th>
                    <th>Danh mục</th>
                    <th>Tác giả</th>
                    <th>Ngày đăng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">Chưa có bài viết nào.</td></tr>
                  ) : (
                    articles.map((article, idx) => (
                      <tr key={article.id}>
                        <td>{idx + 1}</td>
                        <td>{article.title}</td>
                        <td>{article.category || '-'}</td>
                        <td>{article.author || '-'}</td>
                        <td>{article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : '-'}</td>
                        <td>{article.status || 'Bị từ chối'}</td>
                        <td>
                          <button className="btn btn-sm btn-info me-2" onClick={() => handleView(article)}>Xem</button>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(article)}>Sửa</button>
                          <button className="btn btn-sm btn-danger" disabled={deletingId === article.id} onClick={() => handleDelete(article.id)}>
                            {deletingId === article.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Xem */}
          {viewArticle && (
            <div className="modal" style={{
              display: 'block',
              background: 'rgba(0,0,0,0.5)',
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999
            }}>
              <div className="modal-dialog" style={{ margin: '2% auto', maxWidth: '90vw', width: '90vw', minHeight: '90vh' }}>
                <div className="modal-content" style={{ minHeight: '80vh' }}>
                  <div className="modal-header">
                    <h4 className="modal-title">{viewArticle.title}</h4>
                    <button type="button" className="btn-close" onClick={() => setViewArticle(null)}></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    {viewArticle.image_url && (
                      <img src={viewArticle.image_url} alt="thumbnail" style={{ maxWidth: 300, marginBottom: 16, display: 'block' }} />
                    )}
                    <div>
                      <b>Danh mục:</b> {viewArticle.category} <br />
                      <b>Tác giả:</b> {viewArticle.author} <br />
                      <b>Ngày đăng:</b> {viewArticle.published_at ? new Date(viewArticle.published_at).toLocaleDateString('vi-VN') : '-'} <br />
                      <b>Trạng thái:</b> {viewArticle.status}
                    </div>
                    <hr />
                    <div dangerouslySetInnerHTML={{ __html: viewArticle.content }} />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setViewArticle(null)}>Đóng</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Sửa */}
          {editArticle && (
            <div className="modal" style={{
              display: 'block',
              background: 'rgba(0,0,0,0.3)',
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999
            }}>
              <div className="modal-dialog" style={{ margin: '2% auto', maxWidth: 800, width: '90vw' }}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Sửa bài viết</h5>
                    <button type="button" className="btn-close" onClick={() => setEditArticle(null)}></button>
                  </div>
                  <div className="modal-body">
                    <input className="form-control mb-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    {/* Select danh mục */}
                    <div className="mb-2 d-flex align-items-center">
                      <select className="form-select me-2 w-auto" value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <span className="small text-muted">
                        Đang chọn: {categories.find(c => c.id == editCategoryId)?.name || 'Chưa chọn'}
                      </span>
                    </div>
                    {/* Select trạng thái */}
                    <select className="form-select mb-2" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      <option value="draft">Nháp</option>
                      <option value="published">Đã xuất bản</option>
                    </select>
                    <Editor
                      apiKey="45grzb8lc69dadcvt2yggo903sdvqxl3oa5hki4cv2n3gfne"
                      value={editContent}
                      init={{
                        height: 400,
                        menubar: true,
                        plugins: [
                          'advlist autolink lists link image charmap preview anchor',
                          'searchreplace visualblocks code fullscreen',
                          'insertdatetime media table code help wordcount'
                        ],
                        toolbar: 'undo redo | formatselect | bold italic backcolor | \
                                  alignleft aligncenter alignright alignjustify | \
                                  bullist numlist outdent indent | removeformat | help'
                      }}
                      onEditorChange={setEditContent}
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setEditArticle(null)}>Hủy</button>
                    <button className="btn btn-success" onClick={handleUpdate} disabled={updating}>Lưu</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyBaiViet;
