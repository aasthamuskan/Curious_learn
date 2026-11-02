# 🎓 Member 2 Viva & Presentation Guide
## Domain: Core Learning Engine, Curriculum Hierarchy, Interactive Lessons & Progress Tracking

---

## 📌 1. Project Division & Responsibilities (Apka Part)
Aapka role project ka **Core Business Logic (Learning Experience)** hai:
1. **Curriculum Hierarchy**: Courses (Spanish, French, English) -> Units -> Skills -> Lessons -> Questions.
2. **Interactive Lesson Engine**: Question types (Multiple choice, translation, listening/audio), answer verification, heart deduction for mistakes, and XP rewarding.
3. **Progress Tracking**: Skill unlocking system (prerequisite skills), lesson completion status, and user progress history.
4. **Vocabulary Bank**: Word list, translations, and mastery levels.
5. **Frontend UI Pages Owned by You**:
   - `frontend/app/learn/page.tsx` (Duolingo Learning Path / Roadmap screen)
   - `frontend/app/lesson/[lessonId]/page.tsx` (Interactive Quiz / Question screen)
   - `frontend/app/vocabulary/page.tsx` (Learned words list)

---

## 🎤 2. Presentation Script (Jab Apki Baari Aaye Toh Kya Bolna Hai)

> **Time:** 2 - 3 minutes  
> **Confidence Tip:** Screen par `/learn` (learning path) ya `/lesson/1` (quiz question) open rakhna aur demo dikhate hue bolna.

### 🗣️ English Script:
> "Good morning / afternoon professors. I built the **Core Learning Engine, Curriculum Hierarchy, and Interactive Lesson System** of our application.
> 
> The architecture organizes learning content into a 4-tier relational structure: **Course -> Unit -> Skill -> Lesson -> Question**. 
> 
> On the frontend, I developed the interactive learning path page in Next.js where users see their progress roadmap, as well as the dynamic quiz interface (`/lesson/[lessonId]`). When a user answers a question, our backend validates the answer in real time. If the answer is correct, XP points are credited and the next node unlocks; if incorrect, a heart is deducted with instant visual feedback. 
> 
> Now, I will demonstrate the database models and the interactive API request-response flow."

### 🗣️ Hindi / Hinglish Version (Agar teacher Hindi me comfortable ho):
> "Good morning Ma'am/Sir. Is project me mera part **Core Learning Engine aur Course Hierarchy** hai.
> 
> Duolingo ka jo main interface hota hai—jaise Learning Path (units aur circles) aur question solve karne wali quiz screen—woh maine implement kiya hai. 
> 
> Humara database model 4 levels me structured hai: Course ke andar multiple Units hoti hain, Unit ke andar Skills, Skill ke andar Lessons, aur har Lesson me interactive Questions hote hain. 
> 
> Jab user screen par koi answer select karke 'Check' click karta hai, toh frontend real-time API call bhejta hai. Server answer verify karta hai, agar sahi hai toh XP reward milta hai aur progress update hoti hai, aur galat hone par heart deduct hota hai."

---

## 💻 3. "Code Dikhao" – Exact Files & Lines to Open
Agar teacher bole: **"Code dikhao! Iska code kahan hai?"**, seedha yeh files open karna:

| Purpose | Exact File Path to Open | Key Functions / Class to Highlight |
| :--- | :--- | :--- |
| **Course & Unit Database Tables** | `backend/app/modules/course/models.py` | `CourseModel`, `UnitModel` (Lines 6–50) |
| **Skill, Lesson & Question Tables** | `backend/app/modules/lesson/models.py` | `SkillModel`, `LessonModel`, `QuestionModel` (Lines 6–90) |
| **Answer Checking & Scoring Logic** | `backend/app/modules/lesson/service.py` | `submit_lesson_attempt()`, `verify_answer()` |
| **Lesson API Endpoints** | `backend/app/modules/lesson/router.py` | `@router.get("/{lesson_id}")`, `@router.post("/{lesson_id}/attempts")` |
| **Frontend Learning Tree Roadmap** | `frontend/app/learn/page.tsx` | Units and Skills rendering list |
| **Frontend Quiz & Question Screen** | `frontend/app/lesson/[lessonId]/page.tsx` | Question component, option select, 'Check' button |

---

## ❓ 4. Viva Questions & Exact Answers (Teacher's Style)

### 🔴 Q1: "Lesson / Course page khula hai, toh iske models/modules me kya use kiya hai?"
**(Reference from WhatsApp screenshot: "Toh iske module me kya use kiya h - Bataya name ke liye character date ke liye date time yhi sb")**

**Direct Answer:**
> "Ma'am, humari curriculum hierarchy relational models par based hai:
> 
> 1. **CourseModel (`courses` table in `course/models.py`):**
>    - `id`: **String** (Primary Key)
>    - `name`: **String** (e.g., 'Spanish for Beginners')
>    - `code`: **String** (unique=True, e.g., 'es-en')
>    - `source_language` & `target_language`: **String**
>    - `is_active`: **Boolean**
> 
> 2. **UnitModel (`units` table in `course/models.py`):**
>    - `id`: **String** (Primary Key)
>    - `course_id`: **String** (**ForeignKey** linked to `courses.id` with `CASCADE` delete)
>    - `title`: **String** (Unit name)
>    - `description`: **String**
> 
> 3. **SkillModel (`skills` table in `lesson/models.py`):**
>    - `unit_id`: **String** (ForeignKey linked to `units.id`)
>    - `title`: **String**
>    - `order_index`: **Integer** (Sequence number)
>    - `xp_reward`: **Integer** (XP earned on completion, e.g. 10 or 20)
>    - `prerequisite_skill_id`: **String** (Self-referencing ForeignKey for unlocking levels)
> 
> 4. **LessonModel & QuestionModel (`lesson/models.py`):**
>    - `lesson_id`: **String** (ForeignKey to `lessons.id`)
>    - `type`: **String** (e.g., 'MULTIPLE_CHOICE', 'TRANSLATION')
>    - `prompt`: **String** (Question text)
>    - `correct_answer`: **String**
>    - `options`: **JSON / List** (Multiple choice options array)
>    - `created_at`: **DateTime**"

