import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { ProductCard } from "../../components/ui/ProductCard";

export const RoomDetailPage = () => {
  const { roomSlug } = useParams();

  const [products, setProducts] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [roomsResponse, productsResponse] = await Promise.all([
          axiosClient.get(`/rooms`),
          axiosClient.get(`/products/room/${roomSlug}`),
        ]);

        const currentRoom = roomsResponse.data.find((r) => r.slug === roomSlug);

        setRoomInfo(currentRoom);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (roomSlug) {
      fetchData();
    }
  }, [roomSlug]);

  return (
    <div className="space-y-0 pb-20">
      <div
        className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-primary/90 bg-cover bg-center"
        style={{
          backgroundImage: roomInfo?.image_url
            ? `url(${roomInfo.image_url})`
            : "none",
        }}>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 text-white max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
            {roomInfo?.name || roomSlug}
          </h1>
          <div className="flex items-center gap-2 text-sm opacity-90 font-medium">
            <Link to="/" className="hover:text-orange-400 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-orange-400">
              {roomInfo?.name || roomSlug}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 flex items-center justify-between border-b border-primary/10">
        <div className="text-sm font-bold text-slate-500">
          {products.length} Sản phẩm
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">
            Hiện tại chưa có sản phẩm nào trong khu vực này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                title={product.title}
                price={product.price}
                image={product.thumbnail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
