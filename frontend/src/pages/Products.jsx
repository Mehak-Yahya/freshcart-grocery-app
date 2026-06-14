import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { productAPI } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";


const fallbackImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export function Products() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const groupedProducts = useMemo(() => {
    return products.reduce((groups, product) => {
      const category = product.category || "Grocery";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  }, [products]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        setProducts(data.products || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    const productsTimer = window.setInterval(loadProducts, 15000);
    return () => window.clearInterval(productsTimer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("freshcartToken");
    localStorage.removeItem("freshcartUser");
    navigate("/login");
  };

  return (
    <div className="dashboard-page dashboard-customer">
      
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Product Catalog</p>
          <h1>Welcome {user?.name || "Customer"}</h1>
          <p>Browse all products grouped by category.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            to="/cart"
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🛒 Cart ({getTotalItems()})
          </Link>
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-panel">
        <div className="dashboard-actions">
          <Link to="/dashboard/customer">Back to dashboard</Link>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="catalog-sections">
          {loading ? (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="empty-state">No products available yet.</p>
          ) : (
            Object.entries(groupedProducts).map(([category, items]) => (
              <section className="catalog-category" key={category}>
                <h3>{category}</h3>
                <div className="product-grid">
                  {items.map((product) => (
                    <article className="product-item product-card" key={product._id}>
                      <img
                        src={product.imageUrl || fallbackImage}
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-body">
                        <span className="product-category">{product.category || "Grocery"}</span>
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <strong>Rs {product.price}</strong>
                        <span className="product-quantity">Qty {product.quantity ?? 1}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          style={{
                            width: "100%",
                            marginTop: "10px",
                            padding: "8px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          + Add to Cart
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </section>
    </div>
  );
}