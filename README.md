# StockFlow: Production-Ready Inventory & Order Management System

StockFlow is a modern, responsive, full-stack web application designed for businesses to manage their products catalogue, customer directories, stock levels, and order transactions. Built using FastAPI (Python), React (JavaScript + Tailwind CSS), and PostgreSQL, it features real-time inventory deductions, automatic restocking, and telemetry dashboards.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User([Web Client Browser])
    
    subgraph Frontend [React SPA - Nginx/Vercel]
        UI[Tailwind UI Views]
        Axios[Axios API Client]
    end

    subgraph Backend [FastAPI - Render/Railway]
        API[FastAPI Router]
        Service[Service Layer Logic]
        SQLA[SQLAlchemy ORM]
    end

    subgraph Database [PostgreSQL]
        DB[(PostgreSQL DB)]
    end

    User --> UI
    UI --> Axios
    Axios -->|REST API over HTTP/CORS| API
    API --> Service
    Service --> SQLA
    SQLA -->|SQL Queries| DB
```

---

## ✨ Features

- **📊 Dashboard Telemetry**: Aggregated metrics of total products, clients, orders, and warning alerts for low stock items ($\le 5$ units).
- **📦 Product Cataloguing (CRUD)**: Create, update, view, and delete products. Includes SKU uniqueness enforcement, price validations ($>0$), and stock boundaries ($\ge0$).
- **👥 Customer Directory (CRUD)**: Manage registered buyer profiles, email syntax validation, and order connection locks (prevents deleting customers with historical orders).
- **🛒 Purchase Order Builder**: Build orders dynamically by selecting customers and multiple items, inputting quantities, and verifying inventory availability.
- **🛡️ Auto-inventory Tracking**:
  - Automatically deducts stock upon placing an order.
  - Automatically **restores/restocks** items to inventory upon order deletion or cancellation.
  - Full transactional rollbacks on any SQL failure.
- **🎨 Glassmorphism Design**: Sleek dark mode styling using Tailwind CSS, smooth card gradients, micro-animations, and full mobile responsiveness.
- **🐳 Containerization**: Production-ready multi-stage Docker build pipeline for fast local runtimes.

---

## 🛠️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
PORT=8000
SECRET_KEY=yoursupersecretkeyhere
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🚀 Docker Setup (Compose)

The easiest way to run the entire stack (Postgres + Backend + Frontend) locally is with Docker Compose.

### Running the System
From the project root directory, run:
```bash
docker compose up --build
```
This command builds the multi-stage Nginx-hosted frontend image, pulls Postgres, builds the FastAPI backend, and spins them up.

- **Frontend SPA**: `http://localhost:3000`
- **FastAPI Backend (Swagger docs)**: `http://localhost:8000/docs`
- **Postgres Database**: `localhost:5432`

---

## 💻 Local Development Setup (Manual)

If you prefer to run services manually without Docker, follow these steps:

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL server running locally with a database named `inventory_db`

### 1. Database & Seed Setup
Create a PostgreSQL database named `inventory_db` locally.

### 2. Backend Setup
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the seed script from the project root directory to initialize tables and load mock telemetry data:
   ```bash
   cd ..
   python seed.py
   ```
5. Run the FastAPI development server:
   ```bash
   cd backend
   python app/main.py
   ```
   The backend will be running on `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
   The frontend will be running on `http://localhost:3000`.

---

## 🌐 Production Deployment Steps

### Backend Deployment (Render / Railway / Fly.io)
1. **Repository**: Push the codebase to a GitHub repository.
2. **Database**: Spin up a managed PostgreSQL instance (e.g. Render PostgreSQL or Supabase). Get the connection string.
3. **Web Service**: Create a new Web Service on Render or Railway, pointing to the `backend/` subdirectory.
4. **Build command**: (Not required if using Dockerfile) or set Python runtime.
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment variables**: Add `DATABASE_URL` (pointing to your managed database), `SECRET_KEY`, and `PORT`.

### Frontend Deployment (Vercel / Netlify)
1. **Web App**: Create a new project on Vercel/Netlify connected to your GitHub repository.
2. **Root directory**: Set the root directory configuration to `frontend`.
3. **Framework Preset**: Select **Vite** or **Create React App** (if using standard defaults, Vercel auto-detects Vite).
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment variables**: Add `VITE_API_URL` pointing to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`).

---

## 📖 API Documentation

FastAPI automatically generates interactive Swagger API docs.
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Primary Endpoints:
| Endpoint | Method | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | System health check | N/A |
| `/api/dashboard`| `GET` | Aggregated dashboard numbers | N/A |
| `/api/products` | `GET`/`POST` | Fetch all / Create new product | `{"product_name": "Mouse", "sku": "M1", "price": 10.0, "quantity_in_stock": 5}` |
| `/api/products/{id}`| `GET`/`PUT`/`DELETE` | Manage product by ID | N/A |
| `/api/customers`| `GET`/`POST` | Fetch all / Create customer | `{"full_name": "Bob", "email": "bob@mail.com", "phone_number": "123"}` |
| `/api/customers/{id}`| `DELETE` | Remove customer | N/A |
| `/api/orders` | `GET`/`POST` | Fetch all / Place new order | `{"customer_id": "uuid", "items": [{"product_id": "uuid", "quantity": 2}]}` |
| `/api/orders/{id}`| `GET`/`DELETE` | View details / Cancel (Restock) order | N/A |

---

## 📷 Screenshots Placeholder
*Once running, screenshots of the dashboard, product grids, client directories, and cart transactions can be attached here.*
