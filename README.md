# Hotel Rate Comparator using Temporal Workflows

## Description
A resilient, high-performance distributed hotel rate comparison platform aggregating real-time hotel inventories across multiple global wholesale suppliers (Supplier A & Supplier B) with guaranteed lowest rate parity in Indian Rupees (₹).

The system queries supplier inventories in parallel, handles timeouts with a strict 5-second SLA, retries transient failures automatically using Temporal workflows, and falls back gracefully when services are unavailable. Features include deep search query synchronization, theme-sensitive visuals, responsive parent-box containment across all viewports, interactive favorites, and complete reservation lifecycle management.

## Environment Variables
The following environment variables can be configured in `backend/.env` or the repository root:

```env
# Server Port
PORT=3001

# Temporal Orchestration Engine
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_TASK_QUEUE=hotel-rate-comparator

# Supplier Endpoints
SUPPLIER_A_URL=http://localhost:3001/supplierA/hotels
SUPPLIER_B_URL=http://localhost:3001/supplierB/hotels
```

## How to Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application
To run the backend server, worker, and frontend client concurrently:
```bash
npm run dev
```

Alternatively, run each service independently:
- **Backend API & Suppliers**: `npm run dev:backend` (runs on http://localhost:3001)
- **Frontend Client**: `npm run dev:frontend` (runs on http://localhost:3000)
- **Background Worker**: `npm run dev:worker`

### 3. Run Tests and Linting
- **Run all tests**: `npm test`
- **Run linting**: `npm run lint`
- **Build production bundles**: `npm run build`

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### Author & Source Code Ownership
- **Author**: Aakarsh Sharma
- **Original Source Code & Architecture**: Developed, designed, and maintained by Aakarsh Sharma.

