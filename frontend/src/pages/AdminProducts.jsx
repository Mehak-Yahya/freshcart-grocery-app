import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminNavbar } from "../components/AdminNavbar";
import "../style/Admin.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export function AdminProducts() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");
  const token = localStorage.getItem("freshcartToken");
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          mine: true,
        },
      });

      setProducts(response.data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();

    const productsTimer = window.setInterval(loadProducts, 15000);

    return () => {
      window.clearInterval(productsTimer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  const handleEdit = (product) => {
    localStorage.setItem("freshcartProductDraft", JSON.stringify(product));

    navigate("/dashboard/admin/products/new");
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="dashboard-page dashboard-admin">
      <AdminNavbar />

      <section className="admin-products-page">
        <h2>Products you added</h2>
        <div className="product-grid product-grid-admin">
          {products.length === 0 ? (
            <p className="empty-state">No products added yet.</p>
          ) : (
            products.map((product) => (
              <article className="product-item product-card" key={product._id}>
                <img
                  src={product.imageUrl || fallbackImage}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-body">
                  <span className="product-category">
                    {product.category || "Grocery"}
                  </span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>Rs {product.price}</strong>
                  <span className="product-quantity">
                    Qty {product.quantity ?? 1}
                  </span>
                  <div className="product-card-actions">
                    <button type="button" onClick={() => handleEdit(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
