Here’s a **clean, professional README.md** you can drop straight into your repo. It’s written for your exact setup (Expo + .NET 8 + your local path + your workflow).

---

```markdown
# 🚀 Secure Escape

Secure Escape is a full-stack application built with:

- 🧠 Backend: ASP.NET Core (.NET 8)
- 📱 Mobile: React Native (Expo)
- 🔧 Version Control: GitHub (Protected Branch Workflow)

---

# 📁 Project Structure
```

secure-escape-v1/
│
├── secureescape.api/ # .NET 8 Backend API
├── mobile/ # Expo React Native App
└── README.md

````

---

# ⚙️ Prerequisites

Install the following before starting:

- [Git](https://git-scm.com/)
- [Node.js (LTS)](https://nodejs.org/)
- [.NET 8 SDK](https://dotnet.microsoft.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- Expo Go (on your phone)

---

# 📥 Getting Started

## 1. Clone the repository

```bash
cd /Users/roriputu/Documents/Web-Dev/secure-escape

git clone https://github.com/f0f-found/secure-escape-v1.git
cd secure-escape-v1
````

---

# 🧠 Backend Setup (.NET 8)

```bash
cd secureescape.api

dotnet restore
dotnet run
```

👉 The API will run locally (check terminal for port, usually `http://localhost:5000`)

---

# 📱 Mobile Setup (Expo)

Open a new terminal:

```bash
cd mobile

npm install
npx expo start
```

👉 Scan the QR code using **Expo Go**

---

# 🔄 Git Workflow (MANDATORY)

We use a **protected `main` branch**.
You cannot commit directly to `main`.

---

## 🧩 Workflow Steps

### 1. Start from updated `main`

```bash
git checkout main
git pull origin main
```

---

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

---

### 3. Make changes and commit

```bash
git add .
git commit -m "Describe your change"
```

---

### 4. Push your branch

```bash
git push origin feature/your-feature-name
```

---

### 5. Create a Pull Request (PR)

Go to GitHub and create a PR:

```
feature/your-feature-name → main
```

---

### 6. Get approval

- Your PR must be reviewed and approved
- You cannot merge without approval

---

### 7. Merge into `main`

Once approved:

- Merge the PR

---

### 8. Update your local `main`

```bash
git checkout main
git pull origin main
```

---

# 🔁 Example Workflow

```bash
git checkout main
git pull origin main

git checkout -b feature/login-api

# make changes

git add .
git commit -m "Add login API"

git push origin feature/login-api
```

👉 Then:

- Open PR
- Get approval
- Merge

---

# 📌 Team Rules

## ❌ NEVER:

- Commit directly to `main`
- Push directly to `main`
- Merge your own PR without review

---

## ✅ ALWAYS:

- Create a new branch
- Use clear commit messages
- Open a Pull Request
- Get approval before merging

---

# 🧠 Helpful Commands

```bash
git status     # See current changes
git branch     # See current branch
git log        # View commit history
```

---

# ⚠️ Important Notes

- `main` is **protected**
- All work must go through **Pull Requests**
- Always **pull latest changes before starting work**

---

# 🔥 Summary

```
main → pull → create branch → code → commit → push → PR → review → merge → pull
```

---

# 👥 Team

Built by the Secure Escape team 🚀

```


```
