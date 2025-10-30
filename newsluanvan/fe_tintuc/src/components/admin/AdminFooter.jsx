import React from 'react';

function AdminFooter() {
  return (
    <footer style={{ background: '#222', color: '#fff', padding: '1rem 0', marginTop: 40 }}>
      <div className="container-fluid text-center">
        © {new Date().getFullYear()} Admin 24news. 
      </div>
    </footer>
  );
}

export default AdminFooter; 