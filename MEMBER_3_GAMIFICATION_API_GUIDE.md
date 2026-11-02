# 🏆 Member 3 Viva & Presentation Guide
## Domain: Gamification, Social Leaderboard & End-to-End API Architecture

---

## 📌 1. Project Division & Responsibilities (Apka Part)
Aapka role project ka **Engagement System & System Architecture** hai:
1. **Gamification Engine**: Daily streaks, XP calculation, Hearts replenishment, Gems currency, and Achievement Badges.
2. **Competitive Leaderboard & Social**: Weekly/monthly ranked standings (`LeaderboardEntryModel`), leagues, and friends connection.
3. **Full-Stack API Communication Layer**:
   - `frontend/lib/api-client.ts` (Centralized Fetch Client, Token interceptor, Error handling).
   - Cross-Origin Resource Sharing (CORS) & Middleware (`backend/app/shared/middleware.py`).
   - Server lifecycle, health checks, and deployment configuration (`backend/app/main.py`).
4. **Frontend UI Pages Owned by You**:
   - `frontend/app/leaderboard/page.tsx` (Top learners ranking screen)
   - `frontend/app/friends/page.tsx` (Friends & social feed)
   - `frontend/components/gamification/StreakDisplay.tsx`, `HeartDisplay.tsx`, `DailyGoal.tsx`

---

## 🎤 2. Presentation Script (Jab Apki Baari Aaye Toh Kya Bolna Hai)

> **Time:** 2 - 3 minutes  
> **Confidence Tip:** Screen par `/leaderboard` khol kar dikhana ya browser ka **Inspect -> Network Tab** open karke live API request/response dikhana.

### 🗣️ English Script:
> "Good morning / afternoon professors. I developed the **Gamification Engine, Social Leaderboard, and the Full-Stack API Communication Layer** of our project.
> 
> Retention in Duolingo relies on habit-forming mechanisms. I implemented the streak calculation logic, XP reward progression, and heart regeneration systems in `UserStatsModel`.
> 
> Furthermore, I built the competitive Leaderboard module that ranks users globally and amongst friends using optimized SQL sorting.
> 
> On the architectural side, I designed our centralized API communication bridge in `api-client.ts`. It manages asynchronous HTTP requests, injects JWT authorization headers, handles server status codes, and ensures resilient error fallback between Next.js and the Python backend. 
> 
> Now, I will explain the gamification schema and demonstrate the live network communication flow."

### 🗣️ Hindi / Hinglish Version (Agar teacher Hindi me comfortable ho):
> "Good morning Ma'am/Sir. Is project me mera part **Gamification, Leaderboard System aur Frontend-Backend Communication Architecture** hai.
> 
> Duolingo ka sabse popular feature uska streak system aur leaderboards hote hain. Maine `UserStatsModel` aur `LeaderboardEntryModel` implement kiya hai jo user ke daily login par streak update karta hai, lesson complete hone par total XP calculate karta hai, aur top ranks assign karta hai.
> 
> Sath hi, frontend aur backend ke beech jitna bhi data transfer hota hai—jaise `frontend/lib/api-client.ts` se REST API requests bhejna, JWT tokens attach karna, CORS policy handle karna aur errors manage karna—woh architecture maine manage kiya hai."

---

## 💻 3. "Code Dikhao" – Exact Files & Lines to Open
Agar teacher bole: **"Code dikhao! Iska code kahan hai?"**, seedha yeh files open karna:

