# SkyLink – Airline Reservation Management System ✈️

SkyLink is a **full-stack airline reservation management system** built using **Node.js, Express.js, and MySQL**. It simulates real-world airline booking operations by allowing users to manage flights, passengers, reservations, and seat allocations through an efficient database-driven workflow.

The project was developed as part of a **DBMS course project** to apply practical database design principles, backend development concepts, and transaction management.

---

## Features

* Flight scheduling and management
* Passenger registration and booking system
* Ticket generation and reservation tracking
* Seat allocation and availability management
* CRUD operations for flights, customers, and bookings
* Relational database integration with optimized queries

---

## Tech Stack

**Backend:**

* Node.js
* Express.js

**Database:**

* MySQL
* SQL

**Frontend:**

* HTML
* CSS

---

## Database Design

The system uses a **normalized relational database schema** to ensure data consistency and efficient querying.

### Core Entities:

* Flights
* Passengers
* Bookings
* Seat Allocation

### DBMS Concepts Applied:

* Normalization
* Primary & Foreign Keys
* Relationships
* Constraints
* Query Optimization
* CRUD Operations

---

## Project Structure

```bash
Skylink_DBMS/
│── server.js        # Main backend server
│── db.js            # Database connection setup
│── skylink.sql      # Database schema and sample data
│── routes/          # API route handlers
│── views/           # Frontend pages
│── public/          # Static files
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/dedalive05/Skylink_DBMS.git
cd Skylink_DBMS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup MySQL Database

Import the SQL file:

```sql
skylink.sql
```

Create your database and update credentials in:

```bash
db.js
```

Example:

```javascript
host: "localhost",
user: "root",
password: "your_password",
database: "skylink"
```

### 4. Run the application

```bash
node server.js
```

Server runs at:

```bash
http://localhost:3000
```

---

## Learning Outcomes

Through this project, I strengthened my understanding of:

* Database schema design and normalization
* Backend API development
* MySQL integration with Node.js
* SQL query optimization
* Transaction handling
* Real-world CRUD workflows
* Scalable modular backend architecture

---

## Future Improvements

* User authentication system
* Payment gateway integration
* Flight cancellation and refund module
* Admin dashboard
* Real-time seat visualization
* Email ticket confirmation
