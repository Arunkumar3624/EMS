import React from "react";
import { motion } from "framer-motion";
import "./css/public.css";

export default function Service() {
  const services = [
    { icon: "🕒", title: "Attendance & Shift Management", desc: "Automate attendance tracking and manage shifts easily." },
    { icon: "📈", title: "Performance Insights", desc: "Analyze employee performance with real-time data." },
    { icon: "💼", title: "Payroll Automation", desc: "Simplify payments and leave calculations securely." },
    { icon: "🔔", title: "Notifications & Alerts", desc: "Stay informed with instant HR updates and system alerts." },
  ];

  return (
    <motion.div className="public-page service-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <section className="hero service-hero">
        <div className="hero-overlay">
          <h1>Our <span className="highlight">Services</span></h1>
          <p>Explore the smart HR solutions that make EZY EMS stand out.</p>
        </div>
      </section>

      <section className="features">
        <h2>What We Offer</h2>
        <div className="cards">
          {services.map((s, i) => (
            <motion.div className="card card-hover" key={i} whileHover={{ scale: 1.05 }}>
              <div className="icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Experience Smart HR Today</h2>
        <p>Schedule a demo and discover how EZY EMS can optimize your organization.</p>
        <button className="cta-btn">Request Demo</button>
      </section>

      <footer className="public-footer">
        <p>© {new Date().getFullYear()} EZY EMS | Empowering workplaces worldwide.</p>
      </footer>
    </motion.div>
  );
}
