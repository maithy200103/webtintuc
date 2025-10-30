import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate nếu muốn logout
import 'font-awesome/css/font-awesome.min.css';

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/category')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));

    // Lấy thông tin user từ localStorage
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (name && email) {
      setUserInfo({ name, email, role });
    }
  }, []);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUserInfo(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (keyword) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data.slice(0, 5)); // Lấy tối đa 5 bài
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    }
    setSearchLoading(false);
  };

  return (
    <>
      <div className="container-fluid fh5co_header_bg">
        <div className="container">
          <div className="row">
            <div className="col-12 fh5co_mediya_center">
              <a href="#" className="color_fff fh5co_mediya_setting">
                {/* <i className="fa fa-clock-o" />&nbsp;&nbsp;&nbsp;Friday, 5 January 2018 */}
              </a>
              <div className="d-inline-block fh5co_trading_posotion_relative">
                <a href="#" className="treding_btn">Trending</a>
                <div className="fh5co_treding_position_absolute" />
              </div>
              <a href="#" className="color_fff fh5co_mediya_setting">
                {/* Instagram's big redesign goes live with black-and-white app */}
                Cập nhật tin tức mới nhất cho bạn mỗi ngày
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-3 fh5co_padding_menu">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <img src="/images/logo.png" alt="img" className="fh5co_logo_width" style={{ cursor: 'pointer' }} />
              </Link>
            </div>
            <div className="col-12 col-md-9 align-self-center fh5co_mediya_right">
              
              <div style={{ position: 'relative', display: 'inline-block', width: 300, }}>
                <form onSubmit={handleSearch} className="d-inline-block" style={{ verticalAlign: 'middle', width: '100%' }}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm bài viết..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    />
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" type="submit">
                        <i className="fa fa-search" />
                      </button>
                    </div>
                  </div>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      width: '100%',
                      zIndex: 2000,
                      left: 0,
                      top: '100%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      textAlign: 'left' // <-- Thêm dòng này để căn lề trái
                    }}
                  >
                    {suggestions.map(item => (
                      <div
                        key={item.id}
                        style={{ padding: 8, cursor: 'pointer' }}
                        onMouseDown={() => {
                          navigate(`/single/${item.id}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                      </div>
                    ))}
                    {searchLoading && <div style={{ padding: 8, color: '#888' }}>Đang tìm...</div>}
                  </div>
                )}
              </div>

              {/* <div className="text-center d-inline-block">
                <a className="fh5co_display_table">
                  <div className="fh5co_verticle_middle">
                    <i className="fa fa-search" />
                  </div>
                </a>
              </div>
              <div className="text-center d-inline-block">
                <a className="fh5co_display_table">
                  <div className="fh5co_verticle_middle">
                    <i className="fa fa-linkedin" />
                  </div>
                </a>
              </div>
              <div className="text-center d-inline-block">
                <a className="fh5co_display_table">
                  <div className="fh5co_verticle_middle">
                    <i className="fa fa-google-plus" />
                  </div>
                </a>
              </div>
              <div className="text-center d-inline-block">
                <a href="https://twitter.com/fh5co" target="_blank" className="fh5co_display_table">
                  <div className="fh5co_verticle_middle">
                    <i className="fa fa-twitter" />
                  </div>
                </a>
              </div>
              <div className="text-center d-inline-block">
                <a
                  href="/auth/facebook"
                  className="fh5co_display_table"
                  title="Đăng nhập bằng Facebook"
                  style={{ color: '#3b5998', fontSize: 22 }}
                >
                  <i className="fa fa-facebook-square" />
                </a>
              </div>
              <div className="text-center d-inline-block">
                <a
                  href="/auth/google"
                  className="fh5co_display_table"
                  title="Đăng nhập bằng Google"
                  style={{ color: '#db4437', fontSize: 22 }}
                >
                  <i className="fa fa-google" />
                </a>
              </div> */}
              <div
                className="text-center d-inline-block mx-2 position-relative"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="fh5co_display_table"
                  onClick={() => setShowUserMenu(v => !v)}
                  style={{ userSelect: 'none' }}
                >
                  <div className="fh5co_verticle_middle">
                    <i className="fa fa-user-circle" style={{ fontSize: 22, color: '#333' }} />
                  </div>
                </div>
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      minWidth: 200,
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      padding: 16,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {userInfo ? (
                      <>
                        <div><b>{userInfo.name}</b></div>
                        <div style={{ fontSize: 13, color: '#666' }}>{userInfo.email}</div>
                        <hr />
                        <button className="btn btn-sm btn-outline-secondary w-100" onClick={handleLogout}>Đăng xuất</button>
                      </>
                    ) : (
                      <>
                        <div className="mb-2">Bạn chưa đăng nhập</div>
                        <Link
                          to="/login"
                          className="btn btn-sm btn-primary w-100 mb-2"
                        >
                          Đăng nhập người dùng
                        </Link>
                        <Link
                          to="/login_ad-btv"
                          className="btn btn-sm btn-warning w-100"
                        >
                          Đăng nhập Admin/Biên tập viên
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="d-inline-block text-center dd_position_relative ">
                <select className="form-control fh5co_text_select_option">
                  <option>English </option>
                  <option>French </option>
                  <option>German </option>
                  <option>Spanish </option>
                  
                </select>
              </div>
              <div className="clearfix" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid bg-faded fh5co_padd_mediya padding_786">
        <div className="container padding_786">
          <nav className="navbar navbar-toggleable-md navbar-light ">
            <button className="navbar-toggler navbar-toggler-right mt-3" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="fa fa-bars" />
            </button>
            <Link className="navbar-brand" to="/">
              <img src="/images/logo.png" alt="img" className="mobile_logo_width" />
            </Link>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/">Trang chủ <span className="sr-only">(current)</span></Link>
                </li>
                {categories.map(cat => (
                  <li className="nav-item" key={cat.id}>
                    <Link className="nav-link" to={`/category/${cat.slug}`}>{cat.name}</Link>
                  </li>
                ))}
               
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Header; 