| Purpose | Exact File Path to Open | Key Functions / Class to Highlight |
| :--- | :--- | :--- |
| **Gamification Table (XP, Streak, Hearts)** | `backend/app/modules/gamification/models.py` | `class UserStatsModel(Base)` (Lines 15–49) |
| **Streak & XP Calculation Logic** | `backend/app/modules/gamification/service.py` | `record_activity()`, `award_xp()`, streak increment logic |
| **Leaderboard Table & Ranking** | `backend/app/modules/leaderboard/models.py` | `class LeaderboardEntryModel(Base)` (Lines 6–31) |
| **Leaderboard API Router** | `backend/app/modules/leaderboard/router.py` | `@router.get("")`, `@router.get("/me")` |
| **Centralized API Client (Frontend)** | `frontend/lib/api-client.ts` | `fetchApi()`, `API_BASE_URL`, `ApiError` class |
| **Frontend Leaderboard UI** | `frontend/app/leaderboard/page.tsx` | Rankings list, user avatar, XP badge |
| **Gamification UI Components** | `frontend/components/gamification/` | `StreakDisplay.tsx`, `HeartDisplay.tsx` |

---

## ❓ 4. Viva Questions & Exact Answers (Teacher's Style)

### 🔴 Q1: "Leaderboard ya Gamification ka page khula hai, toh iske module/model me kya use kiya hai?"
**(Reference from WhatsApp screenshot: "Toh iske module me kya use kiya h - Bataya name ke liye character date ke liye date time yhi sb")**

