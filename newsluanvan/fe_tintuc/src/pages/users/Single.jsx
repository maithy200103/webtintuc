import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/users/Header';
import Footer from '../../components/users/Footer';

const Single = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [comments, setComments] = useState([]); // Danh sách bình luận
  const [commentText, setCommentText] = useState(''); // Nội dung bình luận mới
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setArticle(null);
        } else {
          setArticle(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải chi tiết bài báo!');
        setLoading(false);
      });
  }, [id]);

  // Hàm tóm tắt
  const handleSummarize = async () => {
    if (!article || !article.content) return;
    setSummarizing(true);
    setShowModal(true);
    setSummary('Đang tóm tắt...');
    try {
      const API_KEY = "AIzaSyA-8zAo7f-C3hsmoaebNRaV1j_bBvejmCA";
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const plainText = article.content.replace(/<[^>]+>/g, '');
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Tóm tắt ngắn gọn, súc tích đoạn văn sau bằng tiếng Việt:\n"${plainText}"` }] }]
        })
      });
      const data = await response.json();
      const currentSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tóm tắt văn bản.";
      setSummary(currentSummary);
    } catch (error) {
      setSummary("Lỗi: " + error.message);
    }
    setSummarizing(false);
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/comments/article/${article.id}`);
      const data = await res.json();
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    if (article) {
      fetchComments();
    }
  }, [article]);

  useEffect(() => {
    if (article && article.id) {
      fetch(`http://localhost:3000/api/articles/${article.id}/tags`)
        .then(res => res.json())
        .then(data => setTags(data))
        .catch(() => setTags([]));
    }
  }, [article]);

  useEffect(() => {
    if (article && article.category_id) {
      fetch(`http://localhost:3000/api/articles/category/${article.category_id}?exclude_id=${article.id}&limit=6`)
        .then(res => res.json())
        .then(data => setRelatedArticles(data))
        .catch(() => setRelatedArticles([]));
    } else {
      setRelatedArticles([]);
    }
  }, [article]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const token = localStorage.getItem('userToken'); // Đúng key!
    if (!token) {
      alert('Bạn cần đăng nhập để bình luận!');
      navigate('/login'); // Chuyển hướng đến trang login
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          articles_id: article.id,
          content: commentText
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCommentText('');
        fetchComments();
      } else {
        alert(data.error || 'Có lỗi khi gửi bình luận');
      }
    } catch (error) {
      alert('Lỗi kết nối server');
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className="container py-4">Đang tải chi tiết bài báo...</div>
      <Footer />
    </>
  );
  if (error) return (
    <>
      <Header />
      <div className="container py-4 text-danger">{error}</div>
      <Footer />
    </>
  );
  if (!article) return null;

  return (
    <>
      <Header />
      <div className="container py-4">
        {/* <Link to="/" className="btn btn-secondary mb-3">&larr; Quay lại trang chủ</Link> */}
        <div className="card shadow">
          <div className="card-header bg-secondary text-black">
            <h3 className="mb-0">{article.title}</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              
              <strong>Danh mục:</strong> {article.category || '-'} <br />
              <strong>Tác giả:</strong> {article.author || '-'} <br />
              <strong>Ngày đăng:</strong> {article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : '-'} <br />
              <strong>Trạng thái:</strong> {article.status}
            </div>
            {/* Luôn hiển thị ảnh chính nếu có */}
            {/* {article.image_url && (
              <div className="mb-3">
                <img src={article.image_url} alt="Ảnh bài báo" style={{maxWidth: 400, width: '100%'}} />
              </div>
            )} */}
            {/* Khung tóm tắt bài báo */}
            <div className="mb-3" style={{
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 16,
              fontStyle: 'italic',
              color: '#333'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <strong>Tóm tắt bài báo:</strong>
                <button
                  className="btn btn-info btn-sm"
                  onClick={handleSummarize}
                  disabled={summarizing}
                >
                  {summarizing ? "Đang tóm tắt..." : "Tóm tắt bài báo"}
                </button>
              </div>
              <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>
                {summary}
              </div>
            </div>

            
            {/* Nội dung bài báo */}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
            <hr style={{ borderTop: '2px solid #ccc', marginBottom: 16 }} />
            {tags.length > 0 && (
              <div className="mb-3" style={{ textAlign: 'left' }}>
                <strong>Tags:</strong>
                {tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/tag/${encodeURIComponent(tag.name)}`}
                    className="badge bg-secondary mx-1"
                    style={{ fontSize: 18, color: '#000', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Phần bình luận */}
            <div className="comments-section mt-4">
              <hr style={{ borderTop: '2px solid #ccc', marginBottom: 16 }} />
              <h5>Bình luận</h5>
              <form onSubmit={handleCommentSubmit} className="mb-3">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Nhập bình luận của bạn..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary mt-2">Gửi bình luận</button>
              </form>
              <div>
                {comments.length === 0 && <div>Chưa có bình luận nào.</div>}
                {comments.map(comment => (
                  <div key={comment.id} className="mb-2 p-2 border rounded" style={{background: '#f9f9f9'}}>
                    <div style={{fontWeight: 'bold'}}>{comment.user_name || 'Ẩn danh'}</div>
                    <div style={{whiteSpace: 'pre-line'}}>{comment.content}</div>
                    <div className="text-muted" style={{fontSize: 12}}>{new Date(comment.create_at).toLocaleString('vi-VN')}</div>
                  </div>
                ))}
              </div>
            </div>
            {relatedArticles.length > 0 && (
              <div className="container py-4">
                <h5>Bài viết cùng danh mục</h5>
                <div className="row">
                  {relatedArticles.slice(0, 6).map(baiviet => (
                    <div className="col-md-4 mb-3" key={baiviet.id}>
                      <div className="card h-100">
                        {baiviet.image_url && (
                          <img
                            src={baiviet.image_url.startsWith('http') ? baiviet.image_url : `http://localhost:3000${baiviet.image_url}`}
                            className="card-img-top"
                            alt={baiviet.title}
                            style={{ maxHeight: 150, objectFit: 'cover' }}
                          />
                        )}
                        <div className="card-body">
                          <h6 className="card-title">
                            <Link to={`/single/${baiviet.id}`}>{baiviet.title}</Link>
                          </h6>
                          <div className="small text-muted">
                            {baiviet.published_at ? new Date(baiviet.published_at).toLocaleDateString('vi-VN') : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* <button className="btn btn-info mb-3" onClick={handleSummarize} disabled={summarizing}>
              {summarizing ? "Đang tóm tắt..." : "Tóm tắt bài báo"}
            </button> */}
          </div>
        </div>
      </div>
      <Footer />

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, maxWidth: 500, boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
          }}>
            <h5>Tóm tắt bài báo</h5>
            <div style={{ whiteSpace: 'pre-line', margin: '16px 0' }}>{summary}</div>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
          </div>
        </div>
      )}
      
    </>
  );
};

export default Single;