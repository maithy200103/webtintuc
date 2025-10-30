-- Thêm cột order vào bảng category
ALTER TABLE category ADD COLUMN `order` INT DEFAULT 0;

-- Cập nhật giá trị order cho các danh mục hiện có (nếu có)
UPDATE category SET `order` = id WHERE `order` = 0 OR `order` IS NULL;

-- Đảm bảo cột order không null
ALTER TABLE category MODIFY COLUMN `order` INT NOT NULL DEFAULT 0; 