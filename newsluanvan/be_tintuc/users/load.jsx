import React, { useEffect, useState } from 'react';
import Home from '../../d:/webtintuc/newsluanvan/src/pages/users/home.jsx'; // Đường dẫn có thể cần chỉnh lại cho đúng

function Load() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API để lấy danh sách bài viết
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        alert('Lỗi khi tải dữ liệu!');
      });
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return <Home posts={posts} />;
}

export default Load;
