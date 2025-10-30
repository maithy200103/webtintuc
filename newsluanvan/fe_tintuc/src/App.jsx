import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from './pages/users/home';
import Blog from './pages/users/blog';
import ContactUs from './pages/users/Contact_us';
import Header from './components/users/Header';
import Footer from './components/users/Footer';



import Admin from './pages/admin/taotaikhoan';
import Login_ad_btv from './pages/admin/login_ad-btv';

import './App.css';

// function Navigation() {
//   return (
//     <nav>
//       <Link to="/">Go Home</Link>
//       <Link to="/blog">Go to Blog</Link>
//       <Link to="/contact">Contact Us</Link>
//     </nav>
//   );
// }
import paths from './router';
import { RouterProvider } from 'react-router-dom';
function App() {
  return (
    <RouterProvider router={paths} />
  );
}

export default App;
