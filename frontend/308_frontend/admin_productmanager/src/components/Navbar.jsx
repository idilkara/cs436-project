import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import home_icon from "../assets/home.png"; // Import your custom Dashboard icon
import { AiOutlineMenu, AiOutlineClose, AiOutlineUnorderedList, AiOutlineComment } from "react-icons/ai";

const Navbar = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const navigate = useNavigate();

    const handleMenuToggle = () => setMenuVisible(!menuVisible);

    const handleLogout = () => {
        window.location.href = 'http://localhost:5173/login';
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-xl relative">
            {/* Navbar Left Section */}
            <div className="flex items-center space-x-3">
                <AiOutlineMenu onClick={handleMenuToggle} className="w-6 h-6 cursor-pointer" />
                <img src={logo} alt="Logo" className="w-14 h-16" />
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>

            {/* Navbar Right Section */}
            <div className="flex space-x-4">
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                    Logout
                </button>
            </div>

            {/* Collapsible Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg z-30 transform ${
                    menuVisible ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out`}
            >
                <AiOutlineClose
                    onClick={handleMenuToggle}
                    className="w-6 h-6 cursor-pointer text-white m-4"
                />
                <div className="flex flex-col space-y-4 p-4">
                    <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <img src={home_icon} alt="Dashboard" className="w-5 h-5" />
                        Home 
                    </Link>
                    <Link to="/products" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineUnorderedList className="w-5 h-5" />
                        Products
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineUnorderedList className="w-5 h-5" />
                        Orders
                    </Link>
                    <Link to="/invoice" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineUnorderedList className="w-5 h-5" />
                        Invoice
                    </Link>
                    <Link to="/comment-moderation" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineComment className="w-5 h-5" />
                        Comment Moderation
                    </Link>
                    <Link to="/delivery-list" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineComment className="w-5 h-5" />
                        Delivery List
                    </Link>
                    <Link to="/category-management" className="flex items-center gap-2 hover:text-blue-300" onClick={handleMenuToggle}>
                        <AiOutlineComment className="w-5 h-5" />
                        Category Management
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;