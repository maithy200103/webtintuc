import React from 'react';

function ContactUs() {
  return (
    <div>
      <div className="container-fluid pb-4 pt-4 paddding">
        <div className="container paddding">
          <div className="row mx-0">
            <div className="col-md-8 animate-box" data-animate-effect="fadeInLeft">
              <div>
                <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Contact Us</div>
              </div>
              <div className="row pb-4">
                <div className="col-md-12">
                  <div className="fh5co_contact_form">
                    <form>
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" id="name" placeholder="Your Name" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" className="form-control" id="email" placeholder="Your Email" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea className="form-control" id="message" rows="5" placeholder="Your Message"></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary">Send Message</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 animate-box" data-animate-effect="fadeInRight">
              <div>
                <div className="fh5co_heading fh5co_heading_border_bottom py-2 mb-4">Contact Info</div>
              </div>
              <div className="fh5co_contact_info">
                <ul className="fh5co_contact_info_list">
                  <li className="fh5co_contact_info_item">
                    <i className="fa fa-map-marker"></i>
                    <span>123 Street Name, City, Country</span>
                  </li>
                  <li className="fh5co_contact_info_item">
                    <i className="fa fa-phone"></i>
                    <span>+1 234 567 890</span>
                  </li>
                  <li className="fh5co_contact_info_item">
                    <i className="fa fa-envelope"></i>
                    <span>info@example.com</span>
                  </li>
                </ul>
              </div>
              <div className="fh5co_social_icons">
                <div className="fh5co_heading fh5co_heading_border_bottom pt-3 py-2 mb-4">Follow Us</div>
                <ul className="fh5co_social_icons_list">
                  <li><a href="#"><i className="fa fa-facebook"></i></a></li>
                  <li><a href="#"><i className="fa fa-twitter"></i></a></li>
                  <li><a href="#"><i className="fa fa-instagram"></i></a></li>
                  <li><a href="#"><i className="fa fa-linkedin"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
