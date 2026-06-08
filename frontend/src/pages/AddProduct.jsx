import { useState, useRef } from "react";
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

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "1",
    description: "",
    imageUrl: "",
    category: "Grocery",
  });

  const [loading, setLoading] = useState(false);

  // =====================
  // INPUT HANDLER
  // =====================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================
  // IMAGE HANDLER
  // =====================
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

  // =====================
  // SUBMIT HANDLER
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 ALWAYS GET TOKEN HERE (NOT OUTSIDE)
    const token = localStorage.getItem("freshcartToken");

    // 🔥 AUTH CHECK
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    // 🔥 VALIDATION
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

      // reset form
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
      console.log("Add Product Error:", err?.response?.data);

      if (err?.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.message || "Failed to add product");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="dashboard-page">
       <AdminNavbar />

      <section className="dashboard-panel">
        <h2>Add Product</h2>

        <form className="product-form" onSubmit={handleSubmit}>

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

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Product"}
          </button>

        </form>
      </section>

    </div>
  );
}