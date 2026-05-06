import { supabase } from "../config/supabase.js";

export const getOrCreateConversation = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { data: existing, error: findError } = await supabase
      .from("conversations")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return res.status(200).json(existing);
    }

    // Nếu chưa có, tạo mới
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert([{ customer_id: customerId, status: "active" }])
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json(newConv);
  } catch (error) {
    console.error("Lỗi getOrCreateConversation:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// LS tin nhắn
export const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          role
        )
      `,
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi getChatHistory:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, sender_id, content } = req.body;

    // Chèn tin nhắn mới
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert([{ conversation_id, sender_id, content }])
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          role
        )
      `,
      )
      .single();

    if (messageError) throw messageError;

    // TG lần cuối nhắn
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation_id);

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi sendMessage:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Lấy danh sách tất cả cuộc hội thoại
export const getAllConversations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        customer:users!conversations_customer_id_fkey (
          id,
          full_name,
          email
        ),
        staff:users!conversations_staff_id_fkey (
          id,
          full_name
        )
      `,
      )
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi getAllConversations:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Gán nhân viên phụ trách cuộc hội thoại
export const assignStaff = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { staffId } = req.body;

    const { data, error } = await supabase
      .from("conversations")
      .update({ staff_id: staffId })
      .eq("id", conversationId)
      .select()
      .single();

    if (error) throw error;

    res
      .status(200)
      .json({ message: "Đã gán nhân viên phụ trách", conversation: data });
  } catch (error) {
    console.error("Lỗi assignStaff:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
