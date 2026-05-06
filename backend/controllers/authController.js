import { supabase } from "../config/supabase.js";
import nodemailer from "nodemailer";

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "nguyenbaolong16869@gmail.com",
    pass: process.env.EMAIL_PASS || "nynqfzalxjzquosd",
  },
});

export const sendOtp = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký!" });
    }

    // Bắt lỗi User Already Registered sớm: Kiểm tra xem email đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res
        .status(400)
        .json({
          message:
            "Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc dùng email khác!",
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      password,
      fullName,
      phone,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`[DEV ONLY] Mã OTP Đăng ký cho ${email} là: ${otp}`);

    try {
      await transporter.sendMail({
        from: '"Furniture Hub" <no-reply@furniturehub.com>',
        to: email,
        subject: "Mã xác thực Đăng ký tài khoản",
        html: `<h3>Chào ${fullName},</h3>
               <p>Mã xác nhận OTP của bạn là: <strong style="font-size:24px; color:#2b4c4f;">${otp}</strong></p>
               <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>`,
      });
    } catch (mailError) {
      console.warn(
        "Không thể gửi Email thực tế, hệ thống đã in Log (có thể do chưa cấu hình SMTP).",
      );
    }

    res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn!" });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(400).json({ message: "Không thể tạo mã OTP" });
  }
};

export const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storeData = otpStore.get(email);
    if (!storeData) {
      return res.status(400).json({
        message:
          "Phiên đăng ký đã hết hạn hoặc không tồn tại, vui lòng lấy lại mã.",
      });
    }

    if (Date.now() > storeData.expiresAt) {
      otpStore.delete(email);
      return res
        .status(400)
        .json({ message: "Mã OTP đã hết hạn. Vui lòng lấy mã mới." });
    }

    if (storeData.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }

    // Correct OTP -> Actually create the user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: storeData.password,
    });

    console.log("[DEBUG] authError:", authError);
    console.log("[DEBUG] authData:", JSON.stringify(authData, null, 2));

    if (authError) throw authError;

    // Nếu email đã tồn tại trong auth.users nhưng bị thiếu trong public.users,
    // Supabase sẽ trả về user: null (để bảo mật chống dò email).
    if (!authData || !authData.user) {
      throw new Error("User already registered");
    }

    const userId = authData.user.id;
    console.log("[DEBUG] userId extracted:", userId);


    const { error: dbError } = await supabase.from("users").upsert(
      {
        id: userId,
        email: email,
        full_name: storeData.fullName,
        phone: storeData.phone,
        role: "customer",
      },
      { onConflict: "id" },
    );

    console.log("[DEBUG] dbError:", dbError);

    if (dbError) throw dbError;

    // Clear the OTP store for this user
    otpStore.delete(email);

    // Auto login
    let sessionRes = authData.session;
    if (!sessionRes) {
      const { data: signData, error: signErr } =
        await supabase.auth.signInWithPassword({
          email,
          password: storeData.password,
        });
      if (!signErr) {
        sessionRes = signData.session;
      }
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    res.status(201).json({
      message: "Xác thực và Đăng ký thành công!",
      user: userData || {
        id: userId,
        email,
        full_name: storeData.fullName,
        role: "customer",
      },
      session: sessionRes,
    });
  } catch (error) {
    console.error("[DEBUG] Lỗi xác minh OTP chi tiết:", error);
    // Dịch lỗi Supabase sang tiếng Việt để người dùng tránh hoang mang
    let errorMsg = error.message;
    if (errorMsg === "User already registered") {
      errorMsg = "Tài khoản email này đã được ai đó đăng ký trước đó rồi.";
    }
    res.status(400).json({ message: errorMsg || "Lỗi khi xác minh tài khoản" });
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
      const { error: insertError } = await supabase
        .from("user_addresses")
        .insert([
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

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi lấy thông tin profile:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, phone } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ full_name, phone })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    res
      .status(200)
      .json({ message: "Cập nhật thông tin thành công", user: data });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
