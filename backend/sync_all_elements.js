import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateFengShui } from '../backend/utils/colorUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAllElements() {
    console.log("🚀 Bắt đầu quá trình đồng bộ Mệnh cho toàn bộ hệ thống...");

    try {
        // --- 1. Cập nhật bảng product_variants ---
        console.log("\n--- Bước 1: Cập nhật bảng product_variants ---");
        const { data: variants, error: vError } = await supabase
            .from('product_variants')
            .select('id, color_hex, color_name');
        
        if (vError) throw vError;

        console.log(`Tìm thấy ${variants.length} biến thể. Đang xử lý...`);
        for (const v of variants) {
            if (v.color_hex) {
                const element = calculateFengShui(v.color_hex);
                const { error: upError } = await supabase
                    .from('product_variants')
                    .update({ element: element })
                    .eq('id', v.id);
                if (upError) console.error(`Lỗi cập nhật biến thể ${v.id}:`, upError.message);
            }
        }
        console.log("✅ Hoàn thành cập nhật biến thể.");

        // --- 2. Cập nhật bảng products ---
        console.log("\n--- Bước 2: Cập nhật bảng products ---");
        // Lấy danh sách sản phẩm kèm theo màu sắc của chúng
        const { data: products, error: pError } = await supabase
            .from('products')
            .select(`
                id,
                title,
                product_colors (
                    colors (
                        hex,
                        element
                    )
                )
            `);

        if (pError) throw pError;

        console.log(`Tìm thấy ${products.length} sản phẩm. Đang xử lý...`);
        for (const p of products) {
            let elements = new Set();

            // Lấy mệnh từ các màu đã gán cho sản phẩm
            if (p.product_colors && p.product_colors.length > 0) {
                p.product_colors.forEach(pc => {
                    if (pc.colors) {
                        // Nếu màu đã có element trong DB thì lấy, không thì tính toán lại
                        const el = pc.colors.element || calculateFengShui(pc.colors.hex);
                        if (el) elements.add(el);
                    }
                });
            }

            const elementStr = Array.from(elements).join(', ');
            
            if (elementStr) {
                console.log(`Sản phẩm: ${p.title} -> Mệnh: ${elementStr}`);
                const { error: upPError } = await supabase
                    .from('products')
                    .update({ element: elementStr })
                    .eq('id', p.id);
                if (upPError) console.error(`Lỗi cập nhật sản phẩm ${p.id}:`, upPError.message);
            }
        }
        console.log("✅ Hoàn thành cập nhật sản phẩm.");

        console.log("\n✨ TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ MỆNH THÀNH CÔNG!");

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng trong quá trình đồng bộ:", err.message);
        console.log("HƯỚNG DẪN: Hãy chắc chắn bạn đã chạy lệnh SQL ALTER TABLE để thêm cột 'element' vào các bảng products và product_variants.");
    }
}

syncAllElements();