---

### 🔴 Q2: "Frontend aur backend kaise communicate kar rahe hain jab user question solve karta hai?"
**(Teacher ka core question: "Frontend backend kaise communicate kr rhe?")**

**Direct Step-by-Step Answer (Bolne ka flow):**
> 1. **Step 1 (Load Question):** User `/lesson/1` open karta hai. Frontend Next.js component mount hone par `GET /api/v1/lessons/{id}` call karta hai. Backend database se questions aur options JSON me return karta hai (`correct_answer` frontend ko expose nahi hota security ke liye).
> 2. **Step 2 (User Action):** User screen par 4 options me se ek option select karta hai aur neeche green **'Check'** button click karta hai.
> 3. **Step 3 (API Request):** `frontend/lib/api-client.ts` HTTP **POST** request bhejta hai:  
>    `POST /api/v1/lessons/{lesson_id}/attempts`  
>    Payload: `{ "question_id": "q101", "selected_answer": "Hola" }`
> 4. **Step 4 (Backend Verification):** Backend me `lesson/service.py` question ID ko database me lookup karta hai aur user ke `selected_answer` ko actual `correct_answer` se compare karta hai.
> 5. **Step 5 (Database Update):**
>    - Agar answer **CORRECT** hai: `SkillProgress` table me progress percentage increase hoti hai, aur user ke total XP me +10 add hota hai.
>    - Agar answer **WRONG** hai: `UserStats` table me se 1 heart deduct hota hai (`hearts = hearts - 1`).
> 6. **Step 6 (Server Response):** Server response JSON return karta hai:  
>    `{ "is_correct": true, "explanation": "Well done!", "xp_earned": 10, "remaining_hearts": 5 }`
> 7. **Step 7 (UI Feedback):** Response milte hi frontend state update hoti hai:
>    - Screen ke bottom par **Green Sheet** slide hoti hai ("Nicely done!"), audio chime play hota hai, aur 'Continue' button appear hota hai.
>    - Wrong hone par **Red Sheet** aati hai correct answer explanation ke sath."

---

### 🔴 Q3: "Self-referencing ForeignKey kya hota hai jo Skill model me use hua hai?"
**Direct Answer:**
> "Ma'am, `prerequisite_skill_id` ek **Self-referencing ForeignKey** hai jo usi `skills` table ki primary key `id` ko point karti hai. Iska use **Level Unlocking** ke liye hota hai: jab tak user prerequisite skill complete nahi karta, tab tak next skill locked rehti hai."

---

### 🔴 Q4: "Cascade delete (`ondelete='CASCADE'`) kyun use kiya hai?"
**Direct Answer:**
> "Agar hum kisi Course ko delete karein, toh database integrity maintain rakhne ke liye us Course se linked saari Units, Skills aur Lessons automatically delete ho jani chahiye, varna orphaned records database me reh jayenge. Isliye humne `ondelete='CASCADE'` lagaya hai."

---

### 🔴 Q5: "JSON data type question options me kyun use kiya?"
**Direct Answer:**
> "Har question me multiple options hote hain (jaise 4 choices, ya word tiles). Har option ke liye alag table banane ke bajaye humne options ko structured **JSON column** me store kiya hai, jisse dynamic options fast retrieve ho jate hain bina extra SQL join lagaye."

---

## 🎓 5. Django vs Our Code (Teacher Confusion Buster)
> [!IMPORTANT]
> Agar teacher syllabus ke mutabik **Django** ke words use kare, toh confuse mat hona! Dono ka direct connection yeh hai:

| Agar Teacher Puche (Django Term) | Hamare Project Me Iska Code Kahan Hai? | Kese Samjhana Hai |
| :--- | :--- | :--- |
| **"Django models.ForeignKey() kahan hai?"** | `backend/app/modules/course/models.py` & `lesson/models.py` | "Django me `models.ForeignKey(Course, on_delete=models.CASCADE)` likhte hain, SQLAlchemy me hum `Column(String, ForeignKey('courses.id', ondelete='CASCADE'))` likhte hain. Dono exact same database foreign key constraints create karte hain." |
| **"Django JSONField kahan hai?"** | `backend/app/modules/lesson/models.py` | "Django ke `models.JSONField()` ki jagah yahan SQLAlchemy ka `Column(JSON)` use hua hai options store karne ke liye." |
| **"Django views.py me answer check function kahan hai?"** | `backend/app/modules/lesson/router.py` & `service.py` | "Django ka API view yahan FastAPI router endpoint `@router.post('/{lesson_id}/attempts')` hai." |
| **"Django Seed data / Fixtures kahan hai?"** | `backend/seed/` folder | "Django me fixtures ya data migrations se initial data load karte hain, yahan `backend/seed/` me Python seed scripts hain jo initial Spanish, French courses database me insert karti hain." |

