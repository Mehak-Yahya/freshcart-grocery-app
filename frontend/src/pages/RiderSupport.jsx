import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { riderAPI } from "../services/api.js";
import { RiderNavbar } from "../components/RiderNavbar";
import "../style/rider.css";

export function RiderSupport() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "issue",
    subject: "",
    message: "",
    orderId: "",
  });

  const formRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await riderAPI.submitSupport(
        formData.type,
        formData.subject,
        formData.message,
        formData.orderId
      );
      toast.success("Support ticket submitted successfully");
      setSubmitted(true);
      setFormData({
        type: "issue",
        subject: "",
        message: "",
        orderId: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit support ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergency = async () => {
    if (
      window.confirm(
        "Press OK to trigger an emergency alert. An admin will be notified immediately."
      )
    ) {
      try {
        await riderAPI.submitSupport(
          "emergency",
          "EMERGENCY ALERT",
          "Rider triggered emergency alert",
          ""
        );
        toast.success("Emergency alert sent! Help is on the way.");
      } catch (error) {
        toast.error("Failed to send emergency alert");
      }
    }
  };

  return (
    <div className="dashboard-page dashboard-rider">
      <RiderNavbar />

      <header className="rider-header">
        <div>
          <h1>Contact Support</h1>
          <p>Get help with orders, issues, or emergencies</p>
        </div>
      </header>



      {submitted && (
        <div className="success-message">
          ✅ Your support ticket has been submitted successfully.
          An admin will contact you soon.
        </div>
      )}

      <section className="rider-panel">
        <h2>Submit a Support Ticket</h2>
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="form-group">
            <label>Issue Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="issue">General Issue</option>
              <option value="payment">
                Payment Issue
              </option>
              <option value="order">
                Order Related
              </option>
              <option value="app">App Problem</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="form-group">
            <label>Order ID (if related)</label>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              placeholder="Enter order ID if this is related to a delivery"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Describe your issue in detail"
              rows="6"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-submit"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </section>

      <section className="rider-panel support-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-items">
          <div className="faq-item">
            <strong>Q: How long does it take to get a response?</strong>
            <p>
              A: Our support team aims to respond within 2-4 hours.
              For emergencies, we respond immediately.
            </p>
          </div>
          <div className="faq-item">
            <strong>
              Q: What should I do if a customer refuses to pay?
            </strong>
            <p>
              A: Report the issue immediately via this form or call
              admin. Do not proceed with the delivery.
            </p>
          </div>
          <div className="faq-item">
            <strong>Q: Can I report a payment discrepancy?</strong>
            <p>
              A: Yes, select "Payment Issue" type and provide order
              details. Our accounting team will review it.
            </p>
          </div>
          <div className="faq-item">
            <strong>Q: How do I report a dangerous situation?</strong>
            <p>
              A: Use the Emergency Button immediately. Contact
              authorities if you're in danger.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
}
