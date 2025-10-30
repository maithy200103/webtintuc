import React from 'react';
import Header from '../components/users/Header';
import Footer from '../components/users/Footer';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}