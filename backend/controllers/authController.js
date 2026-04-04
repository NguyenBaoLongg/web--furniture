import { supabase } from "../config/supabase.js";

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;
    const userId = authData.user.id;
    const { error: dbError } = await supabase.from("users").insert([
      {
        id: userId,
        email: email,
        full_name: fullName,
        phone: phone,
        role: "customer",
      },
    ]);
    if (dbError) throw dbError;
    res.status(201).json({
      message: "abc",
      user: { id: userId, email, fullName },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res
      .status(400)
      .json({ message: error.message || "Lỗi khi đăng ký tài khoản" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) throw userError;
    res.status(200).json({
      message: "Đăng nhập thành công!",
      session: data.session,
      user: userData,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { user_id, receiver_name, phone_number, street_address, ward, city } =
      req.body;

    if (!user_id) return res.status(400).json({ message: "Thiếu user_id" });

    // 1. Tìm địa chỉ mặc định của user
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_default", true)
      .maybeSingle();

    if (existingAddress) {
      // Cập nhật địa chỉ hiện tại
      const { error: updateError } = await supabase
        .from("user_addresses")
        .update({
          receiver_name,
          phone_number,
          street_address,
          ward: ward || "",
          city: city || "",
        })
        .eq("id", existingAddress.id);
      if (updateError) throw updateError;
    } else {
      // Tạo địa chỉ mặc định mới
      const { error: insertError } = await supabase.from("user_addresses").insert([
        {
          user_id,
          receiver_name,
          phone_number,
          street_address,
          ward: ward || "",
          city: city || "",
          is_default: true,
        },
      ]);
      if (insertError) throw insertError;
    }

    // 2. Cập nhật luôn số điện thoại trong bảng users để đồng bộ profile
    await supabase
      .from("users")
      .update({ phone: phone_number })
      .eq("id", user_id);

    res.status(200).json({ message: "Cập nhật địa chỉ và SĐT thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error);
    res.status(500).json({ message: "Lỗi Server khi cập nhật địa chỉ" });
  }
};

export const getAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: address, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json(address || null);
  } catch (error) {
    console.error("Lỗi lấy địa chỉ:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
