import React from "react";
import { motion } from "framer-motion";
import "./css/public.css";

export default function Services() {
  const services = [
    {
      icon: "📅",
      title: "Attendance & Leave Management",
      desc: "Track employee attendance, automate leave requests, and generate insightful reports effortlessly.",
    },
    {
      icon: "📈",
      title: "Performance Monitoring",
      desc: "Monitor individual and team performance through detailed analytics and custom KPIs.",
    },
    {
      icon: "💰",
      title: "Payroll Integration",
      desc: "Seamlessly connect employee data to your payroll system to reduce manual work and errors.",
    },
    {
      icon: "🎯",
      title: "Goal Tracking",
      desc: "Align employee objectives with organizational goals and track achievements in real-time.",
    },
    {
      icon: "🔔",
      title: "Notifications & Alerts",
      desc: "Never miss an update with smart reminders for shifts, appraisals, and important events.",
    },
  ];

  return (
    <motion.div
      className="public-page services-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ===== Hero Section ===== */}
      <section className="hero services-hero">
        <div className="hero-overlay">
          <h1>
            Our <span className="highlight">Services</span>
          </h1>
          <p>
            Discover how EZY EMS simplifies every aspect of employee management
            with modern, automated, and flexible tools built for efficiency.
          </p>
        </div>
      </section>

      {/* ===== Services List ===== */}
      <section className="features">
        <h2>What We Offer</h2>
        <div className="cards">
          {services.map((s, idx) => (
            <motion.div
              key={idx}
              className="card card-hover"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Integrations Section ===== */}
      <section className="section-alt">
        <div className="section-content">
          <h2>Integration Ready</h2>
          <p>
            EZY EMS integrates with your favorite tools — from payroll software
            to communication platforms — ensuring your workflow stays smooth,
            fast, and connected.
          </p>
          <ul className="feature-list">
            <li>✔ Slack & Microsoft Teams Integration</li>
            <li>✔ Google Workspace & Outlook Calendar Sync</li>
            <li>✔ QuickBooks & Tally for Payroll</li>
            <li>✔ REST APIs for Custom Integrations</li>
          </ul>
        </div>
        <div className="section-image services-preview-img"></div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>
          Explore how our services can transform your organization today with
          smart automation and insightful HR tools.
        </p>
        <button className="cta-btn">Contact Us</button>
      </section>

      {/* ===== Footer ===== */}
      <footer className="public-footer">
        <p>© {new Date().getFullYear()} EZY EMS | Efficiency through Innovation.</p>
      </footer>
    </motion.div>
  );
}
