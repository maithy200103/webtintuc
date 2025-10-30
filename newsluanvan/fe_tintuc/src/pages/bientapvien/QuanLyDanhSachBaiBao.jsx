import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const QuanLyDanhSachBaiBao = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [viewArticle, setViewArticle] = useState(null);
  const [editArticle, setEditArticle] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
        setError('Không thể tải dữ liệu!');
      });
  }, []);

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
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/articles/${editArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật!');
      setArticles(articles.map(a => a.id === editArticle.id ? { ...a, title: editTitle, content: editContent } : a));
      setEditArticle(null);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật!');
    } finally {
      setUpdating(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchAuthor = filterAuthor
      ? (article.author || '').toLowerCase().includes(filterAuthor.toLowerCase())
      : true;
    const matchStatus = filterStatus
      ? (article.status || '').toLowerCase() === filterStatus.toLowerCase()
      : true;
    return matchAuthor && matchStatus;
  });

  return (
    <div className="container py-4">
      <h2 className="mb-4">Danh sách bài báo</h2>
      <div className="row mb-3">
        <div className="col-md-7">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Lọc theo tên tác giả..."
              value={filterAuthor}
              onChange={e => setFilterAuthor(e.target.value)}
            />
            <select
              className="form-select"
              style={{ maxWidth: 200 }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
        </div>
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
              {filteredArticles.length === 0 ? (
                <tr><td colSpan="7" className="text-center">Chưa có bài viết nào.</td></tr>
              ) : (
                filteredArticles.map((article, idx) => {
                  // Lấy id người đăng nhập từ localStorage
                  const adminId = localStorage.getItem('adminId');
                  const isOwner = adminId && String(article.author_id) === String(adminId);
                  return (
                    <tr key={article.id}>
                      <td>{idx + 1}</td>
                      <td>{article.title}</td>
                      <td>{article.category || '-'}</td>
                      <td>{article.author || '-'}</td>
                      <td>{article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>{article.status || 'Bị từ chối'}</td>
                      <td>
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleView(article)}>Xem</button>
                        {isOwner && (
                          <>
                            <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(article)}>Sửa</button>
                            <button className="btn btn-sm btn-danger" disabled={deletingId === article.id} onClick={() => handleDelete(article.id)}>
                              {deletingId === article.id ? 'Đang xóa...' : 'Xóa'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
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
  );
};

export default QuanLyDanhSachBaiBao;
    