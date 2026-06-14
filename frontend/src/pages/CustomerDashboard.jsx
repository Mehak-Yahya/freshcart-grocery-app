import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { productAPI } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";
import CustomerNav from "../components/customernav";
import "../style/customer.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    const timer = window.setInterval(loadProducts, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "Grocery"));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter + group
  const groupedProducts = useMemo(() => {
    const filtered =
      selectedCategory === "All"
        ? products
        : products.filter(
            (p) => (p.category || "Grocery") === selectedCategory,
          );

    return filtered.reduce((groups, product) => {
      const category = product.category || "Grocery";
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
      return groups;
    }, {});
  }, [products, selectedCategory]);

  return (
    <div className="dashboard-page dashboard-customer">
      <CustomerNav />

      <header className="customer-header">
        <div>
          <h1>Welcome {user?.name || "Customer"}</h1>
          <p>Browse fresh groceries, add to cart, and checkout.</p>
        </div>
      </header>

      <section className="customer-flat">
        {/* HEADER ROW */}
        <div className="shop-header">
          <h2>Shop Fresh Groceries</h2>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Loading products...
          </p>
        ) : Object.keys(groupedProducts).length === 0 ? (
          <p className="customer-empty-state">No products found.</p>
        ) : (
          <div className="catalog-sections">
            {Object.entries(groupedProducts).map(([category, items]) => (
              <section className="catalog-category" key={category}>
                <h3>{category}</h3>

                <div className="product-grid">
                  {items.map((product) => (
                    <article
                      className="product-item product-card"
                      key={product._id}
                    >
                      <img
                        src={product.imageUrl || fallbackImage}
                        alt={product.name}
                        className="product-image"
                      />

                      <div className="product-body">
                        <span className="product-category">
                          {product.category || "Grocery"}
                        </span>

                        <h4>{product.name}</h4>
                        <p>{product.description}</p>

                        <strong>Rs {product.price}</strong>

                        <span className="product-quantity">
                          Stock: {product.quantity ?? 1}
                        </span>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="add-btn"
                        >
                          + Add to Cart
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
