import React from 'react';
import { createBrowserRouter} from 'react-router-dom';
import Blog from './pages/users/blog';
import ContactUs from './pages/users/Contact_us';
import Home from './pages/users/home';
import LoginLayout from './layouts/LoginLayout';
import Login from './pages/login';
import DangKy from './pages/DangKy';
import UserLayout from './layouts/UserLayout';   
import ChiTietBao from './pages/users/ChiTietBao'   

import AdminLayout from './layouts/AdminLayout';
import TaoTaiKhoan from './pages/admin/taotaikhoan';
import DuyetBai from './pages/admin/duyetbai';
import QuanLyBaiViet from './pages/admin/QuanLyBaiViet';
import QuanLyDanhMuc from './pages/admin/QuanLyDanhMuc';
import SoanThao from './pages/bientapvien/SoanThao';
import BienTapVienLayout from './layouts/BienTapVienLayout';
import Login_ad_btv from './pages/admin/login_ad-btv';
import Single from './pages/users/Single';
import QuanLyDanhSachBaiBao from './pages/bientapvien/QuanLyDanhSachBaiBao';
import BanNhap from './pages/bientapvien/BanNhap';
import SearchResults from './pages/users/SearchResults';
import Catelory from './pages/users/Catelory';
import TagsPage from './pages/users/tags';
import ThongKe from './pages/admin/ThongKe';

import { Children } from 'react';
const router = createBrowserRouter( 
    [
    {
        path: '/', element: <UserLayout />,
        children:[
            {path:'', element:<Home />},
            {path:'blog', element:<Blog />},//bỏ
            {path:'contact', element:<ContactUs />  },//bỏ
            {path:'login', element:<Login />},
            {path:'chitietbao', element:<ChiTietBao />},
            {path:'single', element:<Single />},
            {path:'search', element:<SearchResults />},
            {path:'category/:slug', element: <Catelory /> },
            {path:'tag/:tagName', element: <TagsPage /> },

        ]
    },
   
    {
        path: '/login',     element: <LoginLayout />,
        children:[
            {path:'', element:<Login />},
        ]
    },
    {
        path: '/login_ad-btv',     element: <LoginLayout />,
        children:[
            {path:'', element:<Login_ad_btv />},
        ]
    },

     {
        path: '/dangky',     element: <LoginLayout />,
        children:[
            {path:'', element:<DangKy />},
        ]
    },

    {
        path: '/dangky',
        element: <DangKy />
    },
    {   
        path: '/admin', element: <AdminLayout />,
        children:[
            {path:'taotaikhoan', element:<TaoTaiKhoan />},
            {path:'soanthao', element:<SoanThao />},
            {path:'duyetbai', element:<DuyetBai />},
            {path:'quanlybaiviet', element:<QuanLyBaiViet />},
            {path:'quanlydanhmuc', element:<QuanLyDanhMuc />},
            {path:'thongke', element:<ThongKe />},
            
        ]
    },
    {   
        path: '/bientapvien', element: <BienTapVienLayout />,
        children:[
            
            {path:'soanthao', element:<SoanThao />},
            {path:'quanlybaibao', element:<QuanLyDanhSachBaiBao />},
            {path:'bannhap', element:<BanNhap />}
            

        ]
    },
    {
        path: '/single/:id',
        element: <Single />
    }
]);

export default router 