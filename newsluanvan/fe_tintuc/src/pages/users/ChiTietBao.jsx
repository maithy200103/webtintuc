import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/users/Header';
import Footer from '../../components/users/Footer';

async function summarizeWithGemini(content) {
  const API_KEY = "AIzaSyA-8zAo7f-C3hsmoaebNRaV1j_bBvejmCA";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const prompt = `Hãy tóm tắt ngắn gọn đoạn văn sau bằng tiếng Việt:\n${content}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error("Lỗi khi gọi API Gemini");

  const data = await response.json();
  // Lấy kết quả tóm tắt từ response
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tóm tắt.";
}

const ChiTietBao = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

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

  // Load các bài báo cùng danh mục
  useEffect(() => {
    if (article && article.category_id) {
      fetch(`http://localhost:3000/api/articles/category/${article.category_id}?exclude_id=${article.id}&limit=6`)
        .then(res => res.json())
        .then(data => {
          setRelatedArticles(data);
        })
        .catch(() => setRelatedArticles([]));
    } else {
      setRelatedArticles([]);
    }
  }, [article]);

  const handleSummarize = async () => {
    console.log('Bấm nút tóm tắt');
    if (!article || !article.content) {
      console.log('Không có nội dung bài báo');
      return;
    }
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
      console.log('Gemini response:', data);
      const currentSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tóm tắt văn bản.";
      setSummary(currentSummary);
    } catch (error) {
      setSummary("Lỗi: " + error.message);
    }
    setSummarizing(false);
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
        <Link to="/" className="btn btn-secondary mb-3">&larr; Quay lại trang chủ</Link>
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">{article.title}</h3>
          </div>
          <div className="card-body">
            {/* Nút tóm tắt */}
            <button className="btn btn-info mb-3 btn-tomtat" onClick={handleSummarize} disabled={summarizing}>
              {summarizing ? "Đang tóm tắt..." : "Tóm tắt bài báo"}
            </button>

            {/* Modal hiển thị tóm tắt */}
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
            <div className="mb-3">
              <strong>Danh mục:</strong> {article.category || '-'} <br />
              <strong>Tác giả:</strong> {article.author || '-'} <br />
              <strong>Ngày đăng:</strong> {article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : '-'} <br />
              <strong>Trạng thái:</strong> {article.status}
            </div>
            {article.image_url && (
              <div className="mb-3">
                <img src={article.image_url} alt="Ảnh bài báo" style={{maxWidth: 400, width: '100%'}} />
              </div>
            )}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </div>
      <Footer />
      {/* Bài báo cùng danh mục */}
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
    </>
  );
};

export default ChiTietBao;
