# 🤝 SkillConnect — Cooperative Gig Services Platform

## 📌 Overview

**SkillConnect** is a cooperative gig services platform that connects customers with trusted local skilled helpers such as:

* 🔧 Plumbers
* ⚡ Electricians
* 🪚 Carpenters
* 🔩 Mechanics
* 🧹 Cleaners
* 🎨 Painters

The platform provides an easy way for customers to find and book skilled professionals while enabling technicians to manage jobs, earnings, referrals, and their professional profiles.

SkillConnect also includes an **Admin Dashboard** for managing users and viewing cooperative insights.

The application runs entirely on the client side and uses **IndexedDB** for local data storage. No backend server is required.

---

## ✨ Features

### 👤 Customer Features

* Register and log in as a customer
* Search for skilled professionals
* Find nearby helpers
* Book services
* Describe a problem to receive skill recommendations
* View trust scores
* Get fair-price guidance
* Track helpers using live location maps
* Chat with skilled helpers
* Access hyperlocal service matching
* SOS and emergency matching support

---

### 🛠️ Skilled Helper / Technician Features

* Register as a skilled helper
* Manage professional profile
* View assigned jobs
* Track completed jobs
* Manage earnings and transactions
* View referral information
* Update availability status
* Display specialty and experience
* Build and maintain a trust score

---

### 👨‍💼 Admin Features

The Admin Dashboard provides complete account management and cooperative insights.

#### Account Management

Admins can:

* ➕ Create new accounts
* 👀 View customer, helper, and admin accounts
* ✏️ Update account information
* 🗑️ Delete accounts
* Manage technician profiles
* Update technician skills and rates
* Manage user roles

#### Cooperative Insights

The Admin Dashboard also provides insights into:

* Users
* Skilled helpers
* Jobs
* Bookings
* Transactions
* Trust scores
* Platform activity

---

## 🧠 Smart Features

### 🔍 Smart Skill Matching

Users can describe their problems, and the system recommends the most suitable skilled professional based on the required service.

### 📍 Hyperlocal Matching

SkillConnect uses location-based matching to help customers find skilled helpers nearby.

### ⭐ Trust Score System

The platform calculates trust scores for skilled helpers to help customers choose reliable professionals.

### 💰 Fair Price Guidance

Customers receive price guidance to help them understand reasonable service charges.

### 🗺️ Live Location Tracking

The application includes self-contained live tracking maps using SVG-based maps.

No external map API or API key is required.

### 💬 Chat System

Customers can communicate with skilled helpers through a simulated direct chat system.

### 🚨 SOS Matching

The platform supports emergency and quick matching functionality to help users find nearby skilled professionals quickly.

---

# 🛠️ Technologies Used

| Technology      | Purpose                       |
| --------------- | ----------------------------- |
| HTML5           | Application structure         |
| CSS3            | Styling and responsive design |
| JavaScript      | Application logic             |
| IndexedDB       | Client-side database          |
| Geolocation API | Location-based services       |
| SVG             | Live tracking maps            |

---

# 📂 Project Structure

```text
skillconnect/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    ├── state.js
    ├── seed-data.js
    ├── db.js
    ├── location.js
    ├── trust.js
    ├── diagnosis.js
    ├── chat.js
    ├── maps.js
    ├── customer.js
    ├── technician.js
    ├── matching.js
    ├── admin.js
    ├── auth.js
    └── main.js
```

---

## 📁 File Description

### `index.html`

Contains the main structure and user interface of the application.

---

### `css/style.css`

Contains all styling for the SkillConnect application, including:

* Layout
* Navigation
* Dashboards
* Forms
* Cards
* Responsive design

---

### `js/state.js`

Manages the shared application state.

This file is loaded first because other modules depend on the application's current state.

---

### `js/seed-data.js`

Contains demo data used by the application, including:

* Demo users
* Skilled helpers
* Services
* Problem and symptom mappings
* Chat replies

---

### `js/db.js`

Handles the IndexedDB database.

It manages:

* Database creation
* User storage
* Worker storage
* Booking storage
* Transaction storage
* CRUD operations
* Demo data seeding

---

### `js/location.js`

Handles location-related functionality.

Features include:

* User geolocation
* Distance calculations
* Nearby helper matching

---

### `js/trust.js`

