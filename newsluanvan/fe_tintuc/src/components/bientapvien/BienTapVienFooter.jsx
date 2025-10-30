import React from 'react';

function BienTapVienFooter() {
  return (
    <footer style={{ background: '#222', color: '#fff', padding: '1rem 0', marginTop: 40 }}>
      <div className="container text-center">
        © {new Date().getFullYear()} Bien tập viên 24news.
      </div>
    </footer>
  );
}

export default BienTapVienFooter; 