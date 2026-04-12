import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Chuyển đổi trạng thái đơn hàng sang tiếng Việt
 */
const statusMap = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const payStatusMap = {
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  failed: "Thất bại",
};

/**
 * Định dạng ngày tháng VN
 */
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Xuất báo cáo Admin chuyên nghiệp
 */
export const exportAdminReport = async ({ 
  fullOrders, 
  allUsers, 
  allProducts, 
  metrics, 
  filterDate 
}) => {
  const workbook = new ExcelJS.Workbook();
  
  // Tạo Map khách hàng để tra cứu nhanh (Tránh lỗi relationship Supabase)
  const userMap = new Map((allUsers || []).map(u => [u.id, u]));

  // --- SHEET 1: TỔNG QUAN ---
  const wsSummary = workbook.addWorksheet("Tổng quan");
  wsSummary.columns = [
    { header: "Tiêu chí", key: "label", width: 35 },
    { header: "Giá trị", key: "value", width: 30 },
  ];
  wsSummary.addRows([
    { label: "BÁO CÁO KẾT QUẢ KINH DOANH", value: "" },
    { label: "Tháng/Năm báo cáo", value: `${filterDate.month}/${filterDate.year}` },
    { label: "Tổng doanh thu", value: Number(metrics.totalRevenue || 0) },
    { label: "Tổng đơn hàng (đã trừ đơn hủy)", value: Number(metrics.totalOrders || 0) },
    { label: "Giá trị đơn trung bình (AOV)", value: Number(metrics.aov || 0) },
    { label: "Tỷ lệ chuyển đổi", value: `${metrics.conversionRate}%` },
    { label: "Số khách hàng mới trong tháng", value: Number(metrics.activeUsers || 0) },
    { label: "Ngày xuất báo cáo", value: formatDate(new Date()) },
  ]);

  // --- SHEET 2: ĐƠN HÀNG CHI TIẾT ---
  const wsOrders = workbook.addWorksheet("Đơn hàng");
  wsOrders.columns = [
    { header: "Mã đơn", key: "id", width: 15 },
    { header: "Ngày tạo", key: "date", width: 22 },
    { header: "Khách hàng", key: "customer", width: 25 },
    { header: "SĐT", key: "phone", width: 15 },
    { header: "Địa chỉ nhận", key: "address", width: 45 },
    { header: "Tên sản phẩm", key: "product", width: 35 },
    { header: "Số lượng", key: "qty", width: 10 },
    { header: "Đơn giá", key: "price", width: 18 },
    { header: "Tổng tiền (Đơn)", key: "total", width: 20 },
    { header: "Trạng thái", key: "status", width: 16 },
    { header: "Thanh toán", key: "payment", width: 25 },
  ];

  fullOrders?.forEach((order) => {
    const addr = order.user_addresses;
    const userData = userMap.get(order.user_id);
    const fullAddr = addr 
      ? [addr.street_address, addr.ward, addr.city].filter(Boolean).join(", ") 
      : "N/A";
    
    const items = order.order_items || [];
    if (items.length === 0) {
      wsOrders.addRow({
        id: order.id?.toString().slice(0, 8).toUpperCase(),
        date: formatDate(order.created_at),
        customer: userData?.full_name || addr?.receiver_name || "N/A",
        phone: addr?.phone_number || userData?.phone || "N/A",
        address: fullAddr,
        status: statusMap[order.status] || order.status,
        payment: `${(order.payment_method || "").toUpperCase()} (${payStatusMap[order.payment_status] || order.payment_status})`,
        total: Number(order.total_price || 0),
      });
    } else {
      items.forEach((item, idx) => {
        wsOrders.addRow({
          id: idx === 0 ? order.id?.toString().slice(0, 8).toUpperCase() : "",
          date: idx === 0 ? formatDate(order.created_at) : "",
          customer: idx === 0 ? (userData?.full_name || addr?.receiver_name || "N/A") : "",
          phone: idx === 0 ? (addr?.phone_number || userData?.phone || "N/A") : "",
          address: idx === 0 ? fullAddr : "",
          product: item.products?.title || "N/A",
          qty: item.quantity || 0,
          price: Number(item.price || 0),
          total: idx === 0 ? Number(order.total_price || 0) : "",
          status: idx === 0 ? (statusMap[order.status] || order.status) : "",
          payment: idx === 0 ? `${(order.payment_method || "").toUpperCase()} (${payStatusMap[order.payment_status] || order.payment_status})` : "",
        });
      });
    }
  });

  // --- SHEET 3: NGƯỜI DÙNG ---
  const wsUsers = workbook.addWorksheet("Người dùng");
  wsUsers.columns = [
    { header: "ID User", key: "id", width: 15 },
    { header: "Họ và tên", key: "name", width: 30 },
    { header: "Email", key: "email", width: 35 },
    { header: "SĐT", key: "phone", width: 15 },
    { header: "Vai trò", key: "role", width: 15 },
    { header: "Ngày tham gia", key: "date", width: 22 },
  ];
  allUsers?.forEach((u) =>
    wsUsers.addRow({
      id: u.id?.toString().slice(0, 8).toUpperCase(),
      name: u.full_name,
      email: u.email,
      phone: u.phone || "N/A",
      role: u.role === "admin" ? "Admin" : u.role === "staff" ? "Nhân viên" : "Khách hàng",
      date: formatDate(u.created_at),
    })
  );

  // --- SHEET 4: SẢN PHẨM ---
  const wsProds = workbook.addWorksheet("Sản phẩm");
  wsProds.columns = [
    { header: "Mã SP", key: "id", width: 15 },
    { header: "Tên sản phẩm", key: "title", width: 40 },
    { header: "Danh mục", key: "cat", width: 22 },
    { header: "Giá bán", key: "price", width: 18 },
    { header: "Tồn kho", key: "stock", width: 12 },
    { header: "Ngày nhập", key: "date", width: 22 },
  ];
  allProducts?.forEach((p) =>
    wsProds.addRow({
      id: p.id?.toString().slice(0, 8).toUpperCase(),
      title: p.title,
      cat: p.categories?.name || "Khác",
      price: Number(p.price || 0),
      stock: p.stock || 0,
      date: formatDate(p.created_at),
    })
  );

  // --- 3. APPLY STYLING (CHUYÊN NGHIỆP) ---
  workbook.eachSheet((sheet) => {
    // Formatting Header
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C4F" }, // Màu xanh thương hiệu
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Formatting Content Cells
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FFF0F0F0" } },
            left: { style: "thin", color: { argb: "FFF0F0F0" } },
            bottom: { style: "thin", color: { argb: "FFF0F0F0" } },
            right: { style: "thin", color: { argb: "FFF0F0F0" } },
          };
        });
      }
    });

    // Freeze Pane
    sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

    // Auto Filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount },
    };

    // Format Currency & Numbers
    sheet.columns.forEach((col) => {
      if (["price", "total", "value"].includes(col.key)) {
        col.numFmt = '#,##0 "VND"';
      }
    });
  });

  // Unique Styling cho Sheet Summary
  wsSummary.getRow(1).height = 40;
  wsSummary.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };

  // --- 4. SAVE FILE ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Bao-cao-FurnitureHub-${filterDate.month}-${filterDate.year}.xlsx`);
};
