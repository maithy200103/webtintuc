import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const TagsPage = () => {
  const { tagName } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/tags/${encodeURIComponent(tagName)}/articles`)
      .then(res => res.json())
      .then(data => {
        setTag(data.tag);
        setPosts(data.articles);
        setLoading(false);
      })
      .catch(() => {
        setTag(null);
        setPosts([]);
        setLoading(false);
      });
  }, [tagName]);

  if (loading) return <div className="container py-5">Đang tải...</div>;
  if (!tag) return <div className="container py-5">Không tìm thấy tag này.</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Tags: <span className="font-italic">{tag.name}</span></h2>
      <hr />
      {posts.length === 0 ? (
        <div>Chưa có bài viết nào với tag này.</div>
      ) : (
        <div className="row">
          {posts.map(article => (
            <div key={article.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <Link to={`/single/${article.id}`}>
                  <img
                    src={article.image_url
                      ? (article.image_url.startsWith('http')
                        ? article.image_url
                        : `http://localhost:3000${article.image_url}`)
                      : '/images/n-a-1.jpg'}
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
                  <p className="card-text mt-auto pt-2">
                    <small className="text-muted">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('vi-VN') : ''}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsPage;
