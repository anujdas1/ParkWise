# ParkWise 🚦

> **Enterprise traffic enforcement and predictive analytics platform.**

ParkWise is a comprehensive, data-driven solution designed to tackle parking-induced congestion by shifting from reactive violation tracking to proactive, risk-based traffic management. By combining granular dataset insights, MongoDB-backed real-time analytics, and transportation engineering principles, this platform maximizes the Return on Investment (ROI) for traffic enforcement deployments.

---

## ✨ Features

- **Predictive Hotspots:** Utilize AI/ML forecasts to predict where traffic violations and congestion will occur in the next 72 hours.
- **Enforcement Quality Index:** Automatically score and track the rejection rate of traffic tickets submitted by local police stations, highlighting where further training or deployment adjustments are needed.
- **Thermal Heatmaps:** Visually map violation densities across city sectors using interactive CartoDB dark-mode maps.
- **Linear-Inspired UI:** A meticulously crafted, dark-mode-first aesthetic heavily inspired by `Linear.app`. Features high-contrast typography (Inter), glassmorphism navbars, and animated glowing boundaries.

## 🏗 Architecture

- **Frontend:** Pure HTML5, JavaScript, and highly optimized custom CSS (no heavy frameworks).
- **Backend:** Python Flask API serving data natively to the frontend.
- **Database:** MongoDB Atlas (NoSQL) for highly scalable, dynamic traffic violation data ingestion.
- **Data Science:** Integrated pandas-driven data generation and analytics models.

## 🚀 Quick Start

To run the ParkWise application locally, follow these steps:

1. **Clone the repository**
2. **Set up the backend environment:**
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. **Run the Application:**
   ```bash
   # From the root ParkWise directory
   python -m backend.app
   ```
4. **Access the App:** Open your browser and navigate to `http://localhost:5000`

---
*Built for precision. Designed for scale.*