Handles the Trust Score system and fair-price calculations.

---

### `js/diagnosis.js`

Converts customer problem descriptions into service recommendations.

For example:

> "My tap is leaking"

The system can recommend:

> Plumber

---

### `js/chat.js`

Provides a simulated chat system between customers and skilled helpers.

---

### `js/maps.js`

Creates self-contained live tracking maps using inline SVG.

No external mapping service is required.

---

### `js/customer.js`

Handles the Customer Dashboard.

Features include:

* Service search
* Booking
* Trust score viewing
* Finding skilled helpers
* Service matching

---

### `js/technician.js`

Handles the Skilled Helper Dashboard.

Features include:

* Job management
* Earnings
* Transactions
* Referrals
* Profile information

---

### `js/matching.js`

Handles the Hyperlocal Matching Engine.

Features include:

* Nearby helper matching
* SOS matching
* Quick service matching

---

### `js/admin.js`

Handles the Admin Dashboard.

Features include:

* Account management
* User CRUD operations
* Technician management
* Cooperative insights
* Platform analytics

---

### `js/auth.js`

Handles:

* User registration
* User login
* Role selection
* Authentication
* View routing

---

### `js/main.js`

Handles the application boot sequence and initialization.

---

# 👥 User Roles

SkillConnect supports three main roles.

## 👤 Customer

Customers can:

* Search for skilled helpers
* Book services
* Track professionals
* Chat with helpers
* View trust scores
* Receive price guidance

---

## 🛠️ Skilled Helper

Skilled helpers can:

* Manage jobs
* View earnings
* Update availability
* Manage profiles
* Track referrals

---

## 👨‍💼 Admin

Admins can:

* Manage users
* Create accounts
* Update accounts
* Delete accounts
* Manage skilled helpers
* Access cooperative insights

---

# 🔐 Demo Login Credentials

## 👤 Customer

**Email:**

```text
aditya@customer.com
```

You can also register using your own email and password.

---

## 🛠️ Skilled Helper

**Email:**

```text
ravi.plumber@demo.com
```

**Password:**

```text
password123
```

---

## 👨‍💼 Admin

**Email:**

```text
admin@skillconnect.com
```

**Password:**

```text
admin123
```

> ⚠️ These credentials are provided only for demonstration purposes.

---

# 💾 Database

SkillConnect uses **IndexedDB** as its client-side database.

The database stores:

* Users
* Skilled helpers
* Bookings
* Jobs
* Transactions
* Trust-related data

### Database Name

```text
SkillConnectDB
```

Since IndexedDB is browser-based, all data is stored locally in the user's browser.

> Clearing browser site data will reset the application data.

---

# 🚀 How to Run the Project

## Method 1: Using Python

Open the project folder in the terminal and run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Method 2: Using VS Code Live Server

1. Open the project in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click on `index.html`.
4. Select:

```text
Open with Live Server
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate to the project folder:

```bash
cd skillconnect
```

Run a local server:

```bash
python -m http.server 8000
```

Open the application in your browser.

---

# 🌟 Key Highlights

* 🚀 No backend server required
* 💾 IndexedDB-based storage
* 📍 Location-based service matching
* 🤖 Smart problem-to-skill diagnosis
* ⭐ Trust score system
* 💰 Fair-price guidance
* 💬 Customer-helper chat
* 🗺️ Live SVG-based tracking
* 🚨 SOS matching
* 👥 Role-based dashboards
* 👨‍💼 Admin CRUD operations
* 📊 Cooperative insights

---

# 🔮 Future Enhancements

The following features can be added in future versions:

* 🔐 Real authentication using Firebase or JWT
* ☁️ Cloud database integration
* 📱 Mobile application
* 💳 Online payment integration
* ⭐ Customer ratings and reviews
* 🔔 Real-time notifications
* 🗺️ Google Maps integration
* 💬 Real-time chat using WebSockets
* 🤖 AI-powered service recommendations
* 📈 Advanced analytics dashboard
* 📷 Technician verification using document uploads

---

# 📄 License

This project is developed for educational and demonstration purposes.

---

# 👩‍💻 Author

**Meghana Naidu**

---

## ⭐ Support

If you like this project, please consider giving the repository a **⭐ star**!

---

**SkillConnect — Connecting Skills with Opportunities 🤝**
