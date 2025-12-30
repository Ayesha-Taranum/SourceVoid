# 📝 CodeFlux

A lightweight, room-based code sharing application (Pastebin) built with **Next.js** and **MySQL**. It features temporary rooms that automatically expire after 24 hours, perfect for quick, ad-hoc code sharing.

![Project Preview](https://via.placeholder.com/800x400?text=Preview+Coming+Soon)

## ✨ Features

- **🚀 Instant Room Creation**: Generate unique, short-ID rooms with a single click.
- **⏳ Auto-Expiration**: All rooms and content are automatically deleted 24 hours after creation.
- **🔗 Easy Sharing**: Share via direct URL or Room ID.
- **🌑 Modern UI**: specialized dark mode with glassmorphism aesthetics and monospace font for code.
- **📜 Line Numbers**: Automatic line numbering for pasted code.
- **⚡ Fast**: Built on Next.js for server-side rendering and speed.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Database**: [MySQL](https://www.mysql.com/) (Compatible with Railway, PlanetScale, local, etc.)
- **Styling**: Vanilla CSS (CSS Modules/Global)
- **ID Generation**: `nanoid`

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v16 or higher)
- MySQL Database (Local or Cloud like Railway)

### 2. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
You need a MySQL database with a single table. Run the following SQL to create it:

```sql
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);
```

### 5. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
# .env.local



### 6. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
Feel free to open issues or submit pull requests if you have ideas for improvements!


