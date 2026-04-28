/**
 * projects.ts — single source of truth for all project / workshop cards.
 *
 * HOW TO UPDATE CONTENT:
 *   - Edit text, tags, or outcome for an existing entry → change it here, done.
 *   - Add a brand-new project → append a new object to the array below.
 *   - Change card layout or add a new section → edit ProjectCard.tsx / ProjectModal.tsx.
 *
 * You should NEVER need to touch projects.astro for normal content updates.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ProjectCategory =
  | 'workshops'
  | 'teaching'
  | 'public-projects'
  | 'professional';

export type ProjectStatus = 'completed' | 'in-progress' | 'ongoing';

export interface ProjectLink {
  label: string;
  url: string;
  /** If true, render as an embedded iframe preview (Google Drive file viewer, etc.) */
  embed?: boolean;
}

export interface Project {
  id: string;
  title: string;
  /** Organisation / context (e.g. "UCalgary — DS&ML Club"). */
  company: string;
  category: ProjectCategory;
  /** ISO-ish date string for sorting — "YYYY-MM" or "YYYY-MM-DD". */
  sortDate: string;
  /** Human-readable date shown in the UI. */
  date: string;
  /** Your role on the project. */
  role?: string;
  /** Short teaser shown on the card (1–2 sentences max). */
  summary: string;
  /** Full detail shown in the modal — paragraph overview. */
  description: string;
  /** "What was covered" — bullet points for workshops. */
  covered?: string[];
  /** Target audience description. */
  audience?: string;
  /** Session format (slides, live coding, lab, etc.). */
  format?: string;
  /** Quantified impact / outcome — shown in an accent block. */
  outcome?: string;
  tags: string[];
  /** External links (GitHub, live demo, Drive folder, individual files). */
  publicLinks?: ProjectLink[];
  /** Screenshot / demo image paths (relative to /public). */
  images?: string[];
  /** Captions for each image (parallel to `images`). */
  imageCaptions?: string[];
  /** Featured project — shown larger / highlighted. */
  featured?: boolean;
  status?: ProjectStatus;
}

// ── Filter labels ──────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  workshops: 'Workshops',
  teaching: 'Teaching',
  'public-projects': 'Public Projects',
  professional: 'Professional Highlights',
};

// ── Project entries (sorted newest → oldest) ─────────────────────────────

