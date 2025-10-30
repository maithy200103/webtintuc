import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/articles?status=published');
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải bài viết từ backend:', err);
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    const fetchTrendingPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/articles-views/trending?limit=5');
        setTrendingPosts(response.data);
      } catch (err) {
        console.error('Lỗi khi tải bài báo trending:', err);
        setTrendingPosts([]);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/tags');
        setTags(response.data);
      } catch (err) {
        setTags([]);
      }
    };

    fetchPosts();
    fetchTrendingPosts();
    fetchTags();
  }, []);

  // Hàm lưu lượt xem khi người dùng click vào bài báo
  const recordView = async (articleId) => {
    try {
      await axios.post('http://localhost:3000/api/articles-views/record-view', {
        articles_id: articleId,
        id_address: 'user_' + Date.now() // Có thể thay bằng IP thật hoặc user ID
      });
    } catch (err) {
      console.error('Lỗi khi lưu lượt xem:', err);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-4 pt-4 paddding">
      <div className="container paddding">
        <div className="row mx-0">
          {/* Banner lớn */}
          <div className="col-md-8 animate-box">
            <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Tin nổi bật</div>
            <div className="row pb-4">
              {posts.slice(0, 10).map((post, idx) => (
                <div key={post.id} className="col-6 mb-3">
                  <div className="fh5co_hover_news_img">
                    <div className="fh5co_news_img">
                      <img
                        src={
                          post.image_url
                            ? post.image_url.startsWith('http')
                              ? post.image_url
                              : `http://localhost:3000${post.image_url.startsWith('/uploads') ? post.image_url : '/uploads/' + post.image_url}`
                            : "/images/default-post.jpg"
                        }
                        alt={post.title || 'Bài viết'}
                      />
                    </div>
                    <div className="pt-2">
                      <Link 
                        to={`/single/${post.id}`} 
                        className="fh5co_magna py-2 d-block"
                        onClick={() => recordView(post.id)}
                      >
                        {post.title}
                      </Link>
                      <div className="fh5co_mini_time py-2">
{post.author || "Không rõ tác giả"} - {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : "Chưa rõ ngày"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Danh sách bài viết mới nhất */}
            <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Bài viết mới nhất</div>
            <div className="row pb-4">
              <div className="col-md-12">
                {posts.length === 0 ? (
                  <div className="alert alert-info">Chưa có bài viết nào.</div>
                ) : (
                  <ul className="list-group">
                    {posts.slice(0, 10).map(post => (
                      <li key={post.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <Link 
                          to={`/single/${post.id}`}
                          onClick={() => recordView(post.id)}
                        >
                          {post.title}
                        </Link>
                        <span className="badge bg-primary rounded-pill">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar phải: Trending & Tags */}
          <div className="col-md-4 animate-box">
            <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Trending</div>
            <div className="mb-4">
              {trendingPosts.length > 0 ? (
                trendingPosts.map(post => (
                  <div key={post.id} className="d-flex align-items-center mb-2">
                    <img
                      src={
                        post.image_url
                          ? post.image_url.startsWith('http')
                            ? post.image_url
                            : `http://localhost:3000${post.image_url.startsWith('/uploads') ? post.image_url : '/uploads/' + post.image_url}`
                          : "/images/default-post.jpg"
                      }
                      alt={post.title}
                      style={{ width: 60, height: 40, objectFit: 'cover', marginRight: 10 }}
                    />
                    <div className="flex-grow-1">
                      <Link 
                        to={`/single/${post.id}`}
                        onClick={() => recordView(post.id)}
                      >
                        {post.title}
                      </Link>
                      <div className="small text-muted">
                        {post.view_count} lượt xem
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted">Chưa có dữ liệu trending.</div>
              )}
            </div>

            <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Tags</div>
            <div className="fh5co_tags_all">
              {tags.length === 0 ? (
                <span>Không có tag nào.</span>
              ) : (
                tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/tag/${encodeURIComponent(tag.name)}`}
                    className="fh5co_tagg"
                  >
                    {tag.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;