# 🎓 Student Learning Platform (WEEK2-TASK)

A full-stack **Role-Based Access and Management System** built with **React (TypeScript)**, **React Query**, and **JWT Authentication**, featuring dashboards for **Students**, **Teachers**, and **Admins**.  
Includes **secure login**, **CRUD operations**, **analytics dashboards**, and **responsive UI** with **Tailwind CSS** and **theme switching**.

---

## 📁 Folder Structure

```
frontend/
│
├── public/
│   └── index.html
│
├── src/
│   ├── api/
│   │   ├── axiosClient.ts
│   │   ├── axiosCourseClient.ts
│   │   ├── courseService.ts
│   │   └── userService.ts
│   │
│   ├── assets/
│   │   ├── image.png
│   │   ├── image (1).png
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── Content.tsx
│   │   ├── InputField.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── pages/
│   │   ├── ContactPage.tsx
│   │   ├── DashboardAdmin.tsx
│   │   ├── DashboardStudent.tsx
│   │   ├── DashboardTeacher.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── SplitScreenLayout.tsx
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx
│   │
│   ├── utils/
│   │   ├── authUtils.ts
│   │   ├── toast.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Features

### 🔐 Authentication & Role-Based Access
- JWT-based authentication using **httpOnly cookies** and **refresh token flow**.
- Secure role-based routing via **React Router v6**.
- User roles:  
  - **Student:** View personal profile & enrolled courses  
  - **Teacher:** Manage students (CRUD)  
  - **Admin:** View analytics and manage teachers  

---

### 🧑‍🏫 Task 2 – Student Management (Teacher)
- `/students` API integrated with **React Query** for CRUD operations.
- **Student Table** with:
  - Pagination  
  - Filtering & Sorting  
  - Search bar  
- Built using **React Hook Form** + **Yup** for validation.
- Includes **modals** for edit/delete confirmations.
- **Toast notifications** for all actions.

---

### 📊 Task 3 – Analytics & Teacher Management (Admin)
- **Analytics Dashboard** with:
  - Recharts visualizations (students by age, per teacher, totals)
  - Summary metric cards
  - Recent student enrollments
- **Teacher Management** with CRUD operations via `/teachers` API.
- Specialization filters and modals for editing/deleting teachers.

---

### 💻 Task 4 – UX, Responsiveness & Advanced Features
- Fully responsive with **Tailwind CSS**.
- **Theme switching** (Light/Dark) using **local storage** persistence.
- **Accessible UI** with ARIA roles and keyboard navigation.
- Advanced search and filter functionality for both students and teachers.

---

## ⚙️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | React (TypeScript), React Router v6 |
| State/Data | React Query |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | React Hook Form + Yup |
| Notifications | React Toastify |
| Auth | JWT (Access + Refresh Tokens) |
| API Handling | Axios |
| Code Quality | ESLint + Prettier |

---

## 🧩 Environment Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Vishal-V-D/Week3-prime-internship-task.git
cd frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Run Development Server
```bash
npm run dev
```

### 4️⃣ Build for Production
```bash
npm run build
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL1=http://localhost:5000
VITE_API_BASE_URL2=http://localhost:4000/api
v
```

---

## 🧠 Key Components

| Component | Description |
|------------|--------------|
| `AuthContext.tsx` | Manages authentication state, login, logout |
| `ThemeContext.tsx` | Handles dark/light mode toggling |
| `ProtectedRoute.tsx` | Restricts route access by role |
| `DashboardAdmin.tsx` | Displays analytics & teacher management |
| `DashboardTeacher.tsx` | Manages students list with CRUD |
| `DashboardStudent.tsx` | Shows personal info & enrolled courses |
| `Modal.tsx` | Confirmation dialogs |
| `Toast.ts` | Notification utilities |
| `AppRoutes.tsx` | Handles route configuration per role |

---

## 📷 Screens 
<img width="1918" height="912" alt="image" src="https://github.com/user-attachments/assets/fa195914-dc3e-4a53-9e19-b6e34e867eb1" />
<img width="1914" height="906" alt="image" src="https://github.com/user-attachments/assets/dccee072-e902-47a7-8f1f-2648b589e5b9" />
<img width="1919" height="925" alt="image" src="https://github.com/user-attachments/assets/dd046a85-e926-4672-bba3-874f1364731c" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/de861742-47c7-41cf-96af-d88f8efef5cc" />
<img width="1919" height="905" alt="image" src="https://github.com/user-attachments/assets/7dfa0619-44f1-4518-a10b-956c8077a2bf" />





## 🧾 Future Improvements

- Role-based analytics export (CSV / PDF).
- Implement two-factor authentication (2FA).
- Integrate with backend using WebSockets for real-time updates.

---

## 👨‍💻 Author
**Vishal V D**  
Frontend Developer • Passionate about React, TypeScript, and scalable UI design.

GitHub: [Vishal-V-D](https://github.com/Vishal-V-D)  
Repository: [Week3-prime-internship-task](https://github.com/Vishal-V-D/Week3-prime-internship-task)

---

## 🪪 License
This project is licensed under the **MIT License** – feel free to use and modify it.

---

## 🌟 Acknowledgements
- [React Query Docs](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/en-US/)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/)
