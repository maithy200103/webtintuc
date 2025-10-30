import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/category')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <div className="container-fluid fh5co_footer_bg pb-3">
        <div className="container animate-box">
          <div className="row">
            <div className="col-12 spdp_right py-5">
              <img src="/images/white_logo.png" alt="img" className="footer_logo" />
            </div>
            <div className="clearfix" />
            <div className="col-12 col-md-4 col-lg-3">
              <div className="footer_main_title py-3"> Thong tin</div>
              <div className="footer_sub_about pb-3">
                Gmail: 24news@gmail.com
                
              </div>
              <div className="footer_sub_about pb-3">
                Phone: 0909090909
                
              </div>
              <div className="footer_mediya_icon">
                <div className="text-center d-inline-block">
                  <a className="fh5co_display_table_footer">
                    <div className="fh5co_verticle_middle">
                      <i className="fa fa-linkedin" />
                    </div>
                  </a>
                </div>
                <div className="text-center d-inline-block">
                  <a className="fh5co_display_table_footer">
                    <div className="fh5co_verticle_middle">
                      <i className="fa fa-google-plus" />
                    </div>
                  </a>
                </div>
                <div className="text-center d-inline-block">
                  <a className="fh5co_display_table_footer">
                    <div className="fh5co_verticle_middle">
                      <i className="fa fa-twitter" />
                    </div>
                  </a>
                </div>
                <div className="text-center d-inline-block">
                  <a className="fh5co_display_table_footer">
                    <div className="fh5co_verticle_middle">
                      <i className="fa fa-facebook" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3 col-lg-2">
              <div className="footer_main_title py-3">Category</div>
              <ul className="footer_menu">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <a href={`/category/${cat.slug}`}>
                      <i className="fa fa-angle-right" />&nbsp;&nbsp; {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* <div className="col-12 col-md-5 col-lg-3 position_footer_relative">
              <div className="footer_main_title py-3"> Most Viewed Posts</div>
              <div className="footer_makes_sub_font"> Dec 31, 2016</div>
              <a href="#" className="footer_post pb-4"> Success is not a good teacher failure makes you humble </a>
              <div className="footer_makes_sub_font"> Dec 31, 2016</div>
              <a href="#" className="footer_post pb-4"> Success is not a good teacher failure makes you humble </a>
              <div className="footer_makes_sub_font"> Dec 31, 2016</div>
              <a href="#" className="footer_post pb-4"> Success is not a good teacher failure makes you humble </a>
              <div className="footer_position_absolute">
                <img src="/images/footer_sub_tipik.png" alt="img" className="width_footer_sub_img" />
              </div>
            </div> */}
            {/* <div className="col-12 col-md-12 col-lg-4 ">
              <div className="footer_main_title py-3"> Last Modified Posts</div>
              <a href="#" className="footer_img_post_6"><img src="/images/allef-vinicius-108153.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/32-450x260.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/download (1).jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/science-578x362.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/vil-son-35490.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/zack-minor-15104.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/download.jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/download (2).jpg" alt="img" /></a>
              <a href="#" className="footer_img_post_6"><img src="/images/ryan-moreno-98837.jpg" alt="img" /></a>
            </div> */}
          </div>
          <div className="row justify-content-center pt-2 pb-4">
            <div className="col-12 col-md-8 col-lg-7 ">
              <div className="input-group">
                <span className="input-group-addon fh5co_footer_text_box" id="basic-addon1">
                  <i className="fa fa-envelope" />
                </span>
                <input type="text" className="form-control fh5co_footer_text_box" placeholder="Thông tin tìm kiếm..." aria-describedby="basic-addon1" />
                <a href="#" className="input-group-addon fh5co_footer_subcribe" id="basic-addon12">
                  <i className="fa fa-paper-plane-o" />&nbsp;&nbsp;Liên Hệ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid fh5co_footer_right_reserved">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 py-4 Reserved">
              24 NEWS READ EVERYTHING
            </div>
            <div className="col-12 col-md-6 spdp_right py-4">
              <Link to="/" className="footer_last_part_menu">Trang chủ</Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="footer_last_part_menu"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="gototop js-top">
        <a href="#" className="js-gotop"><i className="fa fa-arrow-up" /></a>
      </div>
    </>
  );
}

export default Footer; 