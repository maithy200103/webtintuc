import React from 'react';
import Header from '../components/admin/AdminHeader';
import Footer from '../components/admin/AdminFooter';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
    return ( 
        
            <>
                <Header />
                <Outlet />
                <Footer />
            </>
        
     );
}

export default AdminLayout;