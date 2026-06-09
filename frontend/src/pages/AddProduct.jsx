import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminNavbar } from "../components/AdminNavbar";
import "../style/Admin.css";

const categoryOptions = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Grocery",
];

export function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "1",
    description: "",
    imageUrl: "",
    category: "Grocery",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem("freshcartProductDraft");

    if (draft) {
      const product = JSON.parse(draft);

      setEditingId(product._id);

      setFormData({
        name: product.name || "",
        price: product.price || "",
        quantity: product.quantity || "1",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        category: product.category || "Grocery",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("freshcartToken");

    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.quantity ||
      !formData.description.trim() ||
      !formData.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Product updated successfully");
      } else {
        await axios.post(
          "http://localhost:5000/api/products",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Product added successfully");
      }

      localStorage.removeItem("freshcartProductDraft");

      setFormData({
        name: "",
        price: "",
        quantity: "1",
        description: "",
        imageUrl: "",
        category: "Grocery",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      navigate("/dashboard/admin/products");
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else {
        toast.error(
          err?.response?.data?.message ||
            (editingId
              ? "Failed to update product"
              : "Failed to add product")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <AdminNavbar />

      <section className="dashboard-panel">
        <h2>
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >
          <input
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImagePick}
          />

          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="preview"
              className="product-preview"
            />
          )}

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Product"
              : "Add Product"}
          </button>
        </form>
      </section>
    </div>
  );
}