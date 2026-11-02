# 👤 Member 1 Viva & Presentation Guide
## Domain: User Management, Authentication, Security & Database Core

---

## 📌 1. Project Division & Responsibilities (Apka Part)
Aapka role project ka **Core Foundation** hai:
1. **User Management**: User registration, profile details, user settings, user roles (`user`, `admin`).
2. **Authentication & Security**: Login, registration, password hashing (`bcrypt`), JWT (JSON Web Tokens) generate karna aur session authenticate karna.
3. **Database Architecture**: SQLite database (`app.db`), SQLAlchemy ORM setup, base models aur relationships (`One-to-One`, `One-to-Many`).
4. **Frontend UI Pages Owned by You**:
   - `frontend/app/register/page.tsx` (Sign up form)
   - `frontend/app/login/page.tsx` (Login form)
   - `frontend/app/profile/page.tsx` (User profile page)
   - `frontend/app/settings/page.tsx` (Account settings)

---

## 🎤 2. Presentation Script (Jab Apki Baari Aaye Toh Kya Bolna Hai)

> **Time:** 2 - 3 minutes  
> **Confidence Tip:** Screen par `register` ya `profile` page khula rakhna aur demo dikhate hue bolna.

### 🗣️ English Script:
> "Good morning / afternoon professors. I am responsible for the **User Management, Authentication, and Database Architecture** of our Duolingo web application.
> 
> In this module, I implemented secure user registration and login using JWT (JSON Web Tokens) and bcrypt password hashing. When a user creates an account or logs in, credentials are encrypted and securely authenticated against our database.
> 
> On the database layer, we used an ORM to design relational tables including `UserModel` and its linked `UserStatsModel`. I also developed the frontend registration and profile screens in Next.js that interact seamlessly with our backend APIs through standardized REST endpoints. Now, I will explain the database models and the end-to-end communication flow."

### 🗣️ Hindi / Hinglish Version (Agar teacher Hindi me comfortable ho):
> "Good morning Ma'am/Sir. Is project me mera part **User Authentication, Profile Management aur Database Core** hai.
> 
> Maine user registration aur login flow design kiya hai jisme security ke liye **bcrypt hashing** aur **JWT authentication** use hua hai taaki passwords plain text me save na hon. Frontend me Next.js ke register, login aur profile pages mere domain me aate hain. 
> 
> Backend me SQLAlchemy ORM ke through relational database design kiya gaya hai jahan User model aur UserStats model connected hain. User ke create hote hi automatically uski profile aur stats link ho jaate hain."

---

## 💻 3. "Code Dikhao" – Exact Files & Lines to Open
Agar teacher bole: **"Code dikhao! Iska code kahan hai?"**, seedha yeh files open karna:

| Purpose | Exact File Path to Open | Key Functions / Class to Highlight |
| :--- | :--- | :--- |
| **User Database Table** | `backend/app/modules/user/models.py` | `class UserModel(Base)` (Lines 6–59) |
| **Password Hash & JWT Logic** | `backend/app/modules/auth/service.py` | `hash_password()`, `verify_password()`, `create_access_token()` |
| **Auth API Endpoints** | `backend/app/modules/auth/router.py` | `@router.post("/register")`, `@router.post("/login")` |
| **Database Connection & Session** | `backend/app/shared/database.py` | `create_engine()`, `SessionLocal()`, `get_db()` |
| **Frontend Register Page** | `frontend/app/register/page.tsx` | Form submit handler, `api.post("/auth/register")` |
| **Frontend Login Page** | `frontend/app/login/page.tsx` | Form submit handler, JWT token storage |

---

## ❓ 4. Viva Questions & Exact Answers (Teacher's Style)

### 🔴 Q1: "User Page / Register khula hai, toh iske module/model me kya use kiya hai?"
**(Reference from WhatsApp screenshot: "Toh iske module me kya use kiya h - Bataya name ke liye character date ke liye date time yhi sb")**

**Direct Answer:**
> "Ma'am, user module ke liye humne `UserModel` banaya hai (`backend/app/modules/user/models.py`). Isme different data types use kiye hain:
> - `id`: **String** (UUID - unique primary key)
> - `username`: **String** (unique=True, index=True - indexing se fast search hota hai)
> - `display_name`: **String** (nullable=False)
> - `email`: **String** (unique=True, user email validate karne ke liye)
> - `password_hash`: **String(255)** (hashed password store karta hai, plain text nahi)
> - `role`: **String(32)** (default='user', admin ya learner identify karne ke liye)
> - `avatar`: **String** (profile image URL/path store karne ke liye)
> - `is_active`: **Boolean** (default=True)
> - `created_at`: **DateTime** (server_default=func.now() - account creation timestamp)
> - `updated_at`: **DateTime** (account modify hone ka timestamp)
> - Aur iska `relationship` hai **UserStatsModel** ke sath (One-to-One)."

---

