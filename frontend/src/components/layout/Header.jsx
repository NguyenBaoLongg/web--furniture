import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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

export const Header = ({ cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);

  const headerRef = useRef(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, roomRes] = await Promise.all([
          axios.get("http://localhost:5000/api/categories"),
          axios.get("http://localhost:5000/api/rooms"),
        ]);
        setCategories(catRes.data);
        setRooms(roomRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu menu:", error);
      }
    };
    fetchMenuData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setIsMenuOpen(false)}>
            <Armchair className="text-primary w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tighter text-primary">
              LUXE FURNISH
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div className="relative group">
              <span className="text-sm font-bold flex items-center gap-1 hover:text-primary transition-colors cursor-pointer uppercase tracking-tight py-8">
                Sản phẩm{" "}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </span>
              <div className="absolute top-[80px] left-0 w-48 bg-white border border-primary/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-slate-400">
                    Đang tải...
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <span className="text-sm font-bold flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors cursor-pointer uppercase tracking-tight py-8">
                Phòng{" "}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </span>
              <div className="absolute top-[80px] left-0 w-48 bg-white border border-primary/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <Link
                      key={room.id}
                      to={`/room/${room.slug}`}
                      className="block px-4 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors">
                      {room.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-slate-400">
                    Đang tải...
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/shop"
              className="text-sm font-semibold hover:text-primary transition-colors">
              Cửa hàng
            </Link>
            <Link
              to="/collections"
              className="text-sm font-semibold hover:text-primary transition-colors">
              Bộ sưu tập
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden lg:flex items-center bg-primary/5 rounded-full px-4 py-2 border border-primary/10 hover:bg-primary/10 transition-colors">
              <Search className="text-primary w-4 h-4" />
              <span className="text-sm text-primary/60 ml-2">Tìm kiếm...</span>
            </button>
            <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors hidden sm:block">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
              className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-primary"
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
            className="md:hidden bg-background-light border-b border-primary/10 overflow-hidden shadow-lg absolute w-full left-0 top-full">
            <div className="px-4 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <details className="group">
                <summary className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-tight list-none cursor-pointer py-2">
                  Sản phẩm{" "}
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary/10">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-sm text-slate-500 hover:text-primary py-2 w-full text-left">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between w-full text-sm font-bold text-orange-500 uppercase tracking-tight list-none cursor-pointer py-2">
                  Phòng{" "}
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-orange-500/20">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      to={`/room/${room.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-sm text-slate-500 hover:text-orange-500 py-2 w-full text-left">
                      {room.name}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
