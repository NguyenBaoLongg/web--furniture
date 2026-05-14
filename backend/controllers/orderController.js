import { supabase } from "../config/supabase.js";
import { vnpay } from "../config/vnpay.js";
import { dateFormat } from "vnpay";
import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { user_id, address, items, total_price, payment_method, note, payment_status, status } =
      req.body;
    let addressId;
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user_id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingAddress) {
      const { data: updatedAddress, error: addrError } = await supabase
        .from("user_addresses")
        .update({
          receiver_name: address.receiver_name,
          phone_number: address.phone_number,
          street_address: address.street_address,
          city: address.city || "HNoi",
          ward: address.ward || "",
        })
        .eq("id", existingAddress.id)
        .select()
        .single();

      if (addrError) throw addrError;
      addressId = updatedAddress.id;
    } else {
      const { data: newAddress, error: addrError } = await supabase
        .from("user_addresses")
        .insert([
          {
            user_id,
            receiver_name: address.receiver_name,
            phone_number: address.phone_number,
            street_address: address.street_address,
            city: address.city || "HNoi",
            ward: address.ward || "",
            is_default: true,
          },
        ])
        .select()
        .single();

      if (addrError) throw addrError;
      addressId = newAddress.id;
    }

    await supabase
      .from("users")
      .update({ phone: address.phone_number })
      .eq("id", user_id);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          address_id: addressId,
          total_price,
          payment_method,
          status: status || "pending",
          payment_status: payment_status || "unpaid",
          note: note || "",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Tạo chi tiết đơn hàng
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Ghi log trạng thái order_status_history
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert([
        {
          order_id: order.id,
          old_status: null,
          new_status: status || "pending",
          note: payment_status === "paid" ? "Đã thanh toán qua Chuyển khoản" : "Hệ thống ghi nhận đơn hàng mới",
        },
      ]);
    if (historyError) throw historyError;

    // 4. Xóa giỏ hàng sau khi đặt hàng thành công
    if (payment_method !== "vnpay") {
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user_id);

      if (clearCartError) console.error("Lỗi xóa giỏ hàng:", clearCartError);
    }

    res.status(201).json({
      message: "Đặt hàng thành công",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi Server khi tạo đơn hàng" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products ( title, thumbnail )
        ),
        user_addresses ( * ),
        order_status_history ( * )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    let { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products ( id, title, thumbnail, price )
        ),
        user_addresses ( * ),
        order_status_history ( * )
      `,
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error("Supabase query error in getOrderById:", error);
    }

    if (!data && orderId.length === 24) {
      const { data: allOrders } = await supabase.from("orders").select("id");
      const matchedOrder = allOrders?.find((o) =>
        String(o.id).replace(/-/g, "").startsWith(orderId),
      );

      if (matchedOrder) {
        const { data: detailedOrder, error: detailedError } = await supabase
          .from("orders")
          .select(
            `*, order_items(*, products(id, title, thumbnail, price)), user_addresses(*), order_status_history(*)`,
          )
          .eq("id", matchedOrder.id)
          .single();
        if (detailedError) console.error("Supabase error fetching matched order:", detailedError);
        data = detailedOrder;
      }
    }

    if (!data)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const createVnpayPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode } = req.body;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const txnRef = String(order.id).replace(/-/g, "").slice(0, 24);

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: Math.round(order.total_price),
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_Locale: "vn",
      vnp_CreateDate: dateFormat(new Date()),
      ...(bankCode && { vnp_BankCode: bankCode }),
    });

    console.log("VNPay Payment URL created:", paymentUrl);
    res.json({ metadata: paymentUrl });
  } catch (error) {
    console.error("Lỗi tạo URL thanh toán VNPay:", error);
    res.status(500).json({ message: "Lỗi Server khi tạo URL thanh toán" });
  }
};

const logTransaction = async (orderId, userId, queryData) => {
  try {
    const transactionData = {
      order_id: orderId,
      user_id: userId,
      amount: parseInt(queryData.vnp_Amount) / 100,
      transaction_no: queryData.vnp_TransactionNo,
      bank_code: queryData.vnp_BankCode,
      card_type: queryData.vnp_CardType,
      order_info: queryData.vnp_OrderInfo,
      response_code: queryData.vnp_ResponseCode,
      txn_ref: queryData.vnp_TxnRef,
      raw_response: queryData,
    };

    const { error } = await supabase
      .from("payment_transactions")
      .insert([transactionData]);

    if (error) {
      console.error("Error logging transaction:", error);
    }
  } catch (err) {
    console.error("Critical error in logTransaction:", err);
  }
};

export const handleVnpayIpn = async (req, res) => {
  try {
    const verify = vnpay.verifyIpnCall(req.query);
    if (!verify.isSuccess) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Checksum failed" });
    }

    const vnp_TxnRef = req.query.vnp_TxnRef;
    const vnp_ResponseCode = req.query.vnp_ResponseCode;

    const { data: orderList } = await supabase
      .from("orders")
      .select("id, user_id, payment_status");

    const order = orderList.find((o) =>
      String(o.id).replace(/-/g, "").startsWith(vnp_TxnRef),
    );

    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    await logTransaction(order.id, order.user_id, req.query);

    if (vnp_ResponseCode === "00") {
      if (order.payment_status !== "paid") {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "processing" })
          .eq("id", order.id);

        // Xóa giỏ hàng khi thanh toán thành công
        await supabase.from("cart_items").delete().eq("user_id", order.user_id);

        await supabase.from("order_status_history").insert([
          {
            order_id: order.id,
            old_status: "pending",
            new_status: "processing",
            note: "Thanh toán VNPay thành công",
          },
        ]);
      }
    } else {
      if (order.payment_status !== "failed") {
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order.id);

        await supabase.from("order_status_history").insert([
          {
            order_id: order.id,
            old_status: "pending",
            new_status: "pending",
            note: "Giao dịch VNPay thất bại hoặc bị hủy",
          },
        ]);
      }
    }

    res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("Lỗi xử lý IPN VNPay:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknow error" });
  }
};

export const vnpayCallback = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);
    if (!verify.isSuccess) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/vnpay-return?status=failed`,
      );
    }

    const vnp_TxnRef = req.query.vnp_TxnRef;
    const vnp_ResponseCode = req.query.vnp_ResponseCode;

    const { data: orderList } = await supabase
      .from("orders")
      .select("id, user_id, payment_status");
    const order = orderList.find((o) =>
      String(o.id).replace(/-/g, "").startsWith(vnp_TxnRef),
    );

    if (!order) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/vnpay-return?status=not-found`,
      );
    }

    await logTransaction(order.id, order.user_id, req.query);

    if (vnp_ResponseCode === "00") {
      if (order.payment_status !== "paid") {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "processing" })
          .eq("id", order.id);

        // Xóa giỏ hàng khi thanh toán thành công
        await supabase.from("cart_items").delete().eq("user_id", order.user_id);

        await supabase.from("order_status_history").insert([
          {
            order_id: order.id,
            old_status: "pending",
            new_status: "processing",
            note: "Thanh toán VNPay thành công",
          },
        ]);
      }
    } else {
      if (order.payment_status !== "failed") {
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order.id);

        await supabase.from("order_status_history").insert([
          {
            order_id: order.id,
            old_status: "pending",
            new_status: "pending",
            note: "Giao dịch VNPay thất bại hoặc bị hủy",
          },
        ]);
      }
    }

    const queryString = new URLSearchParams(req.query).toString();
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/vnpay-return?${queryString}`,
    );
  } catch (error) {
    console.error("Lỗi xử lý Callback VNPay:", error);
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/vnpay-return?status=error`,
    );
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy lịch sử giao dịch:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy lịch sử giao dịch" });
  }
};

export const verifyBankTransfer = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Thiếu mã nội dung chuyển khoản" });
    }

    const sheetId = "1gRvifQiOykfKQIfeTkrtTPeZ_XBPSfzvVFJtH5NJa4g";
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`;

    const response = await axios.get(sheetUrl);
    const csvData = response.data;
    const rows = csvData.split("\n");

    let isFound = false;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cleanRow = row.replace(/"/g, "");
      if (cleanRow && cleanRow.includes(code)) {
        isFound = true;
        break;
      }
    }

    if (isFound) {
      return res.json({ success: true, message: "Đã tìm thấy giao dịch" });
    } else {
      return res.json({ success: false, message: "Chưa tìm thấy giao dịch" });
    }
  } catch (error) {
    console.error("Lỗi đối soát ngân hàng trên server:", error);
    res.status(500).json({ message: "Lỗi Server khi đối soát giao dịch" });
  }
};