**Direct Answer:**
> "Ma'am, isme do primary models use hue hain:
> 
> 1. **UserStatsModel (`user_stats` table in `gamification/models.py`):**
>    - `id`: **String** (Primary Key)
>    - `user_id`: **String** (**ForeignKey** linked to `users.id`, unique=True - 1-to-1 relationship)
>    - `total_xp`: **Integer** (default=0 - user ke overall points)
>    - `current_streak`: **Integer** (default=0 - continuous days of practice)
>    - `longest_streak`: **Integer** (maximum streak achieved)
>    - `hearts`: **Integer** (default=5 - mistake budget)
>    - `gems`: **Integer** (default=500 - in-app virtual currency)
>    - `daily_xp`: **Integer** (current day's progress)
>    - `daily_goal_xp`: **Integer** (e.g. 20 XP target per day)
>    - `last_active_date`: **Date** (sirf date store karta hai YYYY-MM-DD taaki streak calculate ho sake)
>    - `created_at` & `updated_at`: **DateTime**
> 
> 2. **LeaderboardEntryModel (`leaderboard_entries` table in `leaderboard/models.py`):**
>    - `user_id`: **String** (ForeignKey linked to `users.id`)
>    - `period`: **String** (e.g., 'weekly', 'monthly', 'all_time')
>    - `xp`: **Integer** (Points earned during that specific period)
>    - `rank`: **Integer** (Calculated rank position: 1, 2, 3...)
>    - `updated_at`: **DateTime**"

---

### 🔴 Q2: "Frontend aur backend kaise communicate kar rahe hain? Pure flow ko detail me samjhao."
**(Teacher ka core question: "Aur pucha frontend backend kaise communicate kr rh - Bola api request bheji, form submit karega toh data store hoga, server response bhejega, then show hoga")**

**Direct Step-by-Step Answer (Bolne ka flow):**
> 1. **Step 1 (User Request on UI):** User `/leaderboard` tab par click karta hai.
> 2. **Step 2 (Frontend API Client Call):** `frontend/app/leaderboard/page.tsx` me `useEffect` hook trigger hota hai jo `apiClient.get('/leaderboard?period=weekly')` call karta hai (`frontend/lib/api-client.ts`).
> 3. **Step 3 (HTTP Headers & Token):** Client browser ke storage se stored JWT access token nikalta hai aur request headers me set karta hai:  
>    `Authorization: Bearer <jwt_token>`  
>    `Content-Type: application/json`
> 4. **Step 4 (Network & CORS Middleware):** Next.js request ko Python server `http://localhost:8000/api/v1/leaderboard` par forward karta hai. Backend me `setup_middleware` (`app/shared/middleware.py`) CORS origins check karta hai aur verify karta hai ki request trusted frontend se aayi hai.
> 5. **Step 5 (Backend Route & Query):** `leaderboard/router.py` request receive karta hai, `get_current_user` dependency token decode karke user verify karti hai, aur `service.get_leaderboard()` execute hota hai.
> 6. **Step 6 (Database Query):** SQLAlchemy database me SQL query run karta hai:  
>    `SELECT * FROM leaderboard_entries WHERE period = 'weekly' ORDER BY xp DESC LIMIT 20`
> 7. **Step 7 (JSON Response):** Server data ko `LeaderboardResponse` schema me serialize karke HTTP status code `200 OK` ke sath JSON response return karta hai:  
>    `{ "entries": [ { "rank": 1, "username": "rahul", "xp": 450 }, ... ] }`
> 8. **Step 8 (React State Update):** Frontend `api-client.ts` JSON parse karke component ke state (`setLeaderboard(data.entries)`) me save karta hai. React re-render hota hai aur screen par animated leaderboard list show ho jaati hai."

---

### 🔴 Q3: "Streak calculate karne ka logic kya hai? Agar user ek din skip kar de toh kya hota hai?"
**Direct Answer:**
> "Ma'am, streak calculation `last_active_date` aur `today` ke difference par chalti hai:
> - Case 1: Agar user ne **aaj hi** pehle bhi lesson kiya hai (`last_active_date == today`), toh streak change nahi hoti.
> - Case 2: Agar user ne **kal** practice ki thi (`today - last_active_date == 1 day`), toh `current_streak += 1` ho jata hai, aur `longest_streak` update ho jata hai.
> - Case 3: Agar difference **1 din se zyada** ho gaya (`today - last_active_date > 1 day`), iska matlab user ne din miss kiya, toh streak reset hokar `1` ho jaati hai."

---

### 🔴 Q4: "Leaderboard me rank kaise determine hoti hai?"
**Direct Answer:**
> "Database me entries ko XP ke descending order me sort karte hain (`ORDER BY xp DESC`). SQL window function ya Python ranking logic har user ko uske XP score ke hisaab se rank 1, 2, 3 assign karti hai. Tied scores me latest timestamp ko priority milti hai."

---

### 🔴 Q5: "CORS kya hota hai aur kyun zaroori hai?"
**Direct Answer:**
> "**CORS** ka matlab hai *Cross-Origin Resource Sharing*. Frontend port 3000 par run hota hai aur backend port 8000 par. Browser security rules alag origins ke beech direct calls block karte hain. Humne backend me `CORSMiddleware` configure kiya hai jo frontend origin (`http://localhost:3000`) ko allow karta hai."

---

## 🎓 5. Django vs Our Code (Teacher Confusion Buster)
> [!IMPORTANT]
> Agar teacher syllabus ke mutabik **Django** ke words use kare, toh confuse mat hona! Dono ka direct connection yeh hai:

| Agar Teacher Puche (Django Term) | Hamare Project Me Iska Code Kahan Hai? | Kese Samjhana Hai |
| :--- | :--- | :--- |
| **"Django models.IntegerField() aur DateField() kahan hai?"** | `backend/app/modules/gamification/models.py` | "Django me `models.IntegerField()` aur `models.DateField()` likhte hain, hamare code me SQLAlchemy ka `Column(Integer)` aur `Column(Date)` exactly wahi field types hain." |
| **"Django me CORS headers kaise allow karte hain?"** | `backend/app/shared/middleware.py` | "Django me `django-cors-headers` package use hota hai settings me, yahan FastAPI ka `CORSMiddleware` use hua hai." |
| **"Django REST Framework generic views / viewsets kahan hain?"** | `backend/app/modules/leaderboard/router.py` | "Django DRF ke `APIView` ya `ListAPIView` ki jagah yahan FastAPI ka `@router.get('')` controller function use kiya gaya hai." |
| **"Frontend-Backend contract kaise define hota hai?"** | `backend/app/modules/leaderboard/schemas.py` & `frontend/lib/api-client.ts` | "Django me Serializers data shape define karte hain, yahan **Pydantic Schemas** request aur response contracts validate karte hain." |

