import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Armchair,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosClient } from "../../utils/axiosClient";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [styles, setStyles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const totalCartItems =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, roomRes, styleRes] = await Promise.all([
          axiosClient.get("/categories"),
          axiosClient.get("/rooms"),
          axiosClient.get("/styles"),
        ]);
        setCategories(catRes.data);
        setRooms(roomRes.data);
        setStyles(styleRes.data);
      } catch (error) {}
    };
    fetchMenuData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchKeyword.trim().length >= 2) {
        try {
          const res = await axiosClient.get(
            `/products?activeOnly=true&search=${encodeURIComponent(searchKeyword.trim())}`,
          );
          setSuggestions(res.data.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Lỗi lấy gợi ý:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword("");
      setShowSuggestions(false);
    }
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-white border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setIsMenuOpen(false)}>
            <Armchair className="text-primary w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tighter text-primary">
              LUXE FURNISH
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8 h-full">
            <div className="group h-full flex items-center">
              <span className="text-sm font-bold flex items-center gap-1 hover:text-primary transition-colors cursor-pointer uppercase tracking-tight h-full">
                <Link to={`/products`} className="">
                  Sản phẩm
                </Link>
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </span>
              <div className="absolute top-[80px] left-0 w-full bg-white border-t border-slate-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
                  <div className="w-3/4 grid grid-cols-4 gap-y-5 gap-x-8 content-start">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          className="block text-[14px] text-slate-600 hover:text-primary transition-colors">
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div className="text-[14px] text-slate-400">
                        Đang tải...
                      </div>
                    )}
                  </div>
                  <div className="w-1/4">
                    <img
                      src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600"
                      alt="Furniture"
                      className="w-full h-[260px] object-cover rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="group h-full flex items-center">
              <span className="text-sm font-bold flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors cursor-pointer uppercase tracking-tight h-full">
                Phòng
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </span>
              <div className="absolute top-[80px] left-0 w-full bg-white border-t border-slate-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
                  <div className="w-3/4 grid grid-cols-4 gap-y-5 gap-x-8 content-start">
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <Link
                          key={room.id}
                          to={`/room/${room.slug}`}
                          className="block text-[14px] text-slate-600 hover:text-primary transition-colors">
                          {room.name}
                        </Link>
                      ))
                    ) : (
                      <div className="text-[14px] text-slate-400">
                        Đang tải...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/collections"
              className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-tight">
              Bộ sưu tập
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative" ref={dropdownRef}>
              <form 
                onSubmit={handleSearch}
                className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-56 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
                <Search className="text-slate-500 w-4 h-4 mr-2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onFocus={() => searchKeyword.length >= 2 && setShowSuggestions(true)}
                  placeholder="Tìm kiếm..."
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
                />
              </form>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sản phẩm gợi ý
                      </div>
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.slug}`}
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchKeyword("");
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                            <img 
                              src={product.thumbnail} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs font-bold text-primary">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <button
                        onClick={handleSearch}
                        className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-primary border-t border-slate-50 transition-colors"
                      >
                        Xem tất cả kết quả
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors hidden sm:block">
              <Heart className="w-5 h-5" />
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-2">
                <Link
                  to="/profile"
                  className="text-sm font-medium text-slate-700 hover:text-primary transition-all">
                  Chào, {user.full_name || user.fullName}
                </Link>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* 4. SỬA LẠI KHU VỰC ICON GIỎ HÀNG */}
            <Link
              to="/cart"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {totalCartItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-lg absolute w-full left-0 top-full">
            <div className="px-4 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <details className="group">
                <summary className="flex items-center justify-between w-full text-[13px] font-bold uppercase tracking-tight list-none cursor-pointer py-2">
                  Sản phẩm
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 mt-2 space-y-3 border-l-2 border-slate-100">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-[14px] font-medium text-slate-600 hover:text-primary py-1 w-full text-left">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between w-full text-[13px] font-bold text-orange-500 uppercase tracking-tight list-none cursor-pointer py-2">
                  Phòng
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 mt-2 space-y-3 border-l-2 border-slate-100">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      to={`/room/${room.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-[14px] font-medium text-slate-600 hover:text-primary py-1 w-full text-left">
                      {room.name}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                to="/collections"
                onClick={() => setIsMenuOpen(false)}
                className="block text-[13px] font-bold text-primary uppercase tracking-tight py-2"
              >
                Bộ sưu tập
              </Link>

              <div className="pt-4 border-t border-slate-100 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-[14px] font-bold text-slate-700 hover:text-primary transition-all">
                      Chào, {user.full_name || user.fullName}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-[14px] font-bold text-red-500 w-full text-left">
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-[14px] font-bold text-primary w-full text-left">
                    Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
