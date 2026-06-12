import { db, usersTable, coursesTable, chaptersTable, lessonsTable, enrollmentsTable, lessonProgressTable, liveClassesTable, testsTable, questionsTable, testResultsTable, discussionsTable, repliesTable, assignmentsTable, bookmarksTable, ratingsTable } from "./index";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(pw: string) {
  return createHash("sha256").update(pw + "alis_salt_2024").digest("hex");
}

async function upsertUser(data: { name: string; email: string; password: string; role: string; subject?: string; grade?: string; bio?: string; parentId?: number | null }) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
  if (existing.length > 0) return existing[0];
  const [u] = await db.insert(usersTable).values({
    name: data.name, email: data.email,
    passwordHash: hashPassword(data.password),
    role: data.role,
    subject: data.subject ?? null,
    grade: data.grade ?? null,
    bio: data.bio ?? null,
    parentId: data.parentId ?? null,
  }).returning();
  return u;
}

async function seed() {
  console.log("Starting comprehensive ALIS seed...");

  // ADMIN
  await upsertUser({ name: "System Admin", email: "admin@alis.com", password: "admin123", role: "admin" });

  // TEACHERS
  const teacherDefs = [
    { name: "Dr. Ananya Sharma",  email: "teacher@alis.com",  password: "password123", role: "teacher", subject: "Python & Data Science",    bio: "PhD CS, 12 years teaching Python and ML." },
    { name: "Prof. Rahul Verma",  email: "teacher2@alis.com", password: "password123", role: "teacher", subject: "AI & Machine Learning",     bio: "Ex-Google engineer, passionate about AI education." },
    { name: "Ms. Priya Nair",     email: "teacher3@alis.com", password: "password123", role: "teacher", subject: "Databases & Web Dev",        bio: "Full-stack developer turned educator, 8 years experience." },
    { name: "Mr. Arjun Mehta",    email: "teacher4@alis.com", password: "password123", role: "teacher", subject: "Java & Mathematics",         bio: "Software architect specializing in Java and discrete math." },
    { name: "Dr. Kavitha Reddy",  email: "teacher5@alis.com", password: "password123", role: "teacher", subject: "Physics, Chemistry & English", bio: "Interdisciplinary educator, science communication." },
  ];
  const teachers: any[] = [];
  for (const t of teacherDefs) teachers.push(await upsertUser(t));
  console.log("Teachers:", teachers.length);

  // PARENTS
  const parentDefs = [
    { name: "Ramesh Kumar",   email: "parent@alis.com",   password: "password123", role: "parent" },
    { name: "Sunita Patel",   email: "parent2@alis.com",  password: "password123", role: "parent" },
    { name: "Vijay Singh",    email: "parent3@alis.com",  password: "password123", role: "parent" },
    { name: "Meena Iyer",     email: "parent4@alis.com",  password: "password123", role: "parent" },
    { name: "Arun Gupta",     email: "parent5@alis.com",  password: "password123", role: "parent" },
    { name: "Deepa Krishnan", email: "parent6@alis.com",  password: "password123", role: "parent" },
    { name: "Suresh Joshi",   email: "parent7@alis.com",  password: "password123", role: "parent" },
    { name: "Lakshmi Rao",    email: "parent8@alis.com",  password: "password123", role: "parent" },
    { name: "Manoj Tiwari",   email: "parent9@alis.com",  password: "password123", role: "parent" },
    { name: "Geeta Bose",     email: "parent10@alis.com", password: "password123", role: "parent" },
  ];
  const parents: any[] = [];
  for (const p of parentDefs) parents.push(await upsertUser(p));
  console.log("Parents:", parents.length);

  // STUDENTS (20 students linked to parents)
  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate"];
  const studentDefs = [
    { name: "Aarav Sharma",    email: "student@alis.com",   password: "password123", pIdx: 0 },
    { name: "Isha Patel",      email: "student2@alis.com",  password: "password123", pIdx: 1 },
    { name: "Rohan Singh",     email: "student3@alis.com",  password: "password123", pIdx: 2 },
    { name: "Diya Iyer",       email: "student4@alis.com",  password: "password123", pIdx: 3 },
    { name: "Kabir Gupta",     email: "student5@alis.com",  password: "password123", pIdx: 4 },
    { name: "Ananya Krishnan", email: "student6@alis.com",  password: "password123", pIdx: 5 },
    { name: "Vihaan Joshi",    email: "student7@alis.com",  password: "password123", pIdx: 6 },
    { name: "Myra Rao",        email: "student8@alis.com",  password: "password123", pIdx: 7 },
    { name: "Aryan Tiwari",    email: "student9@alis.com",  password: "password123", pIdx: 8 },
    { name: "Saanvi Bose",     email: "student10@alis.com", password: "password123", pIdx: 9 },
    { name: "Dev Malhotra",    email: "student11@alis.com", password: "password123", pIdx: 0 },
    { name: "Riya Chawla",     email: "student12@alis.com", password: "password123", pIdx: 1 },
    { name: "Aditya Menon",    email: "student13@alis.com", password: "password123", pIdx: 2 },
    { name: "Kiara Nair",      email: "student14@alis.com", password: "password123", pIdx: 3 },
    { name: "Shaurya Pillai",  email: "student15@alis.com", password: "password123", pIdx: 4 },
    { name: "Navya Shetty",    email: "student16@alis.com", password: "password123", pIdx: 5 },
    { name: "Reyansh Kapoor",  email: "student17@alis.com", password: "password123", pIdx: 6 },
    { name: "Avni Verma",      email: "student18@alis.com", password: "password123", pIdx: 7 },
    { name: "Ayaan Bajaj",     email: "student19@alis.com", password: "password123", pIdx: 8 },
    { name: "Ishika Dubey",    email: "student20@alis.com", password: "password123", pIdx: 9 },
  ];
  const students: any[] = [];
  for (let i = 0; i < studentDefs.length; i++) {
    const sd = studentDefs[i];
    students.push(await upsertUser({ name: sd.name, email: sd.email, password: sd.password, role: "student", grade: grades[i % grades.length], parentId: parents[sd.pIdx]?.id ?? null }));
  }
  console.log("Students:", students.length);

  // COURSES (12 courses with chapters and lessons)
  const courseDefs = [
    {
      title: "Python Programming Fundamentals", description: "Start your coding journey with Python. Learn variables, loops, functions, and file handling through hands-on projects.", subject: "Python Programming", level: "beginner", tIdx: 0,
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop",
      chapters: [
        { title: "Getting Started", lessons: [
          { title: "Introduction to Python & Installation", yid: "rfscVS0vtbw", dur: 25, notes: "Python is one of the most popular languages. Install from python.org and set up VS Code." },
          { title: "Variables, Data Types & I/O", yid: "_uQrJ0TkZlc", dur: 30, notes: "Python has int, float, str, bool, list, dict, tuple, set. Use print() and input()." },
          { title: "Operators & Expressions", yid: "kqtD5dpn9C8", dur: 20, notes: "Arithmetic, comparison, logical, and assignment operators with examples." },
        ]},
        { title: "Control Flow", lessons: [
          { title: "if/elif/else Conditionals", yid: "Zp5MuPOtsSY", dur: 25, notes: "Use if, elif, else to control program flow based on conditions." },
          { title: "Loops: for and while", yid: "6iF8Xb7Z3wQ", dur: 30, notes: "for loops iterate over sequences; while runs while condition is true. break and continue." },
          { title: "Functions: Define & Call", yid: "9Os0o3wzS_I", dur: 35, notes: "Functions are reusable blocks. def keyword, parameters, return values, scope." },
          { title: "Lists, Tuples & Dictionaries", yid: "aBofHmOSvjw", dur: 40, notes: "Lists: mutable ordered. Tuples: immutable. Dicts: key-value pairs." },
        ]},
        { title: "Applied Python", lessons: [
          { title: "File Handling", yid: "Uh2ebFW8OYM", dur: 25, notes: "Open, read, write, close files. with statement for safe file handling." },
          { title: "Exception Handling", yid: "NIWwJbo-9_8", dur: 20, notes: "try, except, else, finally. Handle errors gracefully." },
          { title: "OOP Basics", yid: "JeznW_7DlB0", dur: 45, notes: "Classes, objects, __init__, methods, inheritance, encapsulation." },
          { title: "Mini Project: Grade Calculator", yid: "SqvVm3QiQVk", dur: 50, notes: "Build a complete grade calculator using functions, loops, and file handling." },
        ]},
      ],
    },
    {
      title: "Advanced Python Development", description: "Master decorators, generators, async programming, REST APIs, and production-ready Python applications.", subject: "Python Programming", level: "advanced", tIdx: 0,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop",
      chapters: [
        { title: "Advanced Features", lessons: [
          { title: "Decorators and Context Managers", yid: "FsAPt_9Bf3U", dur: 40, notes: "Decorators modify functions at definition time using @. Context managers use with statement." },
          { title: "Generators and Iterators", yid: "bD05uGo_sVI", dur: 35, notes: "Generators produce values lazily using yield. Memory efficient for large datasets." },
          { title: "Functional Programming: map/filter/lambda", yid: "cKlnR-CB3tk", dur: 30, notes: "map() transforms, filter() selects, lambda creates inline functions." },
        ]},
        { title: "APIs & Data", lessons: [
          { title: "REST APIs with requests library", yid: "tb8gHvYlCFs", dur: 45, notes: "HTTP GET/POST, JSON parsing, authentication, error handling." },
          { title: "Data Processing with pandas", yid: "vmEHCJofslg", dur: 50, notes: "DataFrames, filtering, grouping, merging, aggregation." },
          { title: "Async Programming with asyncio", yid: "t5Bo1Je9EmE", dur: 40, notes: "async/await, event loop, aiohttp for async HTTP requests." },
        ]},
        { title: "Production", lessons: [
          { title: "Testing with pytest", yid: "cHYq1MRoyI0", dur: 35, notes: "Unit tests, fixtures, parametrize, mocking." },
          { title: "Building a REST API with FastAPI", yid: "0sOvCWFmrtA", dur: 55, notes: "FastAPI: modern Python web framework with automatic OpenAPI docs." },
        ]},
      ],
    },
    {
      title: "Data Science with Python", description: "Complete data science workflow: collection, cleaning, exploration, visualization, and storytelling with Python.", subject: "Data Science", level: "intermediate", tIdx: 0,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
      chapters: [
        { title: "Foundations", lessons: [
          { title: "Introduction to Data Science", yid: "ua-CiDNNj30", dur: 30, notes: "Data Science lifecycle: collect → clean → analyze → visualize → communicate." },
          { title: "NumPy for Numerical Computing", yid: "QUT1VHiLmmI", dur: 40, notes: "Arrays, indexing, slicing, broadcasting, vectorized operations." },
          { title: "Data Analysis with pandas", yid: "vmEHCJofslg", dur: 45, notes: "Load CSV, explore with head/info/describe, clean, aggregate." },
        ]},
        { title: "Visualization", lessons: [
          { title: "Matplotlib Essentials", yid: "yZTBMMdPOww", dur: 35, notes: "Line, bar, scatter, histogram, pie charts. Titles, labels, legends." },
          { title: "Statistical Visuals with Seaborn", yid: "6GUZXDef2U0", dur: 30, notes: "Heatmaps, pair plots, violin plots, box plots." },
          { title: "Interactive Dashboards with Plotly", yid: "GGL6U0k8WYA", dur: 40, notes: "Plotly creates interactive web visuals. Dash for data apps." },
        ]},
        { title: "Stats & ML Intro", lessons: [
          { title: "Descriptive & Inferential Statistics", yid: "hjZJIVWHnPE", dur: 50, notes: "Mean, median, mode, variance, standard deviation, hypothesis testing." },
          { title: "Intro to Machine Learning with scikit-learn", yid: "GwIo3gDZCVQ", dur: 45, notes: "Train/test split, model evaluation: accuracy, precision, recall, F1." },
          { title: "Capstone: End-to-End Data Project", yid: "LHBE6uypklU", dur: 60, notes: "Full project: clean, explore, model, present findings." },
        ]},
      ],
    },
    {
      title: "Artificial Intelligence Fundamentals", description: "Explore AI: search algorithms, knowledge representation, machine learning, NLP, and computer vision.", subject: "Artificial Intelligence", level: "intermediate", tIdx: 1,
      thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=225&fit=crop",
      chapters: [
        { title: "What is AI?", lessons: [
          { title: "History & Overview of AI", yid: "JMUxmLyrhSk", dur: 35, notes: "AI timeline from Turing (1950) to deep learning (2012+). Narrow vs general AI." },
          { title: "Search Algorithms: BFS, DFS, A*", yid: "Gbdlg0dXWkI", dur: 40, notes: "Uninformed: BFS, DFS, UCS. Informed: A* with heuristics." },
          { title: "Knowledge Representation", yid: "7-m3_AGxnRI", dur: 30, notes: "Logic, ontologies, semantic networks, expert systems." },
        ]},
        { title: "ML Core", lessons: [
          { title: "Supervised Learning Algorithms", yid: "Cgxr773kzkY", dur: 50, notes: "Linear regression, logistic regression, decision trees, SVM, k-NN." },
          { title: "Unsupervised Learning: Clustering", yid: "EItlUEPCIzM", dur: 40, notes: "K-means, hierarchical clustering, DBSCAN, PCA." },
          { title: "Neural Networks: Perceptrons to Deep Learning", yid: "aircAruvnKk", dur: 55, notes: "Perceptron → MLP → deep networks. Activation, backprop, gradient descent." },
        ]},
        { title: "Advanced AI", lessons: [
          { title: "Natural Language Processing Basics", yid: "fOvTtapxa9c", dur: 45, notes: "Tokenization, stemming, TF-IDF, Word2Vec, BERT, sentiment analysis." },
          { title: "Computer Vision Introduction", yid: "OcycT1Jwsns", dur: 45, notes: "Image processing, CNNs for classification, YOLO for detection." },
          { title: "AI Ethics & Responsible AI", yid: "4SnMXlAJByY", dur: 30, notes: "Bias, fairness, transparency, accountability. EU AI Act." },
        ]},
      ],
    },
    {
      title: "Machine Learning with TensorFlow", description: "Build and train ML models using TensorFlow and Keras: regression, CNNs, RNNs, and production deployment.", subject: "Machine Learning", level: "advanced", tIdx: 1,
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop",
      chapters: [
        { title: "TF Foundations", lessons: [
          { title: "TensorFlow & Keras Overview", yid: "tPYj3fFJGjk", dur: 40, notes: "Google's ML framework. Tensors, operations, computational graph." },
          { title: "Building Your First Neural Network", yid: "wQ8BIBpya2k", dur: 45, notes: "Sequential model, Dense layers, compile, fit, evaluate." },
          { title: "Data Pipelines with tf.data", yid: "sGcrz-0pnFw", dur: 35, notes: "Efficient loading, preprocessing, batching, augmentation." },
        ]},
        { title: "CNNs", lessons: [
          { title: "CNN Architecture Deep Dive", yid: "HGwBXDKFk9I", dur: 50, notes: "Conv layers, pooling, flatten, FC layers. AlexNet, VGG, ResNet." },
          { title: "Image Classification Project", yid: "jztwpsIzEGc", dur: 60, notes: "CIFAR-10 CNN. Augmentation, dropout, batch normalization." },
          { title: "Transfer Learning", yid: "hnGHiGlcIIQ", dur: 45, notes: "Fine-tune MobileNetV2, InceptionV3. Feature extraction vs fine-tuning." },
        ]},
        { title: "Sequences & Deployment", lessons: [
          { title: "RNNs & LSTMs", yid: "WEV61GmmPrk", dur: 50, notes: "RNNs for sequences, LSTMs solve vanishing gradients. Text generation." },
          { title: "Model Deployment with TF Serving", yid: "4_GDLP9bCf0", dur: 40, notes: "SavedModel format, TF Serving, TFLite for mobile, TF.js for browser." },
        ]},
      ],
    },
    {
      title: "Database Management Systems", description: "Master relational databases: SQL, design, normalization, indexing, transactions with PostgreSQL and MySQL.", subject: "DBMS", level: "beginner", tIdx: 2,
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=225&fit=crop",
      chapters: [
        { title: "Fundamentals", lessons: [
          { title: "Introduction to Databases", yid: "HXV3zeQKqGY", dur: 30, notes: "Relational model, tables, rows, columns. PostgreSQL, MySQL, SQLite overview." },
          { title: "SQL Basics: SELECT, WHERE, ORDER BY", yid: "7S_tz1z_5bA", dur: 35, notes: "SELECT, WHERE, ORDER BY, LIMIT, AS aliases." },
          { title: "INSERT, UPDATE, DELETE", yid: "ztOBnbXiUmU", dur: 25, notes: "Modify data. Always use WHERE with UPDATE/DELETE!" },
        ]},
        { title: "Advanced SQL", lessons: [
          { title: "JOINs: INNER, LEFT, RIGHT, FULL", yid: "Yh4CrPHVBdE", dur: 40, notes: "INNER: matching rows. LEFT: all left. RIGHT: all right. FULL: all rows." },
          { title: "Aggregate Functions & GROUP BY", yid: "YufocuHbYZo", dur: 30, notes: "COUNT, SUM, AVG, MIN, MAX. GROUP BY, HAVING." },
          { title: "Subqueries & CTEs", yid: "fsG1XaZEa78", dur: 35, notes: "Subqueries in SELECT/FROM/WHERE. WITH clause for readable queries." },
          { title: "Indexes & Query Optimization", yid: "QpdhBUYk7Kk", dur: 40, notes: "B-tree vs hash indexes. EXPLAIN ANALYZE for query plans." },
        ]},
        { title: "Design", lessons: [
          { title: "ER Diagrams & Normalization", yid: "eYQwKi7P8OY", dur: 45, notes: "ER diagrams model data. 1NF, 2NF, 3NF eliminate redundancy." },
          { title: "Transactions, ACID & Concurrency", yid: "qw--VYLpxG4", dur: 40, notes: "ACID properties. Locks, deadlocks, isolation levels." },
          { title: "PostgreSQL in Practice", yid: "qw--VYLpxG4", dur: 35, notes: "psql CLI, pgAdmin GUI, backup with pg_dump." },
        ]},
      ],
    },
    {
      title: "Full Stack Web Development", description: "Build modern web apps: HTML, CSS, JavaScript, React, Node.js, and cloud deployment.", subject: "Web Development", level: "intermediate", tIdx: 2,
      thumbnail: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=400&h=225&fit=crop",
      chapters: [
        { title: "Frontend", lessons: [
          { title: "HTML5 & Semantic Markup", yid: "pQN-pnXPaVg", dur: 35, notes: "Semantic elements: header, nav, main, section, article, footer." },
          { title: "CSS3, Flexbox & Grid", yid: "1Rs2ND1ryYc", dur: 45, notes: "Flexbox for 1D layouts, Grid for 2D. Responsive design with media queries." },
          { title: "JavaScript ES6+", yid: "PkZNo7MFNFg", dur: 50, notes: "let/const, arrow functions, destructuring, promises, async/await." },
        ]},
        { title: "React & Backend", lessons: [
          { title: "React: Components & State", yid: "bMknfKXIFA8", dur: 55, notes: "Components, props, useState, JSX." },
          { title: "React Hooks & Context", yid: "f687hBjwFcM", dur: 45, notes: "useEffect, useContext, custom hooks." },
          { title: "Node.js & Express Backend", yid: "Oe421EPjeBE", dur: 50, notes: "Server-side JS. REST APIs with CRUD operations." },
          { title: "Full Stack: Frontend + Backend", yid: "mrHNSanmqQ4", dur: 60, notes: "Fetch/Axios, CORS, JWT authentication, deployment." },
        ]},
      ],
    },
    {
      title: "Java Programming Essentials", description: "Learn Java from scratch: OOP, collections, exception handling, and building real applications.", subject: "Java Programming", level: "beginner", tIdx: 3,
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop",
      chapters: [
        { title: "Java Basics", lessons: [
          { title: "Java Introduction & Setup", yid: "eIrMbAQSU34", dur: 25, notes: "JVM, JDK installation, IntelliJ IDEA. Hello World program." },
          { title: "Data Types, Variables & Operators", yid: "GoXwIVyFZuU", dur: 30, notes: "Primitive types: int, double, char, boolean. String class." },
          { title: "Control Flow: if, switch, loops", yid: "A1SDBA28VT0", dur: 35, notes: "if/else, switch-case, for, while, do-while, break, continue." },
          { title: "Methods and Arrays", yid: "9mtnp6GM_Wo", dur: 40, notes: "Methods with parameters and return types. 1D and 2D arrays." },
        ]},
        { title: "OOP in Java", lessons: [
          { title: "Classes, Objects & Constructors", yid: "IUqKuGNasdM", dur: 45, notes: "Classes as blueprints. Constructors initialize objects. this keyword." },
          { title: "Inheritance & Polymorphism", yid: "Px_73UKQaBw", dur: 50, notes: "extends keyword, method overriding, abstract classes, interfaces." },
          { title: "Collections Framework", yid: "GdAon80-0KA", dur: 40, notes: "ArrayList, LinkedList, HashMap, HashSet. Generics and iterators." },
          { title: "Exception Handling & File I/O", yid: "1XAfapkBvjM", dur: 35, notes: "try-catch-finally, checked vs unchecked, file reading/writing." },
        ]},
      ],
    },
    {
      title: "Mathematics for Data Science", description: "Linear algebra, calculus, probability, and statistics — the mathematical foundation for ML and AI.", subject: "Mathematics", level: "intermediate", tIdx: 3,
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
      chapters: [
        { title: "Linear Algebra", lessons: [
          { title: "Vectors and Matrices", yid: "kjBOesZCoqc", dur: 40, notes: "Vectors, matrices, dot product, transpose, inverse with NumPy." },
          { title: "Eigenvalues & Eigenvectors", yid: "PFDu9oVAE-g", dur: 45, notes: "Eigendecomposition, PCA applications, PageRank." },
          { title: "SVD & PCA", yid: "P5mlg91as1c", dur: 40, notes: "Singular Value Decomposition, Principal Component Analysis." },
        ]},
        { title: "Calculus & Probability", lessons: [
          { title: "Derivatives & Gradient Descent", yid: "IHZwWFHWa-w", dur: 50, notes: "Derivatives, partial derivatives, gradient descent for ML." },
          { title: "Probability Theory", yid: "uzkc-qNVoOk", dur: 45, notes: "Sample spaces, conditional probability, Bayes' theorem." },
          { title: "Statistics & Hypothesis Testing", yid: "0oc49DyA3hU", dur: 40, notes: "p-values, confidence intervals, t-test, chi-square, ANOVA." },
        ]},
      ],
    },
    {
      title: "Physics for Engineers", description: "Essential physics: mechanics, thermodynamics, electricity, and magnetism with practical engineering applications.", subject: "Physics", level: "intermediate", tIdx: 4,
      thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=225&fit=crop",
      chapters: [
        { title: "Mechanics", lessons: [
          { title: "Newton's Laws of Motion", yid: "ZM8ECpBuQYE", dur: 40, notes: "1st: inertia, 2nd: F=ma, 3rd: action-reaction. Free body diagrams." },
          { title: "Work, Energy & Power", yid: "w4QFJb9a8vo", dur: 35, notes: "W=Fd·cos(θ), KE=½mv², PE=mgh, conservation of energy." },
          { title: "Rotational Motion & Torque", yid: "r_KDoe7TLUY", dur: 40, notes: "Angular quantities, torque, moment of inertia, angular momentum." },
        ]},
        { title: "Electricity & Magnetism", lessons: [
          { title: "Electric Fields & Coulomb's Law", yid: "mw0cSbkV3kM", dur: 35, notes: "Coulomb's law, electric field lines, potential." },
          { title: "Circuits: Ohm's Law, Series & Parallel", yid: "F_vLWkkDxMQ", dur: 40, notes: "V=IR, series and parallel circuits, Kirchhoff's laws." },
          { title: "Electromagnetic Induction", yid: "s94suB5uLWw", dur: 35, notes: "Faraday's law, Lenz's law, motors and generators." },
        ]},
      ],
    },
    {
      title: "Chemistry Fundamentals", description: "Explore matter: atomic structure, periodic table, chemical bonding, reactions, and stoichiometry.", subject: "Chemistry", level: "beginner", tIdx: 4,
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543559879898?w=400&h=225&fit=crop",
      chapters: [
        { title: "Atomic Structure", lessons: [
          { title: "Atoms, Electrons & Atomic Models", yid: "bka20Q9TN6M", dur: 35, notes: "Dalton → Thomson → Rutherford → Bohr → quantum. Atomic number." },
          { title: "The Periodic Table", yid: "0RRVV4Diomg", dur: 30, notes: "Periods, groups, metals/nonmetals/metalloids, periodic trends." },
          { title: "Chemical Bonding: Ionic & Covalent", yid: "QqjcCvzWwww", dur: 40, notes: "Ionic: electron transfer. Covalent: electron sharing. Polar molecules." },
        ]},
        { title: "Reactions", lessons: [
          { title: "Types of Chemical Reactions", yid: "N3IGKWM_FVM", dur: 35, notes: "Synthesis, decomposition, single/double displacement, combustion." },
          { title: "Stoichiometry & Mole Concept", yid: "UNQhuFL6CWg", dur: 40, notes: "Avogadro's number, molar mass, limiting reagents, percent yield." },
          { title: "Acids, Bases & pH", yid: "MwlJH2a2pAI", dur: 35, notes: "pH scale, strong vs weak acids/bases, neutralization, titration." },
        ]},
      ],
    },
    {
      title: "English Communication Skills", description: "Professional English: speaking, writing, presentation skills, and business English for career success.", subject: "English Communication", level: "beginner", tIdx: 4,
      thumbnail: "https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?w=400&h=225&fit=crop",
      chapters: [
        { title: "Speaking & Listening", lessons: [
          { title: "Pronunciation & Fluency", yid: "pxEIGSvBrB4", dur: 30, notes: "English phonemes, word stress, intonation. Common mistakes to fix." },
          { title: "Listening Skills & Comprehension", yid: "V-H5tMRkxSo", dur: 25, notes: "Active listening, main idea vs details, note-taking strategies." },
          { title: "Conversation & Small Talk", yid: "Dd9bHoRvSiA", dur: 30, notes: "Starting, maintaining, closing conversations. Expressing opinions." },
        ]},
        { title: "Writing & Presentations", lessons: [
          { title: "Professional Email Writing", yid: "qrgZRoEjpP8", dur: 25, notes: "Email structure: subject, greeting, body, closing. Formal vs informal." },
          { title: "Report & Essay Writing", yid: "HbHq6KQDgH4", dur: 35, notes: "Intro → body → conclusion. Topic sentences, evidence, transitions." },
          { title: "Presentation & Public Speaking", yid: "KnM1gDFQRGo", dur: 40, notes: "Structure presentations, slide design, handling nerves, audience engagement." },
        ]},
      ],
    },
  ];

  console.log("Seeding courses...");
  const courseIds: number[] = [];
  for (const cd of courseDefs) {
    const existing = await db.select().from(coursesTable).where(eq(coursesTable.title, cd.title));
    if (existing.length > 0) {
      courseIds.push(existing[0].id);
      continue;
    }
    const [course] = await db.insert(coursesTable).values({
      title: cd.title, description: cd.description, subject: cd.subject,
      level: cd.level, teacherId: teachers[cd.tIdx].id, thumbnail: cd.thumbnail,
    }).returning();
    courseIds.push(course.id);

    for (let ci = 0; ci < cd.chapters.length; ci++) {
      const chap = cd.chapters[ci];
      const [chapter] = await db.insert(chaptersTable).values({ courseId: course.id, title: chap.title, order: ci }).returning();
      for (let li = 0; li < chap.lessons.length; li++) {
        const l = chap.lessons[li];
        await db.insert(lessonsTable).values({
          courseId: course.id, chapterId: chapter.id, title: l.title, type: "video",
          youtubeId: l.yid, youtubeUrl: `https://www.youtube.com/watch?v=${l.yid}`,
          notes: l.notes, order: li, duration: l.dur,
        });
      }
    }
  }
  console.log("Courses ready:", courseIds.length);

  // ENROLLMENTS (3-6 courses per student)
  const enrollSet: Set<string> = new Set();
  const existing_enr = await db.select().from(enrollmentsTable);
  for (const e of existing_enr) enrollSet.add(`${e.studentId}-${e.courseId}`);
  const studentCourseMap = new Map<number, number[]>();
  for (let si = 0; si < students.length; si++) {
    const sid = students[si].id;
    const numC = 3 + (si % 4);
    const myCourses: number[] = [];
    for (let j = 0; j < numC; j++) {
      const cid = courseIds[(si * 2 + j) % courseIds.length];
      if (!enrollSet.has(`${sid}-${cid}`)) {
        await db.insert(enrollmentsTable).values({ studentId: sid, courseId: cid });
        enrollSet.add(`${sid}-${cid}`);
      }
      myCourses.push(cid);
    }
    studentCourseMap.set(sid, myCourses);
  }

  // LESSON PROGRESS
  const progSet: Set<string> = new Set();
  const existing_prog = await db.select().from(lessonProgressTable);
  for (const p of existing_prog) progSet.add(`${p.studentId}-${p.lessonId}`);
  const allLessons = await db.select().from(lessonsTable);
  for (let si = 0; si < students.length; si++) {
    const sid = students[si].id;
    const myCourses = studentCourseMap.get(sid) ?? [];
    const myLessons = allLessons.filter(l => myCourses.includes(l.courseId));
    const frac = 0.25 + (si % 8) * 0.09;
    const numDone = Math.floor(myLessons.length * Math.min(frac, 0.95));
    for (let li = 0; li < Math.min(numDone, myLessons.length); li++) {
      const key = `${sid}-${myLessons[li].id}`;
      if (!progSet.has(key)) {
        await db.insert(lessonProgressTable).values({ studentId: sid, lessonId: myLessons[li].id, courseId: myLessons[li].courseId, timeSpent: 15 + Math.floor(Math.random() * 30) });
        progSet.add(key);
      }
    }
  }

  // TESTS (20 tests)
  const testDefs = [
    { title: "Python Basics Quiz", subject: "Python Programming", tIdx: 0, dur: 20, questions: [
      { text: "Which keyword defines a function in Python?", opts: ["function","def","func","define"], correct: 1, exp: "'def' defines functions in Python." },
      { text: "What type is 3.14 in Python?", opts: ["int","str","float","double"], correct: 2, exp: "3.14 is a float." },
      { text: "Which data type is mutable?", opts: ["tuple","string","list","int"], correct: 2, exp: "Lists are mutable; tuples and strings are not." },
      { text: "What does len([1,2,3,4]) return?", opts: ["3","4","5","Error"], correct: 1, exp: "4 elements → returns 4." },
      { text: "Single-line comments in Python use:", opts: ["//","#","/*","--"], correct: 1, exp: "# starts a comment." },
    ]},
    { title: "OOP & Data Structures Test", subject: "Python Programming", tIdx: 0, dur: 30, questions: [
      { text: "Which method initializes a new Python object?", opts: ["__init__","__new__","__create__","__start__"], correct: 0, exp: "__init__ is the constructor." },
      { text: "Time complexity of appending to a Python list:", opts: ["O(n)","O(log n)","O(1)","O(n²)"], correct: 2, exp: "Amortized O(1) for list append." },
      { text: "Which concept allows different classes to share a method?", opts: ["encapsulation","polymorphism","abstraction","typing"], correct: 1, exp: "Polymorphism allows different types to use the same interface." },
      { text: "dict.get('key','default') when key missing returns:", opts: ["None","KeyError","'default'","False"], correct: 2, exp: "get() returns the default value." },
      { text: "LIFO data structure:", opts: ["Queue","Stack","Heap","Graph"], correct: 1, exp: "Stack uses Last-In-First-Out." },
    ]},
    { title: "Machine Learning Fundamentals", subject: "Machine Learning", tIdx: 1, dur: 25, questions: [
      { text: "Which algorithm is for classification?", opts: ["Linear Regression","K-Means","Logistic Regression","PCA"], correct: 2, exp: "Logistic Regression classifies." },
      { text: "Overfitting means:", opts: ["Model too simple","Model memorizes training data","Low training accuracy","Undertrained"], correct: 1, exp: "Overfitting: learns noise, fails to generalize." },
      { text: "Metric for regression problems:", opts: ["Accuracy","F1 Score","RMSE","AUC-ROC"], correct: 2, exp: "RMSE measures regression performance." },
      { text: "Cross-validation purpose:", opts: ["Speed training","Estimate generalization","Reduce dataset","Increase accuracy"], correct: 1, exp: "CV estimates how well model generalizes." },
      { text: "K-Means is:", opts: ["Supervised","Reinforcement","Unsupervised","Semi-supervised"], correct: 2, exp: "K-Means clusters without labels." },
    ]},
    { title: "Artificial Intelligence Concepts", subject: "Artificial Intelligence", tIdx: 1, dur: 30, questions: [
      { text: "Turing Test evaluates:", opts: ["Computer speed","Machine intelligence","DB efficiency","Security"], correct: 1, exp: "Turing proposed the test to assess machine intelligence." },
      { text: "A* search uses:", opts: ["Random walk","Greedy only","Heuristic + cost","Depth-first"], correct: 2, exp: "A* uses f(n) = g(n) + h(n)." },
      { text: "NOT a type of machine learning:", opts: ["Supervised","Unsupervised","Reinforcement","Deterministic"], correct: 3, exp: "Three ML types: supervised, unsupervised, reinforcement." },
      { text: "Activation function purpose:", opts: ["Initialize weights","Non-linearity","Calculate loss","Load data"], correct: 1, exp: "Non-linearity enables learning complex patterns." },
      { text: "NLP stands for:", opts: ["Neural Layer Processing","Natural Language Processing","Numeric Logic","Network Protocol"], correct: 1, exp: "Natural Language Processing." },
    ]},
    { title: "SQL Fundamentals Quiz", subject: "DBMS", tIdx: 2, dur: 20, questions: [
      { text: "SQL clause to filter records:", opts: ["ORDER BY","GROUP BY","WHERE","HAVING"], correct: 2, exp: "WHERE filters individual rows." },
      { text: "PRIMARY KEY ensures:", opts: ["No duplicates","Data encrypted","Faster searches","Can be NULL"], correct: 0, exp: "PRIMARY KEY: unique and non-null." },
      { text: "INNER JOIN returns:", opts: ["All left rows","All right rows","Only matching rows","All rows"], correct: 2, exp: "INNER JOIN: only matching rows from both tables." },
      { text: "COUNT(column) counts:", opts: ["All rows","NULL values","Non-NULL values","Distinct values"], correct: 2, exp: "COUNT(column) counts non-NULL values." },
      { text: "ACID stands for:", opts: ["Atomicity,Consistency,Isolation,Durability","Access,Control,Index,Data","Aggregate,Cluster,Index,Delete","None"], correct: 0, exp: "ACID = Atomicity, Consistency, Isolation, Durability." },
    ]},
    { title: "Web Development Fundamentals", subject: "Web Development", tIdx: 2, dur: 25, questions: [
      { text: "CSS stands for:", opts: ["Computer Style Sheets","Cascading Style Sheets","Creative Style System","Colorful Sheets"], correct: 1, exp: "Cascading Style Sheets." },
      { text: "HTML tag for hyperlinks:", opts: ["<link>","<url>","<a>","<href>"], correct: 2, exp: "<a href='...'>text</a> creates links." },
      { text: "React 'prop' is:", opts: ["Data passed to component","CSS property","DB field","JS loop"], correct: 0, exp: "Props pass data from parent to child." },
      { text: "HTTP method to create a resource:", opts: ["GET","PUT","DELETE","POST"], correct: 3, exp: "POST creates new resources." },
      { text: "localStorage purpose:", opts: ["Store on server","Persist in browser","Handle HTTP","Compress images"], correct: 1, exp: "localStorage persists data in the browser." },
    ]},
    { title: "Java Programming Quiz", subject: "Java Programming", tIdx: 3, dur: 25, questions: [
      { text: "Keyword preventing method overriding:", opts: ["static","private","final","abstract"], correct: 2, exp: "final methods cannot be overridden." },
      { text: "Default value of int in Java:", opts: ["null","0","undefined","-1"], correct: 1, exp: "Default int instance variable = 0." },
      { text: "Interface for for-each loop:", opts: ["Comparable","Iterable","Serializable","Cloneable"], correct: 1, exp: "Iterable provides iterator() for for-each." },
      { text: "JVM stands for:", opts: ["Java Virtual Machine","Java Variable Method","Just Virtual Memory","Java Version Manager"], correct: 0, exp: "JVM executes Java bytecode." },
      { text: "Collection allowing duplicates:", opts: ["HashSet","TreeSet","ArrayList","HashMap keys"], correct: 2, exp: "ArrayList allows duplicates; Sets do not." },
    ]},
    { title: "Linear Algebra for ML", subject: "Mathematics", tIdx: 3, dur: 30, questions: [
      { text: "Dot product of perpendicular vectors:", opts: ["1","0","-1","undefined"], correct: 1, exp: "Orthogonal vectors: dot product = 0." },
      { text: "Matrix transpose swaps:", opts: ["Sign of elements","Values and positions","Rows and columns","Only diagonal"], correct: 2, exp: "Transpose: A^T[i][j] = A[j][i]." },
      { text: "PCA is used for:", opts: ["Classification","Dimensionality reduction","Clustering","Regression"], correct: 1, exp: "PCA reduces data dimensionality." },
      { text: "Gradient descent minimizes:", opts: ["Accuracy","Loss function","Learning rate","Epoch count"], correct: 1, exp: "Gradient descent reduces the loss." },
      { text: "Identity matrix has:", opts: ["All zeros","All ones","1s on diagonal","Random values"], correct: 2, exp: "Identity: 1s on diagonal, 0s elsewhere." },
    ]},
    { title: "Physics: Mechanics Test", subject: "Physics", tIdx: 4, dur: 30, questions: [
      { text: "Newton's second law: F = ?", opts: ["mv","ma","m/a","m²a"], correct: 1, exp: "F = ma." },
      { text: "Elastic collisions conserve:", opts: ["KE only","Momentum only","Both KE and momentum","Neither"], correct: 2, exp: "Elastic: KE and momentum both conserved." },
      { text: "SI unit of energy:", opts: ["Newton","Watt","Joule","Pascal"], correct: 2, exp: "Joule (J) is the SI unit of energy." },
      { text: "Horizontal acceleration of projectile (no air resistance):", opts: ["9.8 m/s²","0 m/s²","-9.8 m/s²","Depends on speed"], correct: 1, exp: "No horizontal acceleration without air resistance." },
      { text: "Power = ?", opts: ["Force × distance","Work / time","Mass × velocity","Force × velocity²"], correct: 1, exp: "Power = Work/time." },
    ]},
    { title: "Chemistry Basics Test", subject: "Chemistry", tIdx: 4, dur: 20, questions: [
      { text: "Atomic number of Carbon:", opts: ["12","6","8","4"], correct: 1, exp: "Carbon: atomic number 6 (6 protons)." },
      { text: "Ionic bond forms between:", opts: ["Two nonmetals","Two metals","Metal and nonmetal","Noble gases"], correct: 2, exp: "Ionic: electron transfer between metal and nonmetal." },
      { text: "pH of neutral solution:", opts: ["0","14","7","1"], correct: 2, exp: "pH 7 is neutral." },
      { text: "Avogadro's number:", opts: ["6.022×10²³","3.14×10⁸","9.8×10⁻³","1.6×10⁻¹⁹"], correct: 0, exp: "One mole = 6.022 × 10²³ particles." },
      { text: "A + B → AB is:", opts: ["Decomposition","Synthesis","Displacement","Combustion"], correct: 1, exp: "Synthesis: two elements combine." },
    ]},
    { title: "English Grammar & Communication", subject: "English Communication", tIdx: 4, dur: 20, questions: [
      { text: "Tense for completed action with present relevance:", opts: ["Simple past","Present perfect","Past continuous","Past perfect"], correct: 1, exp: "Present perfect connects past to present." },
      { text: "Active voice puts _____ first:", opts: ["object","verb","subject","adjective"], correct: 2, exp: "Active: Subject + Verb + Object." },
      { text: "Which word is a conjunction?", opts: ["quickly","although","beautiful","run"], correct: 1, exp: "Although is a subordinating conjunction." },
      { text: "Best professional email subject line:", opts: ["Hi","URGENT!!!!","Meeting Request: Q3 Review","Read this now"], correct: 2, exp: "Good subject lines are specific and informative." },
      { text: "In formal presentations, you should:", opts: ["Read from slides","Jargon only","Engage with questions","Face the screen"], correct: 2, exp: "Audience engagement maintains attention." },
    ]},
    { title: "Data Science Mid-Term", subject: "Data Science", tIdx: 0, dur: 35, questions: [
      { text: "df.describe() shows:", opts: ["First 5 rows","Data types","Summary statistics","Column names"], correct: 2, exp: "describe(): count, mean, std, min, max, quartiles." },
      { text: "Python library for data visualization:", opts: ["NumPy","pandas","Matplotlib","scikit-learn"], correct: 2, exp: "Matplotlib creates visualizations." },
      { text: "dropna() removes:", opts: ["Duplicate rows","Rows with NaN","Fills NaN","Drops columns"], correct: 1, exp: "dropna() removes rows with NaN values." },
      { text: "Scatter plot shows:", opts: ["Distribution","Relationship between variables","Time trends","Proportions"], correct: 1, exp: "Scatter: correlation between two variables." },
      { text: "Feature engineering:", opts: ["Build NNs","Create/transform input features","Tune hyperparameters","Evaluate accuracy"], correct: 1, exp: "Creating features to improve model performance." },
    ]},
    { title: "TensorFlow Deep Learning Quiz", subject: "Machine Learning", tIdx: 1, dur: 30, questions: [
      { text: "Compile a Keras model with:", opts: ["model.train()","model.build()","model.compile()","model.fit()"], correct: 2, exp: "model.compile() sets optimizer, loss, metrics." },
      { text: "Dropout layer:", opts: ["Adds neurons","Randomly disables neurons","Normalizes inputs","Increases LR"], correct: 1, exp: "Dropout prevents overfitting." },
      { text: "Transfer learning:", opts: ["Training from scratch","Using pre-trained weights","Reducing model size","Adding data"], correct: 1, exp: "Reuses weights learned on one task." },
      { text: "An 'epoch' is:", opts: ["One sample","One batch","One full pass through data","One layer"], correct: 2, exp: "Epoch = one complete cycle through the dataset." },
      { text: "Batch normalization:", opts: ["Reduces model size","Normalizes layer inputs","Increases dropout","Adds layers"], correct: 1, exp: "Stabilizes and accelerates training." },
    ]},
    { title: "Advanced SQL & DB Design", subject: "DBMS", tIdx: 2, dur: 35, questions: [
      { text: "Normal form eliminating transitive dependencies:", opts: ["1NF","2NF","3NF","BCNF"], correct: 2, exp: "3NF eliminates transitive dependencies." },
      { text: "SQL view is:", opts: ["Stored procedure","Virtual table from a query","Backup copy","An index"], correct: 1, exp: "View: named query behaving as virtual table." },
      { text: "Best index for equality lookups:", opts: ["B-tree","Hash","Bitmap","Full-text"], correct: 1, exp: "Hash indexes optimal for exact equality." },
      { text: "ROLLBACK:", opts: ["Commits transaction","Undoes changes since COMMIT","Deletes DB","Resets sequences"], correct: 1, exp: "ROLLBACK undoes current transaction changes." },
      { text: "FOREIGN KEY enforces:", opts: ["Uniqueness","Referential integrity","Type constraints","NOT NULL"], correct: 1, exp: "FK ensures referenced rows exist." },
    ]},
    { title: "React & JavaScript Test", subject: "Web Development", tIdx: 2, dur: 25, questions: [
      { text: "Hook for state in functional components:", opts: ["useEffect","useContext","useState","useRef"], correct: 2, exp: "useState manages local component state." },
      { text: "Virtual DOM in React:", opts: ["Actual HTML DOM","JS representation of DOM","CSS framework","Database"], correct: 1, exp: "Virtual DOM enables efficient updates." },
      { text: "Arrow functions vs regular:", opts: ["Can't be async","Have own 'this'","Bind 'this' lexically","Can't return"], correct: 2, exp: "Arrow functions capture 'this' from context." },
      { text: "useEffect purpose:", opts: ["Global state","Side effects & lifecycle","Create context","Memoize"], correct: 1, exp: "useEffect: data fetching, subscriptions, DOM." },
      { text: "REST GET requests should be:", opts: ["Idempotent and safe","Always authenticated","Always paginated","POST-based"], correct: 0, exp: "GET is idempotent and safe (no side effects)." },
    ]},
    { title: "Java OOP & Collections", subject: "Java Programming", tIdx: 3, dur: 30, questions: [
      { text: "Java collection maintaining insertion order:", opts: ["HashSet","HashMap","LinkedList","TreeSet"], correct: 2, exp: "LinkedList maintains insertion order." },
      { text: "Method overloading:", opts: ["Same method in subclass","Same name, different params","Hiding parent methods","Abstract impl"], correct: 1, exp: "Overloading: same name, different parameter lists." },
      { text: "Checked exceptions must be:", opts: ["Caught or declared","Only caught","Only thrown","Ignored"], correct: 0, exp: "Checked exceptions: catch or declare with throws." },
      { text: "Keyword to create instance:", opts: ["create","new","instance","make"], correct: 1, exp: "'new' allocates memory and calls constructor." },
      { text: "Java Generics provide:", opts: ["Runtime type checking","Compile-time type safety","Auto boxing","Dynamic dispatch"], correct: 1, exp: "Generics enforce type safety at compile time." },
    ]},
    { title: "Statistics & Probability", subject: "Mathematics", tIdx: 3, dur: 35, questions: [
      { text: "Bayes' theorem relates:", opts: ["Mean and variance","Conditional probabilities","Sample and population","Correlation"], correct: 1, exp: "P(A|B) = P(B|A)·P(A) / P(B)." },
      { text: "p-value < 0.05 means:", opts: ["Accept null","Strong practical significance","Statistically significant","No difference"], correct: 2, exp: "Reject null hypothesis at 5% significance." },
      { text: "Standard deviation measures:", opts: ["Central tendency","Spread of data","Sample size","Correlation"], correct: 1, exp: "Spread around the mean." },
      { text: "Normal distribution is:", opts: ["Always right-skewed","Symmetric bell-shaped","Bimodal","Uniform"], correct: 1, exp: "Normal: symmetric, bell-shaped." },
      { text: "r = 0 means:", opts: ["Perfect correlation","Negative correlation","No linear relationship","Strong correlation"], correct: 2, exp: "r = 0: no linear correlation." },
    ]},
    { title: "Electricity & Magnetism Quiz", subject: "Physics", tIdx: 4, dur: 25, questions: [
      { text: "Ohm's Law:", opts: ["V=IR","V=I/R","V=R/I","I=VR"], correct: 0, exp: "V = IR: Voltage = Current × Resistance." },
      { text: "Parallel circuit voltage:", opts: ["Different per branch","Zero","Same across branches","Cumulative"], correct: 2, exp: "Parallel: same voltage across each branch." },
      { text: "Unit of electrical resistance:", opts: ["Volt","Ampere","Watt","Ohm"], correct: 3, exp: "Resistance in Ohms (Ω)." },
      { text: "Faraday's law describes:", opts: ["Ohm's for magnets","Electromagnetic induction","Coulomb extension","Kirchhoff voltage"], correct: 1, exp: "Changing magnetic flux induces EMF." },
      { text: "Transformer changes:", opts: ["AC frequency","Voltage and current of AC","DC to AC","Resistance"], correct: 1, exp: "Transformers step voltage up or down." },
    ]},
    { title: "Organic Chemistry Basics", subject: "Chemistry", tIdx: 4, dur: 25, questions: [
      { text: "Organic chemistry studies compounds with:", opts: ["Oxygen","Carbon","Nitrogen","Hydrogen only"], correct: 1, exp: "Organic chemistry = carbon-based compounds." },
      { text: "Alkane general formula:", opts: ["CₙH₂ₙ","CₙH₂ₙ₊₂","CₙH₂ₙ₋₂","CₙHₙ"], correct: 1, exp: "Alkanes: CₙH₂ₙ₊₂." },
      { text: "Functional group in alcohols:", opts: ["COOH","CHO","OH","NH₂"], correct: 2, exp: "Alcohols contain -OH (hydroxyl group)." },
      { text: "Isomers have:", opts: ["Same formula same structure","Same formula different structure","Different formula same properties","Same mass"], correct: 1, exp: "Isomers: same formula, different structure." },
      { text: "Adds atoms across a double bond:", opts: ["Substitution","Elimination","Addition","Rearrangement"], correct: 2, exp: "Addition reaction: atoms add across π bond." },
    ]},
    { title: "Advanced English Writing", subject: "English Communication", tIdx: 4, dur: 20, questions: [
      { text: "Good thesis statement is:", opts: ["Vague and broad","Specific and arguable","A question","In conclusion"], correct: 1, exp: "Thesis: specific, arguable claim." },
      { text: "Transition showing contrast:", opts: ["Furthermore","In addition","However","Therefore"], correct: 2, exp: "However introduces contrasting idea." },
      { text: "APA citation used in:", opts: ["Literature","Social sciences","Law","History"], correct: 1, exp: "APA is standard in social sciences." },
      { text: "Passive voice:", opts: ["More dynamic","More concise","Less direct about actor","Informal"], correct: 2, exp: "Passive hides the actor." },
      { text: "Eye contact in presentations:", opts: ["Distracts audience","Builds trust and engagement","Should be avoided","For advanced speakers only"], correct: 1, exp: "Eye contact builds rapport and engagement." },
    ]},
  ];

  console.log("Seeding tests...");
  const testIds: number[] = [];
  for (const td of testDefs) {
    const existing = await db.select().from(testsTable).where(eq(testsTable.title, td.title));
    if (existing.length > 0) { testIds.push(existing[0].id); continue; }
    const [test] = await db.insert(testsTable).values({ title: td.title, subject: td.subject, teacherId: teachers[td.tIdx].id, duration: td.dur }).returning();
    testIds.push(test.id);
    for (let qi = 0; qi < td.questions.length; qi++) {
      const q = td.questions[qi];
      await db.insert(questionsTable).values({ testId: test.id, text: q.text, options: q.opts, correctOption: q.correct, explanation: q.exp, order: qi });
    }
  }
  console.log("Tests ready:", testIds.length);

  // TEST RESULTS
  const scores = [65,72,80,55,90,78,68,85,92,60,74,88,70,95,62,76,83,58,91,67];
  for (let si = 0; si < students.length; si++) {
    const sid = students[si].id;
    const numTests = 2 + (si % 3);
    const existRes = await db.select().from(testResultsTable).where(eq(testResultsTable.studentId, sid));
    if (existRes.length > 0) continue;
    for (let ti = 0; ti < numTests; ti++) {
      const tId = testIds[(si + ti) % testIds.length];
      const score = scores[(si * 3 + ti) % scores.length];
      await db.insert(testResultsTable).values({ testId: tId, studentId: sid, score, totalQuestions: 5, correctAnswers: Math.round(score / 20), answers: "[]" });
    }
  }

  // LIVE CLASSES (10)
  console.log("Seeding live classes...");
  const liveClassDefs = [
    { title: "Python Q&A: OOP Deep Dive",           subject: "Python Programming",   tIdx: 0, days: 2,   dur: 90,  status: "upcoming" },
    { title: "Data Science Office Hours",            subject: "Data Science",         tIdx: 0, days: 5,   dur: 60,  status: "upcoming" },
    { title: "AI Workshop: Build a Chatbot",         subject: "Artificial Intelligence", tIdx: 1, days: 3, dur: 120, status: "upcoming" },
    { title: "ML Live: Neural Networks Demo",         subject: "Machine Learning",     tIdx: 1, days: 7,   dur: 90,  status: "upcoming" },
    { title: "SQL Workshop: Query Optimization",      subject: "DBMS",                 tIdx: 2, days: 4,   dur: 60,  status: "upcoming" },
    { title: "React Masterclass: Hooks & State",     subject: "Web Development",      tIdx: 2, days: 6,   dur: 90,  status: "upcoming" },
    { title: "Java Session: Collections & Streams",  subject: "Java Programming",     tIdx: 3, days: 8,   dur: 75,  status: "upcoming" },
    { title: "Physics: Thermodynamics Review",       subject: "Physics",              tIdx: 4, days: 9,   dur: 60,  status: "upcoming" },
    { title: "Python Intro — Recorded",              subject: "Python Programming",   tIdx: 0, days: -7,  dur: 90,  status: "completed" },
    { title: "Data Visualization Recorded Class",    subject: "Data Science",         tIdx: 0, days: -14, dur: 60,  status: "completed" },
  ];
  for (const lcd of liveClassDefs) {
    const existing = await db.select().from(liveClassesTable).where(eq(liveClassesTable.title, lcd.title));
    if (existing.length === 0) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + lcd.days);
      scheduledAt.setHours(10, 0, 0, 0);
      await db.insert(liveClassesTable).values({
        title: lcd.title, subject: lcd.subject,
        description: `Interactive ${lcd.subject} session with live Q&A and coding demos.`,
        teacherId: teachers[lcd.tIdx].id, scheduledAt, duration: lcd.dur,
        meetingLink: "https://meet.google.com/alis-demo-class", status: lcd.status,
      });
    }
  }

  // DISCUSSIONS (50) + REPLIES (100)
  console.log("Seeding discussions...");
  const discDefs = [
    { title: "How to understand list comprehensions in Python?", body: "I'm struggling with Python list comprehensions. Can someone explain the syntax with examples?", subject: "Python Programming", aIdx: 0, likes: 12 },
    { title: "Difference between supervised and unsupervised learning?", body: "I keep confusing the two. Can someone explain with real-world examples?", subject: "Artificial Intelligence", aIdx: 1, likes: 18 },
    { title: "Best resources for learning SQL?", body: "What are the best free resources to practice SQL? I know basics but want to improve.", subject: "DBMS", aIdx: 2, likes: 9 },
    { title: "CSS Flexbox vs Grid — when to use which?", body: "I always mix these up. What's the practical difference and when should I use each?", subject: "Web Development", aIdx: 3, likes: 22 },
    { title: "Understanding backpropagation in neural networks", body: "The math behind backpropagation is confusing. Can someone explain step by step?", subject: "Machine Learning", aIdx: 4, likes: 31 },
    { title: "How to normalize data before training ML models?", body: "Min-Max scaling or Z-score normalization? What's the difference?", subject: "Data Science", aIdx: 5, likes: 15 },
    { title: "Java vs Python — which should I learn first?", body: "I'm new to programming. Should I start with Java or Python?", subject: "Java Programming", aIdx: 6, likes: 8 },
    { title: "Why does my React component re-render unnecessarily?", body: "My component re-renders every time even when data doesn't change. How do I fix this?", subject: "Web Development", aIdx: 7, likes: 19 },
    { title: "How to choose the right ML algorithm?", body: "With so many algorithms, how do I decide which one to use for a given problem?", subject: "Machine Learning", aIdx: 8, likes: 25 },
    { title: "Acid-base titration — what is the equivalence point?", body: "I understand basic titration but not what the equivalence point means physically.", subject: "Chemistry", aIdx: 9, likes: 6 },
    { title: "How to improve English fluency for interviews?", body: "I want to improve my English speaking skills for job interviews. Any tips?", subject: "English Communication", aIdx: 10, likes: 14 },
    { title: "What is the difference between momentum and impulse?", body: "My physics textbook explains them separately but I don't understand how they relate.", subject: "Physics", aIdx: 11, likes: 7 },
    { title: "How to visualize high-dimensional data?", body: "I have a dataset with 50 features. How do I visualize it to understand patterns?", subject: "Data Science", aIdx: 12, likes: 20 },
    { title: "Database indexing — practical guide", body: "How do I decide which columns to index? Are there downsides to indexing?", subject: "DBMS", aIdx: 13, likes: 17 },
    { title: "What are generators in Python and why use them?", body: "I've seen 'yield' in Python code but I don't understand generators.", subject: "Python Programming", aIdx: 14, likes: 11 },
    { title: "Deep learning vs traditional ML — key differences", body: "When should I use deep learning vs classical ML like SVM or Random Forest?", subject: "Machine Learning", aIdx: 15, likes: 28 },
    { title: "How does JVM garbage collection work?", body: "I want to understand Java memory management and GC strategies.", subject: "Java Programming", aIdx: 16, likes: 10 },
    { title: "NLP: Bag of Words vs Word2Vec vs BERT", body: "How are these text representation methods different?", subject: "Artificial Intelligence", aIdx: 17, likes: 24 },
    { title: "What is eigenvalue decomposition used for?", body: "I understand how to compute eigenvalues but not the ML applications.", subject: "Mathematics", aIdx: 18, likes: 13 },
    { title: "Tips for writing clean and maintainable CSS?", body: "My CSS files are getting messy. What are the best practices?", subject: "Web Development", aIdx: 19, likes: 16 },
    { title: "How do convolutional layers extract features?", body: "I understand CNNs classify images but what features do different layers learn?", subject: "Machine Learning", aIdx: 0, likes: 33 },
    { title: "pandas vs SQL for data analysis — which to use?", body: "I can do the same analysis in both. When should I prefer one over the other?", subject: "Data Science", aIdx: 1, likes: 21 },
    { title: "Understanding time complexity (Big-O notation)", body: "How do I determine time complexity? I can't tell O(n) from O(n log n).", subject: "Python Programming", aIdx: 2, likes: 29 },
    { title: "How to set up a development environment for web dev?", body: "What tools should I install and how do I organize my project?", subject: "Web Development", aIdx: 3, likes: 8 },
    { title: "Understanding the transformer architecture in NLP", body: "Papers mention transformers and attention. Can someone explain the key ideas?", subject: "Artificial Intelligence", aIdx: 4, likes: 37 },
    { title: "How to write effective unit tests for Java?", body: "I know testing is important but where do I start with JUnit?", subject: "Java Programming", aIdx: 5, likes: 12 },
    { title: "What is database sharding and when is it needed?", body: "When should I consider sharding and how does it work?", subject: "DBMS", aIdx: 6, likes: 19 },
    { title: "How to balance a chemical equation systematically?", body: "I struggle with balancing complex equations. Is there a systematic method?", subject: "Chemistry", aIdx: 7, likes: 9 },
    { title: "How does HTTPS work? (SSL/TLS explained)", body: "I know HTTPS is secure but I don't understand the cryptography behind it.", subject: "Web Development", aIdx: 8, likes: 26 },
    { title: "Study tips for science subjects?", body: "I find physics and chemistry hard to retain. What study techniques work best?", subject: "Physics", aIdx: 9, likes: 14 },
    { title: "pandas GroupBy — confused about aggregation", body: "The pandas groupby is confusing. How do I use agg() correctly?", subject: "Data Science", aIdx: 10, likes: 16 },
    { title: "How to implement a binary search tree in Python?", body: "I need to implement a BST for a data structures assignment.", subject: "Python Programming", aIdx: 11, likes: 7 },
    { title: "What is regularization in machine learning?", body: "I've seen L1 (Lasso) and L2 (Ridge) regularization. What do they do?", subject: "Machine Learning", aIdx: 12, likes: 22 },
    { title: "How to handle missing data in a dataset?", body: "Should I drop rows with NaN values or impute them?", subject: "Data Science", aIdx: 13, likes: 18 },
    { title: "Abstract class vs interface in Java?", body: "Both define methods subclasses must implement. What's the practical difference?", subject: "Java Programming", aIdx: 14, likes: 15 },
    { title: "How does BERT represent text?", body: "I understand BERT is a pre-trained model but how does it create word embeddings?", subject: "Artificial Intelligence", aIdx: 15, likes: 29 },
    { title: "Newton's laws in everyday life", body: "Can you explain Newton's three laws with easy practical examples?", subject: "Physics", aIdx: 16, likes: 11 },
    { title: "Presenting data to non-technical stakeholders", body: "I have great analysis but struggle to communicate it to business people.", subject: "Data Science", aIdx: 17, likes: 20 },
    { title: "What is dependency injection and why use it?", body: "I see dependency injection in Java and Spring. What problem does it solve?", subject: "Java Programming", aIdx: 18, likes: 13 },
    { title: "Tips for improving vocabulary for IELTS/TOEFL?", body: "I need to improve English vocabulary for a proficiency test.", subject: "English Communication", aIdx: 19, likes: 17 },
    { title: "How to set up CI/CD for a web project?", body: "I want to automate testing and deployment. What tools and steps are involved?", subject: "Web Development", aIdx: 0, likes: 24 },
    { title: "Python decorators explained with examples", body: "I've read about decorators but don't understand how they work.", subject: "Python Programming", aIdx: 1, likes: 19 },
    { title: "How to optimize SQL queries for large tables?", body: "My queries are slow on a 10M row table. What techniques can I use?", subject: "DBMS", aIdx: 2, likes: 21 },
    { title: "Probability: conditional vs joint probability?", body: "I keep mixing up P(A|B) and P(A∩B). Can someone explain?", subject: "Mathematics", aIdx: 3, likes: 10 },
    { title: "React Context vs Redux — which to use?", body: "When should I use Context API vs Redux? Is Redux overkill for small apps?", subject: "Web Development", aIdx: 4, likes: 23 },
    { title: "How does the attention mechanism work?", body: "I want to understand self-attention and the Q, K, V matrices.", subject: "Artificial Intelligence", aIdx: 5, likes: 34 },
    { title: "Mole concept explained simply", body: "I know a mole is 6.022×10²³ particles, but how do I apply it?", subject: "Chemistry", aIdx: 6, likes: 8 },
    { title: "Data augmentation for image classification", body: "My dataset is small. What augmentation techniques improve CNN performance?", subject: "Machine Learning", aIdx: 7, likes: 26 },
    { title: "Calculus: chain rule explained intuitively", body: "I can apply the chain rule but don't understand why it works.", subject: "Mathematics", aIdx: 8, likes: 14 },
    { title: "Best practices for REST API design", body: "I'm building my first API. What are the key REST design principles?", subject: "Web Development", aIdx: 9, likes: 28 },
  ];

  const discIds: number[] = [];
  for (let di = 0; di < discDefs.length; di++) {
    const dd = discDefs[di];
    const existing = await db.select().from(discussionsTable).where(eq(discussionsTable.title, dd.title));
    if (existing.length > 0) { discIds.push(existing[0].id); continue; }
    const [disc] = await db.insert(discussionsTable).values({ title: dd.title, body: dd.body, authorId: students[dd.aIdx % students.length].id, subject: dd.subject, likes: dd.likes }).returning();
    discIds.push(disc.id);
  }

  const existingReplies = await db.select().from(repliesTable);
  if (existingReplies.length < 80) {
    const reply1 = "Great question! This is a common challenge when learning. The key insight is to start with simple examples and gradually build up. Practice consistently and you'll get it!";
    const reply2 = "I faced the same confusion. What really helped me was experimenting with small projects and looking at real-world code. Check out the course resources section too — there are great examples there!";
    for (let di = 0; di < discIds.length; di++) {
      const discId = discIds[di];
      const exist = await db.select().from(repliesTable).where(eq(repliesTable.discussionId, discId));
      if (exist.length === 0) {
        await db.insert(repliesTable).values({ discussionId: discId, body: reply1, authorId: students[(di + 5) % students.length].id });
        await db.insert(repliesTable).values({ discussionId: discId, body: reply2, authorId: students[(di + 10) % students.length].id });
      }
    }
  }
  console.log("Discussions & replies ready");

  // ASSIGNMENTS (30)
  console.log("Seeding assignments...");
  const existingAssignments = await db.select().from(assignmentsTable);
  if (existingAssignments.length === 0) {
    const assignDefs = [
      { title: "Python Basics: Variables & Loops", description: "Write a Python program using variables, for loops, and while loops to solve 3 mathematical problems.", subject: "Python Programming", tIdx: 0, days: 7 },
      { title: "Build a Number Guessing Game", description: "Create a Python number guessing game using random, loops, and conditionals. Include error handling.", subject: "Python Programming", tIdx: 0, days: 14 },
      { title: "OOP: Bank Account Class", description: "Implement a BankAccount class with deposit, withdraw, and balance methods. Write tests for each.", subject: "Python Programming", tIdx: 0, days: 21 },
      { title: "REST API with FastAPI", description: "Build a complete CRUD REST API for a bookstore using FastAPI. Document all endpoints.", subject: "Python Programming", tIdx: 0, days: 28 },
      { title: "Exploratory Data Analysis Report", description: "Perform EDA on the provided sales dataset. Clean data, create visualizations, and summarize findings.", subject: "Data Science", tIdx: 0, days: 10 },
      { title: "Data Cleaning Project", description: "Clean the provided messy dataset. Handle missing values, outliers, and inconsistent formats.", subject: "Data Science", tIdx: 0, days: 18 },
      { title: "Full Data Pipeline Project", description: "Build a pipeline: ingest CSV, clean, transform, load into database. Document each step.", subject: "Data Science", tIdx: 0, days: 30 },
      { title: "AI Literature Review", description: "Write a 2-page summary of a recent AI research paper: problem, methodology, results, your opinion.", subject: "Artificial Intelligence", tIdx: 1, days: 12 },
      { title: "NLP Sentiment Analysis", description: "Build a sentiment analysis model for movie reviews. Use TF-IDF, achieve 80%+ accuracy.", subject: "Artificial Intelligence", tIdx: 1, days: 25 },
      { title: "Implement KNN from Scratch", description: "Implement k-Nearest Neighbors without scikit-learn. Test on Iris dataset and report accuracy.", subject: "Machine Learning", tIdx: 1, days: 20 },
      { title: "CNN for Image Classification", description: "Build and train a CNN to classify CIFAR-10 images. Achieve 70%+ accuracy.", subject: "Machine Learning", tIdx: 1, days: 28 },
      { title: "ML Model Deployment Project", description: "Train a model, build FastAPI wrapper, containerize with Docker, deploy to cloud.", subject: "Machine Learning", tIdx: 1, days: 35 },
      { title: "SQL: Library Database Design", description: "Design ER diagram and SQL schema for a library. Implement with 10+ SQL statements.", subject: "DBMS", tIdx: 2, days: 9 },
      { title: "Database Normalization Exercise", description: "Normalize the given denormalized table through 3NF. Explain each step.", subject: "DBMS", tIdx: 2, days: 16 },
      { title: "Database Performance Tuning", description: "Analyze a slow query, add indexes, improve execution time by 5x.", subject: "DBMS", tIdx: 2, days: 22 },
      { title: "Personal Portfolio Website", description: "Build a responsive portfolio with HTML, CSS, and JavaScript. Deploy and submit the URL.", subject: "Web Development", tIdx: 2, days: 21 },
      { title: "React Todo App with API", description: "Build a React todo app fetching/saving data to a REST API. Use hooks and context.", subject: "Web Development", tIdx: 2, days: 25 },
      { title: "Full Stack Blog Application", description: "Build a blog with auth, create/edit/delete posts, comments. Deploy frontend and backend.", subject: "Web Development", tIdx: 2, days: 35 },
      { title: "Java: Student Management System", description: "Build a student management system using OOP. Include add, remove, search with collections.", subject: "Java Programming", tIdx: 3, days: 14 },
      { title: "Java File I/O: CSV Parser", description: "Write a Java program to read CSV files and compute statistics for each numeric column.", subject: "Java Programming", tIdx: 3, days: 20 },
      { title: "Java Spring Boot REST API", description: "Build a RESTful API with Spring Boot. CRUD for a Product catalog with validations.", subject: "Java Programming", tIdx: 3, days: 30 },
      { title: "Statistics: Hypothesis Testing", description: "Using the provided dataset, perform 3 statistical tests. Interpret and write a 1-page report.", subject: "Mathematics", tIdx: 3, days: 15 },
      { title: "Linear Algebra: Matrix Operations", description: "Implement matrix multiplication, transpose, inverse from scratch in Python. Validate with NumPy.", subject: "Mathematics", tIdx: 3, days: 11 },
      { title: "Physics Lab Report: Newton's Laws", description: "Write a detailed lab report on Newton's Laws experiment with data, graphs, and conclusions.", subject: "Physics", tIdx: 4, days: 10 },
      { title: "Physics: Electromagnetic Induction Lab", description: "Lab report on electromagnetic induction experiment. Calculate induced EMF vs theory.", subject: "Physics", tIdx: 4, days: 14 },
      { title: "Chemistry: Stoichiometry Problems", description: "Solve the 15 stoichiometry problems. Show all work, units, and significant figures.", subject: "Chemistry", tIdx: 4, days: 8 },
      { title: "Chemistry: Acid-Base Titration Lab Report", description: "Complete lab report on the acid-base titration experiment with all calculations.", subject: "Chemistry", tIdx: 4, days: 11 },
      { title: "English: Formal Report Writing", description: "Write a 500-word formal report on a topic of your choice following class structure.", subject: "English Communication", tIdx: 4, days: 12 },
      { title: "English: 5-Minute Presentation Video", description: "Record a 5-minute presentation on any technical topic in your domain. Submit the link.", subject: "English Communication", tIdx: 4, days: 20 },
      { title: "Pandas Advanced Analysis: Real Dataset", description: "Analyze a Kaggle dataset using groupby, pivot tables, and merge. Present key insights.", subject: "Data Science", tIdx: 0, days: 17 },
    ];
    for (const ad of assignDefs) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + ad.days);
      await db.insert(assignmentsTable).values({ title: ad.title, description: ad.description, subject: ad.subject, teacherId: teachers[ad.tIdx].id, dueDate, maxScore: 100 });
    }
  }
  console.log("Assignments ready");

  // BOOKMARKS & RATINGS
  const existBm = await db.select().from(bookmarksTable);
  if (existBm.length === 0) {
    for (let si = 0; si < Math.min(students.length, 15); si++) {
      const num = 2 + (si % 3);
      for (let bi = 0; bi < num; bi++) {
        await db.insert(bookmarksTable).values({ studentId: students[si].id, courseId: courseIds[(si + bi + 2) % courseIds.length] });
      }
    }
  }
  const existRt = await db.select().from(ratingsTable);
  if (existRt.length === 0) {
    const rVals = [4.5,5.0,4.0,4.8,3.5,4.2,4.7,5.0,4.3,4.6];
    const rRevs = ["Excellent! Clear explanations and great examples.","Very comprehensive. Learned so much!","Good but needs more practice exercises.","Best course I've taken. Highly recommend!","Decent. Could use more depth in advanced topics.","Amazing instructor! Very engaging.","Perfect pacing. Not too fast or slow.","Projects are challenging but rewarding.","Great real-world examples.","Well-structured and easy to follow."];
    for (let si = 0; si < Math.min(students.length, 15); si++) {
      const num = 2 + (si % 4);
      for (let ri = 0; ri < num; ri++) {
        await db.insert(ratingsTable).values({ studentId: students[si].id, courseId: courseIds[(si + ri) % courseIds.length], rating: rVals[(si + ri) % rVals.length], review: rRevs[(si + ri) % rRevs.length] });
      }
    }
  }

  console.log("\n=== ALIS Seed Complete ===");
  console.log("Users: 1 admin, 5 teachers, 10 parents, 20 students");
  console.log("Courses: 12 | Tests: 20 | Live Classes: 10");
  console.log("Discussions: 50 | Assignments: 30 | Bookmarks & Ratings seeded");
  console.log("\nDemo Credentials:");
  console.log("  admin@alis.com     / admin123");
  console.log("  teacher@alis.com   / password123");
  console.log("  student@alis.com   / password123");
  console.log("  parent@alis.com    / password123");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
