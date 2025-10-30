import React from 'react';
import Header from '../components/bientapvien/BienTapVienHeader';
import Footer from '../components/bientapvien/BienTapVienFooter';
import { Outlet } from 'react-router-dom';

function BienTapVienLayout() {
    return ( 
        
            <>
                <Header />
                <Outlet />
                <Footer />
            </>
        
     );
}

export default BienTapVienLayout;