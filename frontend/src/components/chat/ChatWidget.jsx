import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../config/supabase";
import axios from "axios";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const { user } = useAuth();
  const scrollRef = useRef(null);

  // 1. Lấy hoặc tạo cuộc hội thoại khi mở chat
  useEffect(() => {
    if (isOpen && user && !conversation) {
      const initChat = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/chat/conversations/customer/${user.id}`,
          );
          setConversation(res.data);

          // Lấy lịch sử
          const historyRes = await axios.get(
            `http://localhost:5000/api/chat/history/${res.data.id}`,
          );
          setMessages(historyRes.data);
        } catch (error) {
          console.error("Lỗi khởi tạo chat:", error);
        }
      };
      initChat();
    }
  }, [isOpen, user, conversation]);

  // 2. Lắng nghe tin nhắn mới qua Supabase Realtime
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          setMessages((prev) => {
            // Tránh trùng lặp tin nhắn vừa tự gửi
            if (prev.find((m) => m.id === payload.new.id)) return prev;

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
                setMessages((p) => [...p, fullMsg]);
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
  }, [conversation]);

  // 3. Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    try {
      const res = await axios.post("http://localhost:5000/api/chat/send", {
        conversation_id: conversation.id,
        sender_id: user.id,
        content: newMessage,
      });

      const sentMsg = res.data;
      setMessages((prev) => {
        if (prev.find((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      setNewMessage("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  if (!user) return null; // Chỉ hiện cho user đã đăng nhập

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-[#2b4c4f] rotate-0"
        }`}>
        {isOpen ? (
          <X className="text-white w-6 h-6" />
        ) : (
          <MessageCircle className="text-white w-6 h-6" />
        )}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#2b4c4f] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Hỗ trợ trực tuyến</h3>
                <p className="text-[10px] text-white/70">
                  Chúng tôi sẵn sàng giúp bạn!
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400">
                  Hãy gửi tin nhắn đầu tiên để được hỗ trợ!
                </p>
              </div>
            )}
            {messages.map((msg, index) => {
              const nextMsg = messages[index + 1];
              const prevMsg = messages[index - 1];

              const isLastInGroup =
                !nextMsg || nextMsg.sender_id !== msg.sender_id;
              const showTimeDivider =
                !prevMsg ||
                new Date(msg.created_at) - new Date(prevMsg.created_at) >
                  30 * 60 * 1000;

              const isFromStaff =
                msg.sender?.role === "staff" || msg.sender?.role === "admin";

              return (
                <React.Fragment key={msg.id}>
                  {showTimeDivider && (
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-widest border border-slate-50">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 ${
                      !isFromStaff ? "justify-end" : "justify-start"
                    } ${isLastInGroup ? "mb-4" : "mb-0.5"}`}>
                    {/* Avatar của Nhân viên bên Trái */}
                    {isFromStaff && (
                      <div className="w-6 h-6 flex-shrink-0">
                        {isLastInGroup ? (
                          <div className="w-6 h-6 rounded-full bg-[#2b4c4f] flex items-center justify-center text-[8px] font-black text-white overflow-hidden shadow-sm">
                            {msg.sender?.full_name?.charAt(0) || "S"}
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] flex flex-col ${
                        !isFromStaff ? "items-end" : "items-start"
                      }`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-[13px] leading-snug shadow-sm ${
                          !isFromStaff
                            ? "bg-[#2b4c4f] text-white rounded-tr-none"
                            : "bg-white text-black rounded-tl-none border border-slate-200"
                        }`}>
                        {msg.content}
                      </div>

                      {isLastInGroup && isFromStaff && (
                        <p className="text-[9px] text-slate-400 font-bold mt-1 px-1 uppercase">
                          {msg.sender?.full_name?.split(" ").pop()}
                        </p>
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
            className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2b4c4f] transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-[#2b4c4f] text-white p-2.5 rounded-2xl hover:bg-[#1e3537] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