export const projects: Project[] = [
  // ═══════════════════════════════════════════════════════════════════════
  //  WORKSHOPS — public-facing, with Google Drive material links
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'w-image-classification',
    title: 'Intro to Image Classification',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-12',
    date: 'December 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Slides + Hands-on Colab Notebook + Kahoot',
    summary:
      'Students built a working car image classifier from scratch — learning how machines learn from labeled examples, how computers see images as grids of numbers, and how to measure and improve model accuracy.',
    description:
      'This workshop taught image classification by framing it through autonomous driving: the goal was to build a model that can recognize cars in images, the same fundamental task self-driving vehicles rely on. The session opened with a Terminator movie clip to set the stage for how machines perceive the world differently from humans, then walked through the universal machine learning loop: gather labeled data, train a model on it, test on unseen images, and improve by tweaking parameters. Students learned that computers see images as grids of pixel numbers (0–255 intensity values) — a 100x100 image means 10,000 numbers to process — and that the model must learn which number patterns correspond to "car." The slides covered real-world applications (autonomous vehicles, medical imaging, phone face unlock) before diving into the live Colab activity where students built and trained their own car classifier. After training, students evaluated their model using accuracy, precision, and recall — learning what each metric reveals about performance. They then tackled common problems: overfitting (memorizing training data instead of generalizing) and how to fix it with more data, parameter tuning, and regularization. In a hands-on challenge, students tweaked learning parameters, added more training images, and compared how each change affected accuracy. The workshop included a Kahoot competition with the top 3 scorers earning extra raffle points. The session concluded by revisiting the Terminator clip, asking students to re-interpret it through their new understanding of how ML models process visual input.',
    covered: [
      'The universal ML loop: gather data, train, test, improve',
      'How computers see images — pixel grids, intensity values (0–255), channels',
      'Why raw pixel patterns are what models learn to recognize',
      'Real-world image classification: autonomous cars, medical imaging, phone face unlock',
      'Building a car image classifier from scratch in Google Colab',
      'Evaluating model performance: accuracy, precision, and recall explained',
      'Overfitting — what it is, how to detect it, and how to fix it (regularization, more data)',
      'Hands-on parameter tuning: learning rate, epochs, training data volume',
      'Students compared accuracy changes from different parameter tweaks',
      'Kahoot competition on workshop concepts',
    ],
    outcome: 'Students built, trained, and iteratively improved their own car image classifier — gaining hands-on understanding of how machines learn to see and the practical levers (data, parameters, regularization) that control model performance.',
    tags: ['Python', 'Machine Learning', 'Image Classification', 'Google Colab'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1xD26d8R5w7q1b51orq-7514676UUsYee',
      },
    ],
    featured: true,
    status: 'completed',
  },
  {
    id: 'w-data-engineering',
    title: 'Data Engineering Workshop',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-10',
    date: 'October 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Slides + Hands-on Databricks Pipeline Notebook + Pop Quiz Raffles',
    summary:
      'Students built a complete medallion architecture data pipeline on Databricks — ingesting live data from their own chosen public APIs through bronze, silver, and gold layers, with a demo of Lakeflow Declarative Pipelines.',
    description:
      'This workshop taught data engineering through Databricks by having students build a real medallion architecture pipeline end to end. The session opened with what data engineering actually is — collecting, cleaning, and organizing data so it is ready for analysis — and the four core tasks: ingestion, transformation, orchestration, and storage/delivery. Key industry terminology was introduced early: Slowly Changing Dimensions (Type I overwrites vs. Type II history-preserving) and Change Data Capture (CDC) for tracking changes at the source. The main activity used the Databricks platform. Students created bronze, silver, and gold directory volumes in DBFS and built a pipeline that progressed through all three layers. In the bronze layer, they picked a public API of their choice (examples included the Wizard World API for Harry Potter elixirs data, PokéAPI, OpenWeather, and SpaceX) and fetched raw JSON data using Python requests. In the silver layer, they cleaned the data — removing duplicates, handling nulls, enforcing schemas, and enriching it by deriving new columns and normalizing values. In the gold layer, students applied dimensional modeling: building fact tables (measurable events) and dimension tables (descriptive attributes) to answer specific business questions. The example business inquiry was "How many wizards of each mastery level are needed based on the recipe difficulty distribution?" The session concluded with a live demo of Databricks Lakeflow Declarative Pipelines (Delta Live Tables), showing how production pipelines automate the medallion architecture pattern they had just built manually. Pop quiz raffles kept students engaged throughout.',
    covered: [
      'What data engineering is: collecting, cleaning, organizing data for analysis',
      'Core data engineering tasks: ingestion, transformation, orchestration, storage/delivery',
      'Slowly Changing Dimensions — Type I (overwrite) vs. Type II (history-preserving)',
      'Change Data Capture (CDC) for tracking source-level data changes',
      'Databricks platform: workspaces, notebooks, DBFS volume management',
      'Medallion architecture: bronze (raw ingestion) → silver (cleaned/enriched) → gold (business-ready aggregates)',
      'Bronze layer: fetching live JSON from public APIs using Python requests',
      'Students chose their own APIs: Wizard World, PokéAPI, OpenWeather, SpaceX',
      'Silver layer: deduplication, null handling, schema enforcement, column derivation, normalization',
      'Gold layer: dimensional modeling — fact tables (events) and dimension tables (attributes)',
      'Formulating and answering business questions from gold-layer dimensional models',
      'Live demo of Databricks Lakeflow Declarative Pipelines (Delta Live Tables)',
    ],
    outcome: 'Students built a complete bronze → silver → gold pipeline on Databricks using live API data of their choice — gaining hands-on experience with the medallion architecture, dimensional modeling, and the Databricks platform used in industry.',
    tags: ['Databricks', 'Data Engineering', 'PySpark', 'Medallion Architecture', 'Python'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/12EuIcR6blhT3fu7985_GacpaD_myoGOc',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-deep-learning-cars',
    title: 'Deep Learning with Cars',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-09',
    date: 'September 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Slides + Hands-on Colab Notebook + Student Tournament',
    summary:
      'Students built and trained their own neural networks to drive autonomous cars along a track — then competed in a tournament to see whose model could navigate the course fastest and most accurately.',
    description:
      'This workshop taught neural networks by having students build self-driving cars that learn to follow a track without being explicitly told how. The session progressed through four stages: Introduction, Neural Networks, Training, and Applied — culminating in a live tournament. Students first learned what a neural network is by building one piece by piece: input layer (the car\'s distance from the center of the track and heading difference from the desired direction), hidden layers (neurons asking questions like "Am I drifting left?" or "Is my steering smooth?"), weights (how important each input is), bias (shifting the weighted sum), and the ReLU activation function (max(0, z)). The loss function was cross-track error — how far the car drifts from the center line — and students learned gradient descent as the mechanism that adjusts weights each step to reduce that error. The neural network output three values: steering angle, heading correction, and speed. In the hands-on Colab activity, students built their own neural networks, trained them on track data, and watched their cars attempt to follow the course. They then optimized their models by adjusting the number of neurons and hidden layers, tuning the learning rate, modifying the speed formula and steering gain, trying dimensionality reduction, and adding more training tracks. The session ended with a tournament: students competed head-to-head with their trained cars on shared tracks. Rules required models to learn from track borders only, use their own neural network architecture, and complete training in under 3 minutes. The best-performing cars won prizes.',
    covered: [
      'Purpose: build a car that follows a track without telling it how — using only a neural network',
      'Neural network anatomy: input layer, hidden layers, output layer',
      'Inputs: car distance from track center, heading difference from desired direction',
      'Hidden layer neurons as learned questions ("Am I drifting?", "Going too fast?")',
      'Weights (input importance), bias (shifting weighted sums), ReLU activation (max(0, z))',
      'Loss function: cross-track error (distance from center line)',
      'Gradient descent: adjusting weights each step to minimize loss',
      'Neural network outputs: steering angle, heading, speed',
      'Hands-on: students built, trained, and iterated on their own car neural networks',
      'Optimization strategies: more neurons/layers, learning rate tuning, speed formula, steering gain, dimensionality reduction',
      'Live student tournament with competitive rules (own NN, 3-minute training limit, border-only learning)',
    ],
    outcome: 'Students built working self-driving car neural networks from scratch and competed in a live tournament — gaining intuitive, hands-on understanding of how neural networks learn through weights, gradients, and iterative optimization.',
    tags: ['Deep Learning', 'Neural Networks', 'Python', 'Google Colab', 'Autonomous Vehicles'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1jHLFYUrO8zV6iRhr-09f2tKnNIEOSfID',
      },
    ],
    featured: true,
    status: 'completed',
  },
  {
    id: 'w-azure-ml',
    title: 'Cloudy with a Chance of ML — Intro to Azure Machine Learning',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-03',
    date: 'March 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members (DATA 414 / 305 / 501) — all levels',
    format: 'Slides + Colab Notebook + Mini Competition',
    summary:
      'Students learned cloud computing fundamentals and machine learning forecasting on Azure — then competed in a mini challenge to provide the most creative and accurate predictions using their own custom APIs.',
    description:
      'Titled "Cloudy with a Chance of ML," this workshop introduced cloud computing and machine learning together. The session started with cloud computing basics: what it means to lease computing resources remotely, and the core benefits — flexibility, scalability, security, and offloading infrastructure responsibilities. Students then learned what machine learning is at its core: training models to perform tasks without being explicitly programmed, using inputs (datasets, APIs) fed through a model to produce outputs (predictions). The focus was on forecasting — predicting future trends from historical data. The Azure ML pipeline was broken down into a simple three-step loop: configure an experiment, run it in the cloud, and interpret the output result. For the hands-on portion, students set up Azure for Students accounts and worked through a companion Colab notebook. The notebook walked them through connecting to an API, processing the response data, and running a prediction model. The mini-competition challenged students to go beyond the provided example: they changed APIs to predict different variables and competed to provide the quickest and most creative accurate predictions. Students from DATA 414, DATA 305, and DATA 501 received participation credit for attending. The workshop deliberately kept the scope accessible — this was not about MLflow, model registries, or deployment endpoints, but about demystifying what "running ML in the cloud" actually looks like and giving students a first taste of Azure.',
    covered: [
      'Cloud computing fundamentals: leasing resources, flexibility, scalability, security',
      'Machine learning overview: inputs (datasets, APIs) → model → outputs (predictions)',
      'Forecasting: predicting future trends from historical data',
      'Azure ML pipeline: configure experiment → run in cloud → output result',
      'Setting up Azure for Students accounts',
      'Colab notebook: connecting to APIs, processing data, running predictions',
      'Mini competition: creative predictions using custom APIs — speed and accuracy',
      'Students changed API sources and prediction targets for their competition entries',
      'Participation credit for DATA 414, DATA 305, and DATA 501 students',
    ],
    outcome: 'Students set up their own Azure accounts, ran ML predictions in the cloud through a Colab notebook, and competed to produce the most creative API-driven forecasts — demystifying cloud ML in a single accessible session.',
    tags: ['Azure', 'Cloud Computing', 'Machine Learning', 'Forecasting', 'Python', 'Google Colab'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/10-9eCCPPyX1bJ7ubiXFWvjHrCMZYGNm_',
      },
    ],
    featured: true,
    status: 'completed',
  },
  {
    id: 'w-ai-study-companion',
    title: 'Make Your Own AI Study Companion (EVE)',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-01',
    date: 'January 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — all levels',
    format: 'Slides + Hands-on Colab Notebook + Step-by-Step PDF Guide + Recording',
    summary:
      'A three-part deep dive from machine learning theory through NLP fundamentals to building a working chatbot — students coded their own AI study companion (EVE) by filling in designated sections of a chatbot demo using NLTK and spaCy.',
    description:
      'This workshop was structured in three progressive parts: (01) Machine Learning theory, (02) Application of that theory, and (03) Coding EVE. Part 1 covered ML fundamentals — supervised vs. unsupervised learning, how models learn by adjusting parameters from input variables and expected outputs, and how deep learning extends this with neural networks for complex patterns. Part 2 narrowed the focus to Natural Language Processing (NLP): how machines interpret and manipulate human language across four linguistic levels — morphology (word structure), syntax (sentence structure), semantics (meaning), and pragmatics (context-dependent meaning). Students learned the NLP processing pipeline in detail: tokenization (breaking text into units), stop word removal (filtering noise words), stemming (reducing "playing" to "play"), and lemmatization (reducing "better" to "good" using vocabulary knowledge). Text understanding was covered through Named Entity Recognition (NER) for identifying people, places, and organizations, and Part-of-Speech (POS) tagging for understanding grammatical roles. Intent recognition methods included decision trees, SVMs, and neural networks. The session then covered Recurrent Neural Networks (RNNs) for sequence modeling and the difference between generative AI and traditional AI approaches to chatbot dialogue management. In Part 3, students opened the Colab notebook and coded their own EVE (Educational Virtual Entity) chatbot by filling in designated code sections (marked with ### lines) that augmented provided chatbot demos. The hands-on work used NLTK and spaCy libraries for the NLP processing pipeline. A step-by-step PDF guide was provided for Objective 2, and the full session recording was shared for anyone who missed it.',
    covered: [
      'Machine learning fundamentals: supervised vs. unsupervised learning, parameter adjustment',
      'Deep learning: neural networks for learning complex patterns from data',
      'NLP overview: morphology, syntax, semantics, pragmatics — four levels of language understanding',
      'Text preprocessing pipeline: tokenization, stop word removal, stemming, lemmatization',
      'Stemming ("playing" → "play") vs. lemmatization ("better" → "good")',
      'Named Entity Recognition (NER): identifying people, places, organizations in text',
      'Part-of-Speech (POS) tagging for grammatical structure analysis',
      'Intent recognition methods: decision trees, SVMs, neural networks',
      'Recurrent Neural Networks (RNNs) for sequence modeling',
      'Generative AI vs. traditional AI — and chatbot dialogue management',
      'Hands-on: students coded in designated ### sections to augment chatbot demos',
      'NLTK and spaCy libraries for NLP processing',
      'Step-by-step PDF guide and full session recording provided',
    ],
    outcome: 'Students progressed from ML theory through NLP fundamentals to building a working chatbot — gaining understanding of how language processing actually works under the hood (tokenization, NER, POS tagging, RNNs) and hands-on experience coding with NLTK and spaCy.',
    tags: ['Python', 'NLP', 'Machine Learning', 'NLTK', 'spaCy', 'Chatbots', 'Google Colab'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1muBsaxQIetHbkLE97TWe-pRVUMznSyc6',
      },
    ],
    featured: true,
    status: 'completed',
  },
  {
    id: 'w-clouds-businesses',
    title: 'Clouds and Businesses: ETL with SQL & PySpark',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-11',
    date: 'November 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — beginners to intermediate',
    format: 'Slides + Hands-on Colab Notebook + Business Case Study + Recording',
    summary:
      'Students built a full ETL pipeline with PySpark on retail data — from extraction and transformation (sales bucketing, cumulative profit with window functions, anomaly detection with IQR) through loading into SQLite — then applied it to a business case study to save a struggling retail company.',
    description:
      'Framed around a retail store scenario, this workshop walked students through the complete ETL lifecycle using Apache Spark. The session opened with ETL fundamentals: Extract (collecting data from databases, APIs, and files), Transform (cleaning, standardization, and enrichment), and Load (batch or real-time delivery to warehouses and BI tools). Students learned SQL basics for filtering, grouping, and aggregating data. Apache Spark was introduced as a distributed computing engine — covering the RDD abstraction, transformations, and actions. The hands-on Colab notebook had students install PySpark, create a SparkSession, and load the SampleSuperstore.csv retail dataset. The transformation phase went well beyond basic cleaning: students dropped null rows, inspected data types, bucketed sales into Low/Medium/High categories using conditional logic, calculated cumulative profit using PySpark window functions, and performed anomaly detection using the IQR (Interquartile Range) method to flag unusual profit values. For the Load phase, students loaded their transformed data into a SQLite database and ran SQL queries for business insights. The session culminated with the "Saving Revive Retail" case study — a scenario where students had to determine which products, regions, and customer segments contribute most to profitability, identify where the company is losing money, and optimize operations to achieve a $1M surplus. Students wrote SQL queries to analyze profitability by product category, total profit per state, and profit per customer segment with margin and contribution percentages.',
    covered: [
      'ETL fundamentals: Extract (databases, APIs, files), Transform (clean, standardize, enrich), Load (batch/real-time)',
      'SQL basics for data exploration: filtering, grouping, aggregating',
      'Apache Spark: distributed computing, RDDs, transformations, and actions',
      'PySpark setup: installing PySpark, creating SparkSession, loading CSV data',
      'Data cleaning: dropping nulls, inspecting data types, null count analysis per column',
      'Sales bucketing: categorizing into Low/Medium/High using conditional PySpark logic',
      'Cumulative profit calculation using PySpark window functions',
      'Anomaly detection using the IQR (Interquartile Range) method',
      'Loading transformed data into SQLite via pandas',
      'SQL queries on loaded data for business insight generation',
      '"Saving Revive Retail" case study: optimizing a struggling retailer for $1M surplus',
      'Profitability analysis: by product category, by state, by customer segment with margins and contribution percentages',
    ],
    outcome: 'Students built a real ETL pipeline from extraction through anomaly detection to SQLite loading, then applied their skills to a business case study — learning how data engineering directly drives business decisions like identifying profitable segments and cutting losses.',
    tags: ['PySpark', 'SQL', 'ETL', 'Data Engineering', 'Python', 'SQLite'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1YcPcgQ_qeUe4B6TqzkhqWfpiGxG0QVxc',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-data-viz-python',
    title: 'Data Visualization & Manipulation in Python',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-10',
    date: 'October 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — all levels',
    format: 'Slides + Hands-on Colab Notebook + Final Competition Intro + Recording',
    summary:
      'A comprehensive Python foundations workshop covering visualization (Matplotlib, Plotly, Seaborn) and data manipulation (NumPy, Pandas, SciPy) — preparing students for the club\'s final competition across three tracks: Data Visualization, Machine Learning, and Research Proposal.',
    description:
      'This workshop served as both a standalone Python skill-builder and preparation for the DSML Club\'s Fall 2024 final competition, which had three tracks: Data Visualization, Machine Learning Approach, and Research Proposal Approach. The session began with Python basics — variables, conditionals, loops, indentation, functions, and imports — to bring all skill levels to a common baseline. The visualization portion covered three libraries in depth: Matplotlib (line plots, bar charts, scatter plots, histograms, subplots, legends, annotations, and combined multi-plot figures), Plotly (interactive visualizations with zoom, pan, and hover — plus customization and subplot support), and Seaborn (pairplots for multi-variable relationships, heatmaps for correlation, boxplots for distribution, and violin plots for density). The data manipulation section emphasized cleaning first: stripping whitespace, removing missing values, and lowercasing strings, then transforming data through concatenation, merging, and grouping operations. Three manipulation libraries were covered: NumPy (the foundation — arrays, indexing, mathematical operations), Pandas (DataFrames, CSV reading, column-based plotting and analysis), and SciPy (scientific computing with constants and algorithms). The hands-on Colab notebook titled "DSML Fall 2024: Data & Visualization Basics using Python" walked students through Python basics review, importing PIL and Matplotlib, working with variables and conditionals, and image loading and manipulation using moon.jpg. The full session recording was shared for review.',
    covered: [
      'Python basics: variables, conditionals, loops, indentation, functions, imports',
      'Final competition introduction: Data Visualization, ML Approach, and Research Proposal tracks',
      'Matplotlib: line plots, bar charts, scatter plots, histograms, subplots, legends, annotations, combined figures',
      'Plotly: interactive visualizations with zoom, pan, hover — customization and subplots',
      'Seaborn: pairplots, heatmaps, boxplots, violin plots for statistical visualization',
      'Data cleaning fundamentals: strip whitespace, remove missing values, lowercase standardization',
      'Data transformation: concatenation, merging, grouping operations',
      'NumPy: arrays, indexing, mathematical operations — the foundation of scientific Python',
      'Pandas: DataFrames, CSV reading, column-based plotting and analysis',
      'SciPy: scientific computing, constants, and algorithms',
      'PIL image loading and manipulation with moon.jpg in the Colab notebook',
      'Full session recording provided for review',
    ],
    outcome: 'Students gained working fluency in Python\'s core data stack — three visualization libraries (Matplotlib, Plotly, Seaborn) and three manipulation libraries (NumPy, Pandas, SciPy) — giving them the toolkit needed for the final competition and their own data projects.',
    tags: ['Python', 'Matplotlib', 'Plotly', 'Seaborn', 'NumPy', 'Pandas', 'SciPy', 'Data Viz'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1n4zDqrl3mRltO3L5rHclUmagH4jBsa_d',
      },
    ],
    status: 'completed',
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  TEACHING — overarching teaching role
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'dsml-club',
    title: 'DS&ML Club — Workshop Director',
    company: 'UCalgary — DS&ML Club',
    category: 'teaching',
    sortDate: '2024-01',
    date: '2024 – Present',
    role: 'Workshop Director',
    audience: 'University of Calgary students',
    format: 'Recurring workshop series',
    summary:
      'Designing and delivering hands-on technical workshops for 50+ University of Calgary students per session — covering neural networks, NLP, data engineering on Databricks, cloud ML on Azure, ETL pipelines, data visualization, and more.',
    description:
      'As Workshop Director, I design and deliver hands-on sessions covering a rotating curriculum of practical data and ML topics. Students have built self-driving car neural networks and competed in tournaments, constructed medallion architecture pipelines on Databricks using live APIs, learned NLP fundamentals (tokenization, NER, POS tagging, RNNs) and coded chatbots with NLTK and spaCy, run ML forecasting experiments on Azure with custom APIs, built image classifiers and tuned them for accuracy, performed full ETL with PySpark including anomaly detection and business case studies, and mastered Python visualization with Matplotlib, Plotly, and Seaborn. Every session is built around real datasets, industry tools, and student competitions — not toy examples. Students leave each workshop with working code they can immediately apply.',
    covered: [
      'Deep learning: self-driving car neural networks with student tournaments',
      'Image classification: building car classifiers, model evaluation, parameter tuning',
      'NLP and chatbots: tokenization, NER, POS tagging, RNNs, coding with NLTK and spaCy (EVE)',
      'Cloud ML on Azure: forecasting, API-driven predictions, mini competitions',
      'Data engineering on Databricks: medallion architecture, dimensional modeling, Lakeflow pipelines',
      'ETL with PySpark and SQL: anomaly detection, window functions, business case studies',
      'Data visualization in Python: Matplotlib, Plotly, Seaborn, NumPy, Pandas, SciPy',
    ],
    outcome: '90%+ satisfaction ratings. Consistent 50+ attendees. 7+ workshops delivered across neural networks, NLP, cloud ML, data engineering, ETL, and data visualization.',
    tags: ['Teaching', 'Data Science', 'Machine Learning', 'NLP', 'Databricks', 'Python'],
    featured: true,
    status: 'ongoing',
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  PUBLIC PROJECTS
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'portfolio-site',
    title: 'Portfolio Website',
    company: 'Personal Project',
    category: 'public-projects',
    sortDate: '2025-04',
    date: 'April 2025',
    role: 'Full-Stack Developer',
    summary:
      'Persona 5-inspired portfolio site built with Astro, React, and WebGL2 — featuring dynamic day progression, star-pattern backgrounds, and a Persona-themed UI system.',
    description:
      'Designed and built a fully custom portfolio website inspired by Persona 5\'s UI language. Features include a WebGL2 instanced-rendering star-pattern background, dynamic day/weather progression on the home page, Persona-styled navigation with animated transitions, and a responsive design system. Built with Astro for static generation with React islands for interactivity.',
    covered: [
      'Astro static site generation with React islands',
      'WebGL2 instanced rendering for background effects',
      'Persona 5 UI design system',
      'Responsive layout with clip-path styling',
      'Accessibility: focus traps, reduced motion, ARIA',
    ],
    outcome: 'Live at pransharma.dev. Open source on GitHub.',
    tags: ['Astro', 'React', 'TypeScript', 'WebGL2', 'CSS'],
    publicLinks: [
      { label: 'GitHub Repository', url: 'https://github.com/pransharma2/Portfolio-Website' },
    ],
    featured: true,
    status: 'in-progress',
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  PROFESSIONAL HIGHLIGHTS — concise, non-sensitive summaries only
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'pro-pipeline-monitor',
    title: 'Enterprise Pipeline Monitoring',
    company: 'Suncor Energy',
    category: 'professional',
    sortDate: '2024-06',
    date: '2024',
    role: 'Data Engineer',
    summary:
      'Built a consolidated monitoring solution providing visibility into pipeline orchestration across medallion layers — replacing fragmented manual status checks.',
    description:
      'Designed a monitoring application that consolidates pipeline run history, table refresh schedules, trigger states, and query performance into a single view across source-to-bronze, bronze-to-silver, and silver-to-gold layers. Replaced a fragmented manual checking process across multiple environments.',
    outcome: 'Eliminated manual pipeline status checks across 3 environments. Reduced incident detection time from hours to minutes.',
    tags: ['Monitoring', 'Azure', 'Snowflake', 'Data Engineering'],
    status: 'completed',
  },
  {
    id: 'pro-build-automation',
    title: 'Data Object Build Automation',
    company: 'Suncor Energy',
    category: 'professional',
    sortDate: '2024-04',
    date: '2024',
    role: 'Data Engineer',
    summary:
      'Python automation (migrated to a web app) enabling project teams to self-serve Snowflake object creation — saving ~$550 and ~3 hours per object.',
    description:
      'Designed reusable automation scripts for Dimension and Fact table creation, later migrated to a web application so any project team could self-serve without scripting knowledge. The app generates DDL, transformation logic, and pipeline scaffolding from simple form input.',
    outcome: '$550 saved per object. ~3 hours saved per build. Adopted by multiple project teams.',
    tags: ['Python', 'Automation', 'Snowflake', 'ETL'],
    status: 'completed',
  },
  {
    id: 'pro-sap-migration',
    title: 'SAP Table Migration',
    company: 'Suncor Energy',
    category: 'professional',
    sortDate: '2024-02',
    date: '2024',
    role: 'Data Engineer',
    summary:
      'Led the orchestration upgrade enabling migration of 400 SAP tables from legacy ingestion to a modern pipeline — driving 300K+ in annual savings.',
    description:
      'Led the orchestration tool upgrade that enabled modern ingestion for 400 SAP source tables. Coordinated table mapping, validation, and cutover logic to ensure zero data loss during migration. The upgrade also improved scalability for future source onboarding.',
    outcome: '300K+ in annual cost savings. 400 SAP tables migrated with zero data loss.',
    tags: ['SAP', 'Azure', 'ETL', 'Cost Reduction'],
    status: 'completed',
  },
];
