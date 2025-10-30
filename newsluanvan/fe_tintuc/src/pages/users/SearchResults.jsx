import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/users/Header';
import Footer from '../../components/users/Footer';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data);
          setError('');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải kết quả tìm kiếm.');
        setLoading(false);
      });
  }, [query]);

  const renderContent = () => {
    if (loading) {
      return <div>Đang tìm kiếm...</div>;
    }

    if (error) {
      return <div className="text-danger">{error}</div>;
    }

    if (results.length === 0) {
      return <div>Không tìm thấy bài viết nào phù hợp với từ khóa "{query}".</div>;
    }

    return (
      <div className="row">
        {results.map(article => (
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
                  <Link to={`/single/${article.id}`} className="text-dark" style={{ textDecoration: 'none' }}>{article.title}</Link>
                </h5>
                <p className="card-text mt-auto pt-2">
                  <small className="text-muted">
                    {article.category_name && (
                      <Link to={`/category/${article.category_slug}`} style={{ textDecoration: 'none' }}>{article.category_name}</Link>
                    )}
                  </small>
                </p>
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
    );
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Kết quả tìm kiếm cho: <span className="font-italic">"{query}"</span></h2>
      <hr className="mb-4" />
      {renderContent()}
    </div>
  );
};

export default SearchResults;