### 🔴 Q2: "Frontend aur backend kaise communicate kar rahe hain registration ya login par?"
**(Teacher ka core question: "Frontend backend kaise communicate kr rhe?")**

**Direct Step-by-Step Answer (Bolne ka flow):**
> 1. **Step 1 (User Action):** User frontend par `http://localhost:3000/register` form me username, email aur password fill karta hai aur "Create Account" button click karta hai.
> 2. **Step 2 (API Call):** React ka `handleSubmit` trigger hota hai, aur `frontend/lib/api-client.ts` ke through HTTP **POST** request jaati hai endpoint `POST /api/v1/auth/register` par with JSON body (`{ username, email, password }`).
> 3. **Step 3 (Backend Routing & Validation):** Backend me `auth/router.py` request receive karta hai. Pydantic schema (`RegisterRequest`) check karta hai ki email valid format me hai ya nahi aur password empty toh nahi hai.
> 4. **Step 4 (Service & Hashing):** `auth/service.py` me `bcrypt` algorithm password ko salt ke sath hash banata hai (e.g., `$2b$12$...`).
> 5. **Step 5 (Database Storage):** SQLAlchemy session `db.add(new_user)` aur `db.commit()` call karke SQLite database (`app.db`) ke `users` table me row insert karta hai.
> 6. **Step 6 (Token Generation & Response):** Backend JWT secret key se ek `access_token` encode karta hai aur status `200 OK` ya `201 Created` ke sath JSON response frontend ko bhejta hai:  
>    `{ "access_token": "ey...", "token_type": "bearer", "user": { ... } }`
> 7. **Step 7 (UI Update):** Frontend token ko store kar leta hai (cookie/localStorage) aur user ko automatically dashboard `/learn` page par redirect kar deta hai."

---

### 🔴 Q3: "Password security kaise ensure ki hai? Plain text me database me store hota hai kya?"
**Direct Answer:**
> "Nahi Ma'am, password kabhi plain text me save nahi hota. Hum **`bcrypt`** hashing library use kar rahe hain jo random **Salt** add karke irreversible hash create karti hai. Agar database leak bhi ho jaye, tab bhi attacker original password decode nahi kar sakta. Login ke time `bcrypt.checkpw()` se hash match kiya jata hai."

---

### 🔴 Q4: "JWT token kya hota hai aur kyun use kiya?"
**Direct Answer:**
> "**JWT ka full form JSON Web Token hai.** Yeh ek stateless authentication mechanism hai. User login hone ke baad server usse ek signed token deta hai. Har subsequent request me frontend yeh token header me bhejta hai:  
> `Authorization: Bearer <token>`  
> Iska fayda yeh hai ki server ko bar-bar database me session lookup nahi karna padta, token khud verify ho jata hai."

---

### 🔴 Q5: "Primary Key aur ForeignKey me kya difference hai yahan?"
**Direct Answer:**
> - `id` in `UserModel` **Primary Key** hai jo har user ko uniquely identify karti hai.
> - `UserStatsModel` me `user_id` **ForeignKey** hai jo `users.id` se linked hai. Isse One-to-One relationship banti hai aur `cascade="all, delete-orphan"` laga hai, matlab agar user delete hoga toh uske stats bhi clean ho jayenge."

---

## 🎓 5. Django vs Our Code (Teacher Confusion Buster)
> [!IMPORTANT]
> Agar teacher syllabus ke mutabik **Django** ke words use kare, toh confuse mat hona! Dono ka direct connection yeh hai:

| Agar Teacher Puche (Django Term) | Hamare Project Me Iska Code Kahan Hai? | Kese Samjhana Hai |
| :--- | :--- | :--- |
| **"Django models.py me fields kya hain?"** | `backend/app/modules/user/models.py` | "Ma'am Django me `models.CharField()` hota hai, hamare code me SQLAlchemy ORM ka `Column(String)` wahi same kaam karta hai. Date ke liye Django ka `models.DateTimeField()` = `Column(DateTime)`." |
| **"Django views.py kahan hai?"** | `backend/app/modules/auth/router.py` & `service.py` | "Django me jise `views.py` bolte hain, wo yahan FastAPI router functions aur service methods hain jo request process karte hain." |
| **"Django urls.py kahan hai?"** | `backend/app/modules/auth/router.py` & `backend/app/api/v1/router.py` | "Django ka `urlpatterns = [path('register/', ...)]` yahan `@router.post('/register')` ke format me hai." |
| **"Django Serializer / Form kahan hai?"** | `backend/app/modules/user/schemas.py` | "Django REST Framework ka `serializers.ModelSerializer` yahan **Pydantic Schemas** (`BaseModel`) ke through implement hua hai jo incoming JSON validate karta hai." |
| **"Database file kahan hai?"** | `backend/app.db` | "SQLite database file `backend/app.db` hai, jo Django ke default `db.sqlite3` ki tarah hi SQLite engine use karti hai." |

