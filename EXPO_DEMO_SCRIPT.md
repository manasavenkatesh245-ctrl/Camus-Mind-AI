# CampusMind AI — Technology Expo Live Demonstration Script

**Title:** CampusMind AI — Intelligent College Knowledge Assistant  
**Duration:** 3 to 5 Minutes  
**Target Audience:** Expo Judges, Faculty Evaluators, Students, Campus Administrators  

---

## 1. The Hook (30 Seconds)

> *"Welcome! Every semester, thousands of college students struggle to find critical academic policies buried inside 60-page PDF handbooks, dense syllabi, and administrative notices. When students miss an attendance threshold or a tuition deadline, the consequence is real: academic penalties and late fees.*  
> 
> *Traditional search is keyword-rigid, and generic LLMs hallucinate policies from other universities. Today, we present **CampusMind AI** — an institutional knowledge assistant that delivers verified, evidence-grounded answers with exact page citations, prevents hallucinations, and generates interactive study quizzes directly from course documents."*

---

## 2. Interactive Walkthrough (3 Minutes)

### Step 1: Rapid Knowledge Ingestion
- **Action:** Open `http://127.0.0.1:8000` in the browser. Navigate to the **Documents** tab.
- **Presenter:** *"First, let's load our institutional dataset. CampusMind AI includes an official sample dataset: the 5-page Apex Institute of Technology Academic & Campus Life Handbook (2024–2025)."*
- **Action:** Click **"Load Apex Demo Handbook"**.
- **Observation:** Notice the progress indicator (`Processing` -> `Indexed & Ready`). The handbook is parsed into 5 pages and 12 overlapping vector chunks.
- **Presenter:** *"Notice the transparency: clicking '12 chunks' lets anyone inspect the sliding-window text excerpts and estimated token counts stored in our vector index."*

### Step 2: Conversational RAG with Verifiable Citations
- **Action:** Navigate to **AI Chat Assistant**.
- **Presenter:** *"Now, let's test a policy question that students ask constantly."*
- **Action:** Click the sample prompt:  
  `"What is the minimum attendance requirement to sit for exams?"`
- **Result:** The system responds:
  > *According to the verified college documentation, students must maintain a minimum attendance of 75% in all lectures and laboratory sessions... Failure results in an administrative grade of FA.*
- **Action:** Click the citation pill: `[Apex Student Handbook p.2]`.
- **Observation:** The **Citation Inspector Modal** slides open, displaying:
  - Document Title: *Apex Student Academic & Campus Life Handbook*
  - Page Number: *Page 2*
  - Relevance Score: *~95%*
  - Exact source quote highlighted.
- **Presenter:** *"Every single claim is grounded in the document with an exact page number. Students and professors never have to guess whether the AI made it up."*

### Step 3: Zero-Hallucination & Negative Testing
- **Presenter:** *"What happens when a student asks something outside the document? Generic chatbots often invent believable fake policies. Watch how CampusMind AI behaves."*
- **Action:** Click the negative test chip or type:  
  `"What is the procedure for launching a space rocket from campus?"`
- **Result:** The assistant responds:
  > *"The uploaded documents do not contain sufficient information to answer this question. I am strictly grounded in your uploaded documents and will not speculate or fabricate answers."*
- **Presenter:** *"Our dual-stage relevance gate and prompt boundaries guarantee that unsupported queries receive an honest refusal rather than fabricated answers."*

### Step 4: AI Practice & Mastery Studio
- **Action:** Navigate to **Quiz Studio**.
- **Presenter:** *"Knowledge retention is just as critical as lookup. CampusMind AI converts institutional materials into practice quizzes."*
- **Action:** Select Topic: *"Academic Policies & Attendance Regulations"*, Difficulty: *Medium*, Question Count: *3*. Click **"Generate & Start Quiz"**.
- **Action:** Complete the interactive 3-question quiz with the judges (e.g. 75% attendance rule, 2.0 CGPA probation threshold, $75 late fee). Click **"Submit & View Results"**.
- **Result:** Show the **Score Report** (e.g., 100%), the grade badge, and the detailed question review with cited policy rationale and page references.

### Step 5: Semantic Document Search
- **Action:** Navigate to **Document Search**.
- **Action:** Type: `"tuition payment deadline"` or `"counseling clinic"`.
- **Result:** Point out how the engine displays matching passages, exact page numbers (Page 3 or Page 5), and match percentages.

---

## 3. Technology & Architecture Highlights (30 Seconds)

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide icons, responsive layout.
- **Backend:** Python 3.14, FastAPI REST API with Pydantic validation.
- **Vector & Ingestion Engine:** PyPDF text extraction, sliding window chunking with overlap, TF-IDF + BM25 hybrid semantic retriever.
- **Resilience:** Operates 100% offline with its built-in Local Grounded Engine for reliable expo demonstrations without requiring external API keys. Optional zero-friction configuration for Google Gemini and OpenAI.
- **Persistence:** SQLite WAL mode stores metadata, chat sessions, chunks, and quiz attempts permanently.
- **Testing:** 10/10 automated tests covering the document pipeline, retrieval, citations, and quiz scoring.

---

## 4. Closing & Q&A

> *"CampusMind AI bridges the gap between static campus bureaucracy and modern student productivity. Thank you, and we'd love to take your questions or let you try uploading your own PDF!"*
