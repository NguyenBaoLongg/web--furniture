import React, { useState, useEffect, useRef } from "react";
import { Search, Send, User, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../config/supabase";
import axios from "axios";

export const StaffSupportPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const scrollRef = useRef(null);

  // 1. Lấy tất cả cuộc hội thoại
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/chat/conversations",
      );
      setConversations(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách hội thoại:", error);
    }
  };

  // 2. Lấy lịch sử khi chọn một cuộc hội thoại
  useEffect(() => {
    if (selectedConv) {
      fetchHistory(selectedConv.id);

      // Tự động gán nhân viên nếu chưa có ai phụ trách
      if (!selectedConv.staff_id) {
        assignMe(selectedConv.id);
      }
    }
  }, [selectedConv]);

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/history/${id}`,
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử chat:", error);
    }
  };

  const assignMe = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/chat/assign/${id}`, {
        staffId: user.id,
      });
      fetchConversations(); // Reload list
    } catch (error) {
      console.error("Lỗi gán nhân viên:", error);
    }
  };

  // 3. Realtime cho tin nhắn mới
  useEffect(() => {
    if (!selectedConv) return;

    const channel = supabase
      .channel(`staff_chat:${selectedConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConv.id}`,
        },
        async (payload) => {
          // Kiểm tra xem tin nhắn đã tồn tại trong state chưa (tránh trùng lặp khi vừa gửi vừa nhận)
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;

            // Nếu chưa có, lấy đầy đủ thông tin sender
            const fetchFullMsg = async () => {
              const { data: fullMsg } = await supabase
                .from("messages")
                .select(
                  `
                  *,
                  sender:users!messages_sender_id_fkey (id, full_name, role)
                `,
                )
                .eq("id", payload.new.id)
                .single();

              if (fullMsg) {
                setMessages((p) => {
                  if (p.find((m) => m.id === fullMsg.id)) return p;
                  return [...p, fullMsg];
                });
                setConversations((convs) =>
                  convs.map((c) =>
                    c.id === selectedConv.id
                      ? { ...c, last_message_at: fullMsg.created_at }
                      : c,
                  ),
                );
              }
            };
            fetchFullMsg();
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv]);

  // Realtime cho các cuộc hội thoại mới (khách hàng nhắn lần đầu)
  useEffect(() => {
    const convChannel = supabase
      .channel("new_conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => fetchConversations(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const res = await axios.post("http://localhost:5000/api/chat/send", {
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content: newMessage,
      });

      // Hiển thị ngay lập tức tin nhắn vừa gửi
      const sentMsg = res.data;
      setMessages((prev) => {
        if (prev.find((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      setNewMessage("");

      // Cập nhật thời gian tin nhắn mới nhất ở danh sách bên trái
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message_at: sentMsg.created_at }
            : c,
        ),
      );
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 p-6 font-sans">
      {/* Left Panel: Conversations List */}
      <div className="w-96 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-900 mb-4">
            Hỗ trợ khách hàng
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2b4c4f] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const isActive = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  isActive
                    ? "bg-slate-50 border-[#2b4c4f]"
                    : "border-transparent hover:bg-slate-50"
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2b4c4f]/10 flex items-center justify-center text-[#2b4c4f] font-bold">
                    {conv.customer?.full_name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {conv.customer?.full_name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.last_message_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.staff_id ? (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                          <CheckCircle size={10} />
                          <span>
                            {conv.staff?.full_name?.split(" ").pop()} đang hỗ
                            trợ
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                          <Clock size={10} />
                          <span>Đang chờ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Chat Window */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {selectedConv.customer?.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900">
                    {selectedConv.customer?.full_name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedConv.customer?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {messages.map((msg, index) => {
                const nextMsg = messages[index + 1];
                const prevMsg = messages[index - 1];
                
                // Kiểm tra tin nhắn cuối cùng trong nhóm gửi liên tiếp
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                // Hiện mốc thời gian nếu cách nhau > 30 phút
                const showTimeDivider = !prevMsg || 
                  (new Date(msg.created_at) - new Date(prevMsg.created_at)) > 30 * 60 * 1000;

                const isFromCustomer = msg.sender_id === selectedConv.customer_id;
                const isFromMe = msg.sender_id === user.id;

                return (
                  <React.Fragment key={msg.id}>
                    {showTimeDivider && (
                      <div className="flex justify-center my-6">
                        <span className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm uppercase tracking-widest border border-slate-100">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex items-end gap-2 ${!isFromCustomer ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-6" : "mb-1"}`}>
                      {/* Avatar đối phương */}
                      {isFromCustomer && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {isLastInGroup ? (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden">
                              {msg.sender?.full_name?.charAt(0) || "C"}
                            </div>
                          ) : <div className="w-8" />}
                        </div>
                      )}

                      <div className={`max-w-[70%] flex flex-col ${!isFromCustomer ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all hover:scale-[1.01] ${
                            !isFromCustomer
                              ? "bg-[#2b4c4f] text-white rounded-tr-none"
                              : "bg-white text-black rounded-tl-none border border-slate-200"
                          }`}
                        >
                          {msg.content}
                        </div>
                        
                        {isLastInGroup && (
                          <div className={`flex items-center gap-2 mt-1 px-1`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {isFromMe ? "BẠN" : msg.sender?.full_name?.split(' ').pop()}
                            </span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-6 bg-white border-t border-slate-50 flex gap-4">
              <input
                type="text"
                placeholder="Nhập câu trả lời cho khách hàng..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#2b4c4f] transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#2b4c4f] text-white px-8 rounded-2xl font-bold text-sm hover:bg-[#1e3537] shadow-lg shadow-[#2b4c4f]/20 transition-all flex items-center gap-2">
                <Send size={18} />
                Gửi phản hồi
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <User size={40} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Chọn một cuộc hội thoại
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Chọn một khách hàng từ danh sách bên trái để bắt đầu hỗ trợ trực
              tuyến.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
