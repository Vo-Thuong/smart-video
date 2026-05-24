const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên chủ đề không được để trống" });
    }
    const existing = await Category.findOne({ userId: req.userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Chủ đề đã tồn tại" });
    }
    const category = await Category.create({ userId: req.userId, name: name.trim(), color });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên chủ đề không được để trống" });
    }
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name: name.trim(), ...(color && { color }) },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }
    res.json({ success: true, message: "Đã xóa chủ đề" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
