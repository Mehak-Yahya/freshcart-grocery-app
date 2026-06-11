import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products =
      req.query.mine === "true" && req.user?.role === "admin"
        ? await Product.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
        : await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, imageUrl, category } = req.body;

    if (!name || price === undefined || quantity === undefined || !description || !category) {
      return res.status(400).json({ message: "All product fields are required" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ message: "Price must be greater than zero" });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      category: category.trim(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, description, imageUrl, category } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    product.name = name?.trim() || product.name;
    product.price = price !== undefined ? Number(price) : product.price;
    product.quantity = quantity !== undefined ? Number(quantity) : product.quantity;
    product.description = description?.trim() || product.description;
    product.imageUrl = imageUrl?.trim() || product.imageUrl;
    product.category = category?.trim() || product.category;

    if (product.price <= 0) {
      return res.status(400).json({ message: "Price must be greater than zero" });
    }

    if (product.quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};