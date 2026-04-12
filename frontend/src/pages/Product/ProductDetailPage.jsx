import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  ShieldCheck,
  Package,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";
import { ProductCard } from "../../components/ui/ProductCard";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [allGallery, setAllGallery] = useState([]);
  const [displayImages, setDisplayImages] = useState([]);
  const [mainImage, setMainImage] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("kich-thuoc");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/products/${slug}`);
        const productData = response.data;

        setProduct(productData);

        let allImages = [];
        if (productData.thumbnail) allImages.push(productData.thumbnail);

        if (productData.product_images?.length > 0) {
          productData.product_images.forEach((img) => {
            if (img.image_url) allImages.push(img.image_url);
          });
        }

        allImages = [...new Set(allImages)];
        setAllGallery(allImages);
        setDisplayImages(allImages);
        setMainImage(allImages[0] || productData.thumbnail || "");

        const relatedRes = await axiosClient.get("/products/new-arrivals");
        setRelatedProducts(relatedRes.data.slice(0, 4));

        if (user?.id) {
          try {
            const favRes = await axiosClient.get(`/wishlist/check/${user.id}/${productData.id}`);
            setIsFavorite(favRes.data.isFavorite);
          } catch (error) {
            console.error("Lỗi kiểm tra wishlist", error);
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProductData();
  }, [slug, user]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    if (!product) return;

    try {
      const res = await axiosClient.post("/wishlist/toggle", {
        user_id: user.id,
        product_id: product.id,
      });
      setIsFavorite(res.data.isFavorite);
      toast.success(res.data.message === "Added to wishlist" ? "Đã thêm vào mục yêu thích" : "Đã xoá khỏi mục yêu thích");
    } catch (error) {
      console.error("Lỗi cập nhật wishlist", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const formatPrice = (price) => `${Number(price).toLocaleString("en-US")} VND`;
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < Math.floor(rating || 5)
            ? "fill-amber-400 text-amber-400"
            : "fill-slate-200 text-slate-200"
        }`}
      />
    ));
  };

  const totalStock = product.stock || 0;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-slate-50/50 py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3 h-3" />
            {product.categories && (
              <>
                <Link
                  to={`/category/${product.categories.slug}`}
                  className="hover:text-primary transition-colors">
                  {product.categories.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-slate-900 font-semibold">
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4 w-full overflow-hidden">
            <div className="relative aspect-[4/3] bg-[#f8f9fa] rounded-lg overflow-hidden flex items-center justify-center p-8">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
              />
              <button className="absolute top-4 right-4 bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-slate-500 hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 relative bg-[#f8f9fa] rounded-lg overflow-hidden cursor-pointer border-2 transition-colors flex items-center justify-center p-2 snap-start ${
                      mainImage === img
                        ? "border-primary"
                        : "border-transparent hover:border-slate-200"
                    }`}>
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-4">
            <div className="flex items-center gap-4 mb-3">
              {product.is_new_arrival && (
                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  New Arrival
                </span>
              )}
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-xs text-slate-500 ml-1">
                  ({product.review_count || 0} Đánh giá)
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2">
              {product.title}
            </h1>
            <div className="text-xl font-medium text-slate-900 mb-6">
              {formatPrice(product.price)}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {product.product_rooms && product.product_rooms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-center mr-2">
                  Phù hợp cho:
                </span>
                {product.product_rooms.map((pr, idx) => (
                  <Link
                    key={idx}
                    to={`/room/${pr.rooms?.slug}`}
                    className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all">
                    {pr.rooms?.name}
                  </Link>
                ))}
              </div>
            )}

            {product.product_colors && product.product_colors.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  MÀU SẮC & PHONG THỦY:
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {product.product_colors.map((pc, idx) => {
                    const color = pc.colors;
                    if (!color) return null;
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50/50 pr-4 pl-1 py-1 rounded-full border border-slate-100 hover:border-primary/20 transition-colors">
                        <div
                          className="w-8 h-8 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-900 leading-none mb-1">
                            {color.name}
                          </span>
                          <span className={`text-[9px] font-medium leading-none ${
                            color.element === 'Kim' ? 'text-slate-500' :
                            color.element === 'Mộc' ? 'text-green-600' :
                            color.element === 'Thủy' ? 'text-blue-600' :
                            color.element === 'Hỏa' ? 'text-red-600' :
                            'text-amber-700'
                          }`}>
                            Hợp mệnh {color.element}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-10 mt-auto">
              <div className="flex items-center border border-slate-200 h-12 w-32 rounded-sm overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex-shrink-0 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="flex-1 w-10 min-w-0 h-full text-center text-sm font-bold border-none focus:ring-0 p-0 bg-transparent"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex-shrink-0 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({
                    product_id: product.id,
                    variant_id: null,
                    quantity: quantity,
                  });
                }}
                className="flex-1 h-12 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm">
                Thêm vào giỏ hàng
              </button>

              <button 
                onClick={toggleWishlist}
                className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border transition-colors rounded-sm ${
                  isFavorite 
                    ? "border-red-500 text-red-500 bg-red-50" 
                    : "border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500"
                }`}>
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 py-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase">
                    Trạng thái
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {totalStock > 0 ? "Còn hàng" : "Liên hệ"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Thông số kỹ thuật
        </h2>
        <div className="border-t border-slate-200">
          <div className="border-b border-slate-200">
            <button
              onClick={() =>
                setActiveTab(activeTab === "kich-thuoc" ? "" : "kich-thuoc")
              }
              className="w-full flex items-center justify-between py-5 text-left focus:outline-none">
              <span className="text-sm font-bold text-slate-900">
                Kích thước & Trọng lượng
              </span>
              {activeTab === "kich-thuoc" ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {activeTab === "kich-thuoc" && (
              <div className="pb-6 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">
                    Chiều rộng tổng thể:
                  </div>
                  <div className="font-medium text-slate-900">
                    {product.width || "Đang cập nhật"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Chiều sâu tổng thể:</div>
                  <div className="font-medium text-slate-900">
                    {product.depth || "Đang cập nhật"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Chiều cao mặt ghế:</div>
                  <div className="font-medium text-slate-900">
                    {product.height || "Đang cập nhật"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Trọng lượng:</div>
                  <div className="font-medium text-slate-900">
                    {product.weight || "Đang cập nhật"}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-b border-slate-200">
            <button
              onClick={() =>
                setActiveTab(activeTab === "vat-lieu" ? "" : "vat-lieu")
              }
              className="w-full flex items-center justify-between py-5 text-left focus:outline-none">
              <span className="text-sm font-bold text-slate-900">
                Vật liệu & Kết cấu
              </span>
              {activeTab === "vat-lieu" ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {activeTab === "vat-lieu" && (
              <div className="pb-6 text-sm text-slate-600">
                {product.material || "Đang cập nhật thông tin vật liệu."}
              </div>
            )}
          </div>
          <div className="border-b border-slate-200">
            <button
              onClick={() =>
                setActiveTab(activeTab === "cham-soc" ? "" : "cham-soc")
              }
              className="w-full flex items-center justify-between py-5 text-left focus:outline-none">
              <span className="text-sm font-bold text-slate-900">
                Hướng dẫn chăm sóc
              </span>
              {activeTab === "cham-soc" ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {activeTab === "cham-soc" && (
              <div className="pb-6 text-sm text-slate-600">
                {product.care_instructions ||
                  "Đang cập nhật hướng dẫn chăm sóc."}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
          Hoàn thiện phong cách
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.title}
              price={item.price}
              image={item.thumbnail}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
