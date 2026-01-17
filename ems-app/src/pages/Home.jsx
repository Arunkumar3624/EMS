import React, { useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "./AuthContext";
import "./css/public.css";

export default function Home() {
  const { profile, loading } = useContext(AuthContext);

  if (loading) return <p className="loading-text">⏳ Loading...</p>;

  const benefits = [
    { icon: "📊", title: "Smart Workforce Analytics", desc: "Gain insights into performance, attendance, and productivity in one dashboard." },
    { icon: "💬", title: "Integrated Communication", desc: "Connect your teams through streamlined messaging and notifications." },
    { icon: "🔐", title: "Custom Role Permissions", desc: "Flexible access control for HRs, Admins, and Employees." },
  ];

  return (
    <motion.div className="public-page home-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <section className="hero home-hero">
        <div className="hero-overlay">
          <h1>Empower Your Workforce with <span className="highlight">EZY EMS</span></h1>
          <p>Streamline HR, track performance, and drive growth — all in one modern platform.</p>
          <button className="cta-btn">Get Started</button>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose EZY EMS?</h2>
        <div className="cards">
          {benefits.map((b, i) => (
            <motion.div className="card card-hover" key={i} whileHover={{ scale: 1.05 }}>
              <div className="icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-alt">
        <div className="section-content">
          <h2>Built for Modern Businesses</h2>
          <p>
            From attendance to analytics, EZY EMS makes employee management effortless.
            Designed for speed, clarity, and scalability.
          </p>
          <ul>
            <li>✔ Easy onboarding</li>
            <li>✔ AI-driven analytics</li>
            <li>✔ Role-based dashboards</li>
            <li>✔ Secure cloud database</li>
          </ul>
        </div>
        <div className="section-image"></div>
      </section>

      <section className="cta">
        <h2>Transform Your HR Operations</h2>
        <p>Join businesses already scaling with EZY EMS.</p>
        <button className="cta-btn">Join Now</button>
      </section>

      <footer className="public-footer">
        <p>© {new Date().getFullYear()} EZY EMS | All Rights Reserved.</p>
      </footer>
    </motion.div>
  );
}
