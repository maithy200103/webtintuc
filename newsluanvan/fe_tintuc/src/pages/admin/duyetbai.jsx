import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function DuyetBaiAdmin() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Thêm state này

  useEffect(() => {
    fetch('http://localhost:3000/api/duyetbai')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(() => setArticles([]));
  }, []);

  const handleApprove = async (id) => {
    const res = await fetch(`http://localhost:3000/api/duyetbai/approve/${id}`, { method: 'POST' });
    if (res.ok) {
      setSuccessMessage('Duyệt bài thành công!');
      setTimeout(() => setSuccessMessage(''), 2000); // Ẩn sau 2s
    }
    setArticles(articles.map(article =>
      article.id === id ? { ...article, status: 'published' } : article
    ));
    setSelected(null);
  };

  const handleSelect = (article) => {
    setSelected(article);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await fetch(`http://localhost:3000/api/duyetbai/reject/${selected.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason }),
    });
    setArticles(articles.map(article =>
      article.id === selected.id ? { ...article, status: 'rejected', reject_reason: rejectReason } : article
    ));
    setShowReject(false);
    setSelected(null);
    setRejectReason('');
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
          <h2 className="mb-4">Duyệt bài viết</h2>
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {!selected && (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {articles
                  .filter(article => article.status !== 'published')
                  .map(article => (
                    <tr key={article.id}>
                      <td>{article.title}</td>
                      <td>{article.author}</td>
                      <td>{article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        {article.status === 'published'
                          ? <span className="text-success">Đã duyệt</span>
                          : <span className="text-warning">Chờ duyệt</span>}
                      </td>
                      <td>
                        <button className="btn btn-info btn-sm mr-2" onClick={() => handleSelect(article)}>Xem</button>
                        {/* {article.status !== 'published' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(article.id)}>Duyệt</button>
                        )} */}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {selected && (
            <div className="card mt-4">
              <div className="card-header">
                <strong>Chi tiết bài báo</strong>
                <button className="close float-right" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="card-body">
                <h5>{selected.title}</h5>
                <p><b>Tác giả:</b> {selected.author}</p>
                <p><b>Ngày gửi:</b> {selected.published_at ? new Date(selected.published_at).toLocaleDateString('vi-VN') : '-'}</p>
                <p><b>Nội dung:</b></p>
                <div dangerouslySetInnerHTML={{ __html: selected.content }} />
                {selected.status !== 'published' && (
                  <>
                    <button className="btn btn-success mt-3 mr-2" onClick={() => handleApprove(selected.id)}>Duyệt bài báo này</button>
                    <button className="btn btn-danger mt-3" onClick={() => setShowReject(true)}>Từ chối bài viết</button>
                  </>
                )}
              </div>
            </div>
          )}

          {showReject && (
            <div className="modal" style={{
              display: 'block', background: 'rgba(0,0,0,0.3)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh'
            }}>
              <div className="modal-dialog" style={{ margin: '10% auto', maxWidth: 400 }}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Lý do từ chối bài viết</h5>
                    <button type="button" className="close" onClick={() => setShowReject(false)}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối..."
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowReject(false)}>Hủy</button>
                    <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>Từ chối</button>
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

export default DuyetBaiAdmin;
