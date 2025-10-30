import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const BanNhap = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDraft, setEditDraft] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user hiện tại từ localStorage
    const userInfo = localStorage.getItem('userInfo');
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    } else if (adminInfo) {
      setCurrentUser(JSON.parse(adminInfo));
    } else {
      // Thử lấy từ các key khác có thể có
      const userId = localStorage.getItem('userId') || localStorage.getItem('adminId');
      const userName = localStorage.getItem('userName') || localStorage.getItem('adminName');
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail');
      
      if (userId) {
        setCurrentUser({
          id: userId,
          name: userName || 'User',
          email: userEmail || ''
        });
      }
    }
    
    setLoading(true);
    fetch('http://localhost:3000/api/articles?status=draft')
      .then(res => res.json())
      .then(data => {
        setDrafts(data);
        setLoading(false);
      })
      .catch(() => {
        setDrafts([]);
        setLoading(false);
        setError('Không thể tải dữ liệu!');
      });
  }, []);

  const handleEdit = (draft) => {
    setEditDraft(draft);
    setEditTitle(draft.title);
    setEditContent(draft.content);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/articles/${editDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editTitle, 
          content: editContent
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật!');
      
      // Cập nhật danh sách với thông tin mới
      setDrafts(drafts.map(a => 
        a.id === editDraft.id 
          ? { 
              ...a, 
              title: editTitle, 
              content: editContent
            } 
          : a
      ));
      setEditDraft(null);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật!');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!editDraft) return;
    
    // Kiểm tra user hiện tại
    if (!currentUser || !currentUser.id) {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!');
      return;
    }
    
    setUpdating(true);
    try {
      // 1. Cập nhật lại bài viết nếu có chỉnh sửa
      const updateRes = await fetch(`http://localhost:3000/api/articles/${editDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          category_id: editDraft.category_id,
          status: editDraft.status
        }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.message || 'Lỗi cập nhật bài viết!');
      
      // 2. Gửi duyệt vào bảng articles_approvals
      const approvalRes = await fetch('http://localhost:3000/api/articles_approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articles_id: editDraft.id, 
          status: 'pending', 
          user_id: currentUser.id 
        }),
      });
      const approvalData = await approvalRes.json();
      if (!approvalRes.ok) throw new Error(approvalData.message || 'Lỗi gửi duyệt!');
      
      setDrafts(drafts.filter(a => a.id !== editDraft.id));
      setEditDraft(null);
      alert('Gửi duyệt bài thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi gửi duyệt!');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Bài viết nháp của bạn</h2>
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
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length === 0 ? (
                <tr><td colSpan="4" className="text-center">Không có bài nháp nào.</td></tr>
              ) : (
                drafts.map((draft, idx) => (
                  <tr key={draft.id}>
                    <td>{idx + 1}</td>
                    <td>{draft.title}</td>
                    <td>
                      {draft.created_at 
                        ? new Date(draft.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(draft)}>Sửa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Sửa */}
      {editDraft && (
        <div className="modal" style={{
          display: 'block',
          background: 'rgba(0,0,0,0.3)',
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999
        }}>
          <div className="modal-dialog" style={{ margin: '2% auto', maxWidth: 800, width: '90vw' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa bài nháp</h5>
                <button type="button" className="btn-close" onClick={() => setEditDraft(null)}></button>
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
                    toolbar: 'undo redo | formatselect | bold italic backcolor | \\n                              alignleft aligncenter alignright alignjustify | \\n                              bullist numlist outdent indent | removeformat | help'
                  }}
                  onEditorChange={setEditContent}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditDraft(null)}>Hủy</button>
                <button className="btn btn-success me-2" onClick={handleUpdate} disabled={updating}>Lưu</button>
                <button className="btn btn-primary" onClick={handleSendForApproval} disabled={updating}>
                  Gửi duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanNhap;
