import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext.jsx";
import CustomerNav from "../components/customernav";

const fallbackImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const user = JSON.parse(localStorage.getItem("freshcartUser") || "null");

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  return (
    <div className="customer-cart-page">
      <CustomerNav />

      <header className="customer-cart-header">
        <div>
          <p className="customer-eyebrow">Shopping Cart</p>
          <h1>Your Cart</h1>
          <p>Review your items and proceed to checkout.</p>
        </div>
      </header>

      <section className="customer-cart-panel">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>

            <Link to="/dashboard/customer" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img
                    src={item.imageUrl || fallbackImage}
                    alt={item.name}
                  />

                  <div className="cart-info">
                    <h4>{item.name}</h4>
                    <p>Rs {item.price} each</p>
                    <span>{item.category}</span>
                  </div>

                  <div className="cart-qty">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.cartQuantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.cartQuantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.cartQuantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-price">
                    Rs {item.price * item.cartQuantity}
                  </div>

                  <button
                    className="cart-remove"
                    onClick={() => handleRemove(item._id, item.name)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rs {getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>Rs 200.00</span>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <span>Rs {(getTotalPrice() + 200).toFixed(2)}</span>
              </div>

        <div className="cart-actions">
  <button className="cart-checkout-btn" onClick={handleCheckout}>
    Proceed to Checkout
  </button>

  <button
    className="btn-primary"
    onClick={() => navigate("/dashboard/customer")}
  >
    Continue Shopping
  </button>
</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}