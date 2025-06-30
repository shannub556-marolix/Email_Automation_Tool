# 🚀 Email Automation Tool – Bulk Personalized Email Sender

🌐 [Live Demo](https://email-automation-tool-one.vercel.app/)

---

## ✨ Overview

The **Email Automation Tool** is a full-stack web application built to **automate and simplify the process of sending personalized bulk emails using an Excel file** and custom SMTP configurations. It provides a secure and intuitive interface to manage email campaigns, track status in real-time, and maintain an organized history of sent emails.

🔒 **Secure** &nbsp;&nbsp;&nbsp;&nbsp;📩 **Bulk Emails** &nbsp;&nbsp;&nbsp;&nbsp;📊 **Real-Time Tracking** &nbsp;&nbsp;&nbsp;&nbsp;📁 **Excel Upload** &nbsp;&nbsp;&nbsp;&nbsp;📈 **Campaign Insights**

---

## 💡 Problem Statement & Inspiration

As an aspiring software developer actively applying for jobs, I found myself **repeatedly switching between job posts on LinkedIn and composing personalized emails manually** — a tedious and repetitive task.

To streamline this, I built the **Email Automation Tool**.

With a **single Excel upload** containing target email addresses and dynamic placeholders, I could **send personalized messages in seconds**, track which ones were delivered or failed, and **plan follow-up emails** — all while saving time, effort, and context switching.

This tool isn’t limited to job seekers. It is designed to benefit:
- 🎯 **Marketing teams** for campaigns
- 🧑‍💼 **HR teams** for recruitment or internal announcements
- 🧑‍🏫 **Educators** for distributing grades or materials
- 💼 **Sales teams** for lead outreach

---

## ⚙️ Core Features

- 🔐 **JWT Authentication**: Secure login and signup to protect your data
- 📧 **SMTP Configuration**: Supports Gmail, Outlook, and any custom SMTP server with real-time credential validation
- 📁 **Excel Upload**: Easily upload `.xlsx` files with dynamic content fields
- ✍️ **Template Personalization**: Use placeholders like `{name}`, `{code}`, etc., in your subject and body for customized messages
- 📬 **Bulk Email Dispatch**: Emails are efficiently queued and sent in the background with status management
- 📊 **Dashboard & Tracking**: View real-time statistics for sent, pending, and failed emails
- 📚 **Email History**: Full log of past emails with filters, search, and delete options
- 📱 **Responsive Design**: Mobile-friendly UI powered by React + Tailwind + shadcn-ui
- ✅ **Robust Validation**: Ensures valid SMTP setup, email formats, and Excel structure before sending

---

## 🧑‍💻 Tech Stack

| Layer        | Stack                                                                 |
|--------------|-----------------------------------------------------------------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, shadcn-ui                       |
| **Backend**  | FastAPI, Pydantic, SMTP, Python Email, Excel Parsing (`openpyxl`)    |
| **Database** | MongoDB Atlas                                                         |
| **Security** | JWT Auth, bcrypt hashing, secure SMTP handling                        |

---

## 🏗️ System Architecture

```
[User]
   │
   ▼
Frontend (React + Vite)
   │
   ▼
Backend (FastAPI + Python)
   │
   ├── MongoDB (User & Email Records)
   └── SMTP Server (Gmail / Outlook / Custom)
```

---

## 🎯 Use Cases

- **Job Seekers** – Send bulk job applications & referrals with personalized content
- **Marketing Teams** – Campaigns, product launches, promotions
- **Recruiters** – Candidate notifications, onboarding, interview schedules
- **Educators** – Sending grades, updates, class information
- **Sales Teams** – Lead generation outreach with Excel exports from tools like Apollo or ZoomInfo

---

## 🚀 Getting Started

### 📦 Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB (local or cloud)

---

### 🔧 Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set environment variables in `config.py` (JWT_SECRET, DB_URI, SMTP_HOST, etc.)

```bash
uvicorn main:app --reload
```

Runs on [http://localhost:8000](http://localhost:8000)

---

### 🖥️ Frontend Setup

```bash
cd Frontend
npm install
```

Configure `src/config/env.js` with your API URL.

```bash
npm run dev
```

Visit the app at [http://localhost:5173](http://localhost:5173)

---

## 📈 Future Enhancements

- 📅 **Email Scheduling** – Schedule campaigns for later delivery
- 🖼️ **Rich HTML Templates** – WYSIWYG email editor & attachment support
- 📬 **Analytics** – Open/click tracking, bounce rates, and heatmaps
- 🧑‍🤝‍🧑 **User Roles** – Admin, Manager, Viewer access levels
- 🔌 **3rd Party Integrations** – Google Sheets, CRMs, Notion API, etc.
- 🌍 **Internationalization (i18n)** – Multi-language support

---

## 🤝 Contributing

Contributions, feature suggestions, and improvements are welcome! Feel free to fork this repo or raise issues.

---

## 🙌 Acknowledgments

- FastAPI Docs for an incredible backend framework
- shadcn-ui for clean, beautiful UI components
- openpyxl for seamless Excel parsing in Python
- SMTP standards that make cross-provider email possible

---

## 📬 Contact

Made with ❤️ by **[Shanmukha Busappagari]**

- 🔗 [LinkedIn](https://www.linkedin.com/in/shanmukhabusappagari/)
- 📧 bussapagarishannu@gmail.com
- 🌐 [Live Demo](https://email-automation-tool-one.vercel.app/)

---

## ⭐️ If you find this project useful, don’t forget to star the repo!