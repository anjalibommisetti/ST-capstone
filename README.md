# TestFusion – Integrated Software Testing Platform
> **Combining White Box Testing and Black Box Testing into a Unified Enterprise QA Application**

TestFusion is a full-featured web application designed for students, software engineers, and QA testers to analyze Java source code, generate behavioral test suites, calculate McCabe cyclomatic complexity, visualize interactive Control Flow Graphs (CFG), measure line and branch coverage, execute tests inside an isolated JVM sandbox, log defects, and export audit-ready test reports.

---

## 🌟 Key Features

### 1. User Authentication & RBAC
- Stateless JWT-based authentication with BCrypt password hashing.
- Role-Based Access Control (**ROLE_ADMIN** for platform administrators, **ROLE_USER** for QA engineers/testers).
- User profile management with self-service credential updates.
- 1-Click Instant Demo Login buttons (`Tester` and `Admin`).

### 2. Project & Source Code Management
- Create, update, view, and delete testing projects.
- In-browser code editor with line numbering and syntax-aware AST parsing.
- Pre-seeded **Age Eligibility Verification Engine** (`AgeValidator.java`) demonstrating testing across all key inflection boundaries (-1, 0, 17, 18, 120, 121).

### 3. White Box Testing Module
- **Java AST Parser**: Method discovery, line ranges, decision points (`if`, `switch`), and loop points (`for`, `while`, `do-while`).
- **Interactive Control Flow Graph (CFG)**: SVG-rendered graph with entry, statement, decision, loop, and exit nodes; zoom/pan controls; and branch labeling (`true`, `false`, `return`).
- **Cyclomatic Complexity**: Exact McCabe calculation ($M = E - N + 2P$) with automated risk classification (Low, Moderate, High, Very High).
- **Basis Independent Paths**: Automatic derivation of linearly independent execution paths with 1-click test generation.
- **Statement & Branch Coverage**: Derived directly from isolated execution trace data.

### 4. Black Box Testing Module
- **Equivalence Partitioning (EP)**: Define valid/invalid input partitions and synthesize representative tests.
- **Boundary Value Analysis (BVA)**: Generates tests at minimum, maximum, just below, just above, and internal threshold boundaries.
- **Decision Table Testing**: Combinatorial evaluation ($2^N$ rules) of boolean conditions mapped to expected system actions.
- **Custom Functional & Negative Testing**: Positive, negative, and intentional mismatch failure demonstration cases.

### 5. Execution Engine & Sandbox Isolation
- Uploaded and analyzed code runs inside a dedicated, isolated JVM subprocess with:
  - Strict memory limit (`-Xmx128m`)
  - Execution timeout (`6 seconds`)
  - Prevention of malicious invocations (`Runtime.getRuntime()`, `ProcessBuilder`, `System.exit`)
  - Ephemeral workspace auto-cleaned after every run

### 6. Defect Management & Reporting
- Triage test failures into verified bug records (`DEF-XXXX`).
- Severity assignment (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and lifecycle status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
- Export test results and defect summaries to structured **CSV** and printable **PDF / Report** format.
- Run-to-run regression comparison with delta metrics for coverage and pass/fail shifts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Java 17/25, Spring Boot 3.3.5, Spring Security, Spring Data JPA, JavaParser |
| **Database** | Embedded H2 (MySQL Mode - zero config) or MySQL 8.x |
| **Execution** | Isolated Subprocess Runner, JUnit 5 |

---

## 🚀 Quick Start Guide

### Option 1: Double-Click Batch Files (Easiest on Windows)
1. Double-click `start-all.bat` in the project root.
2. It will open two console windows:
   - **Backend**: Spring Boot running on `http://localhost:8080`
   - **Frontend**: Vite dev server running on `http://localhost:5173`
3. Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

### Option 2: Running via Terminal / PowerShell

#### Step 1: Start the Backend (Spring Boot)
Open a terminal in the `backend` folder:
```powershell
# Set Java 17+ (JDK 25 installed)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Run Spring Boot (Using local Maven)
& "C:\Users\ANJI\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
```
*The backend will boot up on port `8080` with embedded H2 in MySQL mode automatically pre-seeded with sample data.*

#### Step 2: Start the Frontend (Vite + React)
Open a second terminal in the `frontend` folder:
```powershell
cd frontend
npm run dev
```
*The frontend will start on `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 🔑 Default Login Credentials

The platform initializes with two accounts (you can also use the **1-Click Quick Demo Login** buttons on the login page):

| Role | Username | Password | Purpose |
|---|---|---|---|
| **QA Engineer** | `tester` | `Tester@123` | Create projects, generate tests, view CFG, run suites, log defects |
| **Administrator** | `admin` | `Admin@123` | Full access + Admin Dashboard, system health, user role management |

---

## 🗄️ Database Options

### Default: Embedded H2 (Zero Configuration)
By default, the backend stores data in `./data/testfusion.mv.db` using H2's MySQL compatibility dialect. You can run the application immediately without installing or configuring MySQL.
- **H2 Web Console**: Accessible at `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/testfusion;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`
  - User: `sa` / Password: *(empty)*

### Optional: Standalone MySQL
To use an external MySQL database:
1. Create a database in MySQL:
   ```sql
   CREATE DATABASE testfusion_db;
   ```
2. Import the provided schema:
   ```powershell
   mysql -u root -p testfusion_db < schema.sql
   ```
3. Run the backend with the `mysql` profile:
   ```powershell
   & "C:\Users\ANJI\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 🧪 Running Automated Tests

To verify backend tests:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
& "C:\Users\ANJI\PDD-smileguard\tools\apache-maven-3.9.6\bin\mvn.cmd" test
```

To verify frontend build:
```powershell
cd frontend
npm run build
```

