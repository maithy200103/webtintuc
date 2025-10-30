import db from './db.js';
import fs from 'fs';
import path from 'path';

async function fixCategoryOrder() {
  try {
    console.log('🔧 Đang sửa lỗi cột order trong bảng category...');
    
    // Đọc file SQL
    const sqlPath = path.join(process.cwd(), 'fix_category_order.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Chia các câu lệnh SQL
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Thực thi: ${statement.trim()}`);
        await db.query(statement);
      }
    }
    
    console.log('✅ Đã sửa lỗi thành công!');
    console.log('🚀 Bây giờ bạn có thể sử dụng tính năng sắp xếp danh mục.');
    
  } catch (error) {
    console.error('❌ Lỗi khi sửa database:', error);
  } finally {
    process.exit(0);
  }
}

fixCategoryOrder(); 