# 🏙️ SCMS - Society Complaint Management System

**SCMS (Society Complaint Management System)** is the third problem statement for a 3-day hackathon conducted by the Web Team of **NIT JSR**.

This is a **full-stack web application** built using:

- **Next.js** v15.3 (App Router)
- **TypeScript**
- **Tailwind CSS**

🔗 Live Preview: [scms-flax.vercel.app](https://scms-flax.vercel.app)

---

## 📌 Overview

SCMS is a complaint management platform designed to **bridge the gap between Residents, Workers, and Maintenance Managers** in a society. It provides a seamless workflow for lodging, assigning, resolving, and tracking complaints, while ensuring **accountability and performance measurement**.

---

## 🚦 User Roles & Features

### 🧍 Resident

- 🔧 Can raise complaints under various categories.
- 🖼️ Upload images related to the complaint.
- 📇 Each complaint generates a **unique QR Code**.
- 🔐 Authenticated access only after **registration and login**.

### 🛠️ Worker

- 👨‍🔧 Can view only the complaints **assigned to them**.
- ✅ After resolving, they scan the QR code from the resident to **mark it resolved**.
- ⏱️ The **faster** they resolve complaints, the **more tokens** they earn.
- 🎖️ Tokens serve as a metric to **measure performance**.

### 🧑‍💼 Manager

- 📋 Can view **all complaints** across the society.
- 🧾 Can **assign complaints to available workers**.
- 🔐 Has secure access with protected routes.

---

## 🔐 Security & Authentication

- ✉️ **Authentication** is implemented via **JWT tokens** which are securely signed and verified.
- 🚫 **Route Protection** using custom `middleware.ts` ensures that only authorized users can access specific dashboards and functionalities.
- 🧑 Users **must register and login** to interact with the system.

---

## 🖼️ Image & File Management

- All complaint-related images are securely uploaded and stored using **Cloudinary**.
- Optimized image hosting ensures fast load times and reliable storage.

---

## 🧪 Tech Stack

| Tech           | Description                               |
|----------------|-------------------------------------------|
| Next.js 15.3   | App Router structure with SSR & API routes |
| TypeScript     | Type safety across the app                 |
| Tailwind CSS   | For rapid and responsive UI styling        |
| JWT            | Secure token-based authentication          |
| Cloudinary     | Cloud storage for complaint images         |

---

## 🚀 Getting Started

### 🧬 Clone the Repository

```bash
git clone https://github.com/<your-username>/scms.git
cd scms
```

### 📦 Install Dependencies

```bash
npm install
npm run dev
```

🔧 Run the Development Server

``` bash
npm run dev
```

Visit http://localhost:3000 to view the app locally.

--- 

## 🌐 Live Site
Skip the setup and explore the project here:
➡️ https://scms-flax.vercel.app

---

## 🛠️ Future Scope
- 📊 Analytics for managers on complaint types & resolution time.

- 📱 PWA support for mobile responsiveness.

- 🧾 Performance leaderboard for workers based on tokens.

---

## ❤️ Credits
Developed during the Web Team Hackathon at NIT Jamshedpur.
Built with passion, teamwork, and a drive to solve real-world society issues by W.

---

