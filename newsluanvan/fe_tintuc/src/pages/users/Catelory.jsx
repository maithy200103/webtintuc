import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const Catelogy = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Lấy thông tin danh mục và các bài viết thuộc danh mục đó
    fetch(`http://localhost:3000/api/category/${slug}`)
      .then(res => res.json())
      .then(data => {
        setCategory(data.category);
        setArticles(data.articles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container py-5">Đang tải...</div>;
  if (!category) return <div className="container py-5">Không tìm thấy danh mục.</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Thể loại: {category.name}</h2>
      <hr />
      {articles.length === 0 ? (
        <div>Chưa có bài viết nào trong thể loại này.</div>
      ) : (
        <div className="row">
          {articles.map(article => (
            <div key={article.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <Link to={`/single/${article.id}`}>
                  <img
                    src={article.image_url ? (
                      article.image_url.startsWith('http')
                        ? article.image_url
                        : `http://localhost:3000${article.image_url}`
                    ) : '/images/n-a-1.jpg'}
                    className="card-img-top"
                    alt={article.title}
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                </Link>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    <Link to={`/single/${article.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                      {article.title}
                    </Link>
                  </h5>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <small className="text-muted">
                    {new Date(article.published_at).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catelogy;
