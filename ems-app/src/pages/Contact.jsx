import React, { useState } from "react";
import { motion } from "framer-motion";
import "./css/public.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Your message has been sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <motion.div
      className="public-page contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* ===== Hero Section ===== */}
      <section className="hero contact-hero">
        <div className="hero-overlay">
          <h1>
            Contact <span className="highlight">EZY EMS</span>
          </h1>
          <p>
            We’re here to help you every step of the way. Reach out for demos,
            support, or partnership opportunities.
          </p>
        </div>
      </section>

      {/* ===== Contact Form Section ===== */}
      <section className="contact-form-section">
        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Get in Touch</h2>
          <p className="form-subtext">
            Fill out the form below, and our team will get back to you shortly.
          </p>

          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Your Message"
            rows="6"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
          <button type="submit" className="cta-btn">
            Send Message 🚀
          </button>
        </motion.form>
      </section>

      {/* ===== Contact Info Section ===== */}
      <section className="contact-info">
        <ul>
          <li className="info-item">📧 support@ezyems.com</li>
          <li className="info-item">☎️ +91-98765-43210</li>
          <li className="info-item">📍 Chennai</li>
        </ul>

      </section>

      {/* ===== Footer ===== */}
      <footer className="public-footer">
        <p>© {new Date().getFullYear()} EZY EMS | All Rights Reserved.</p>
      </footer>
    </motion.div>
  );
}
