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
    format: 'Slides + Hands-on Colab Notebook',
    summary:
      'Hands-on introduction to image classification — from raw pixels to convolutional neural networks, with students building and training their own image classifiers in Google Colab.',
    description:
      'This workshop guided students through the full image classification pipeline, starting with how computers represent images as numerical arrays and why raw pixel values alone are insufficient for robust classification. Students learned the motivation behind convolutional neural networks (CNNs) — how convolutional layers detect edges, textures, and shapes through learned filters, and how pooling layers reduce spatial dimensions while preserving important features. The session progressed from simple fully-connected classifiers to architectures with convolutional and pooling layers, giving students first-hand experience seeing how each architectural choice impacts accuracy. In the live Colab activity, students loaded a real image dataset, preprocessed it (resizing, normalization, train/test split), defined a CNN architecture from scratch, trained it while monitoring loss and accuracy curves, and evaluated their model on held-out test images. Students learned to interpret confusion matrices and identify which classes their model struggled with, building intuition for when models fail and why.',
    covered: [
      'How computers represent images as numerical arrays (pixels, channels, dimensions)',
      'Why raw pixel values fail for robust classification',
      'Convolutional layers — learned filters for edge, texture, and shape detection',
      'Pooling layers and spatial dimensionality reduction',
      'Building a CNN architecture from scratch in Python',
      'Image preprocessing: resizing, normalization, augmentation basics',
      'Training loop implementation with loss and accuracy monitoring',
      'Evaluating classifiers: accuracy, confusion matrices, per-class performance',
      'Interpreting model failures — which classes are hard and why',
      'Hands-on Colab notebook: end-to-end image classification pipeline',
    ],
    outcome: 'Students built, trained, and evaluated their own CNN image classifier from scratch in a single session — gaining practical intuition for how deep learning models see and categorize visual data.',
    tags: ['Python', 'Deep Learning', 'CNN', 'Image Classification', 'Google Colab'],
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
    format: 'Slides + Hands-on Pipeline Notebook',
    summary:
      'End-to-end data engineering fundamentals — building data pipelines from ingestion through transformation to storage, with students constructing a working pipeline in a hands-on notebook.',
    description:
      'This workshop demystified data engineering by walking students through the entire lifecycle of data as it moves through a modern pipeline. The session opened with the big picture: why raw data needs to be ingested, cleaned, transformed, and stored in structured formats before it becomes useful for analytics or machine learning. Students learned about different data sources (APIs, databases, flat files), ingestion patterns (batch vs. streaming), and the concept of medallion architecture (bronze/silver/gold layers) used in industry. The core hands-on activity had students build a working data pipeline in a Jupyter notebook — extracting data from a source, applying transformations (filtering, joining, aggregating, handling nulls and duplicates), and loading the cleaned result into a structured output. Students experienced first-hand the challenges of messy real-world data: missing values, inconsistent formats, schema mismatches, and the importance of data validation at each stage. The workshop emphasized that data engineering is the foundation that makes all downstream analytics and ML possible — without clean, reliable data pipelines, models and dashboards are built on sand.',
    covered: [
      'What data engineering is and why it matters for analytics and ML',
      'Data sources: APIs, databases, flat files (CSV, JSON, Parquet)',
      'Batch vs. streaming ingestion patterns',
      'Medallion architecture: bronze (raw), silver (cleaned), gold (business-ready)',
      'Building a data pipeline: extract, transform, load (ETL)',
      'Data cleaning: handling nulls, duplicates, type mismatches, inconsistent formats',
      'Transformation operations: filtering, joining, aggregating, reshaping',
      'Data validation and quality checks at each pipeline stage',
      'Hands-on notebook: building a complete data pipeline from scratch',
      'Why reliable data pipelines are the foundation for all downstream work',
    ],
    outcome: 'Students built a complete, working data pipeline from raw ingestion to clean structured output — understanding first-hand why data engineering is the critical foundation for analytics and machine learning.',
    tags: ['Data Engineering', 'ETL', 'Python', 'Pipelines', 'Data Quality'],
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
    format: 'Slides + Hands-on Colab Notebook',
    summary:
      'Applied deep learning workshop where students built neural networks to predict car attributes — bridging the gap between theory and real-world regression/classification tasks on tabular and visual data.',
    description:
      'This workshop used cars as a compelling, relatable domain to teach deep learning fundamentals in a hands-on way. Rather than abstract toy datasets, students worked with real automotive data to build neural networks that predict car attributes — making the connection between model architecture and real-world prediction tangible. The session began with a review of neural network building blocks (layers, activations, loss functions, optimizers) before diving into the practical differences between regression tasks (predicting continuous values like price or horsepower) and classification tasks (categorizing car types or fuel efficiency classes). Students then moved to the hands-on Colab activity: loading and exploring a car dataset, engineering meaningful features, building a multi-layer neural network, training it while monitoring convergence, and evaluating predictions against ground truth. The workshop emphasized practical debugging skills — understanding why a model might not converge (learning rate too high, data not normalized, architecture too shallow), how to read training curves, and when to stop training. By using a domain students find intuitive, the workshop made abstract deep learning concepts (gradient descent, overfitting, regularization) concrete and memorable.',
    covered: [
      'Neural network building blocks: layers, activations, loss functions, optimizers',
      'Regression vs. classification tasks in deep learning',
      'Feature engineering for tabular data (normalization, encoding, feature selection)',
      'Building multi-layer neural networks in Python',
      'Training loop implementation with loss monitoring and convergence analysis',
      'Practical debugging: learning rate tuning, data normalization, architecture depth',
      'Reading and interpreting training/validation loss curves',
      'Overfitting detection and early stopping strategies',
      'Evaluating regression models: MSE, MAE, R-squared',
      'Hands-on Colab: end-to-end deep learning pipeline on car data',
    ],
    outcome: 'Students trained working deep learning models on real car data and learned to debug training issues — building the practical intuition needed to apply neural networks to their own projects and datasets.',
    tags: ['Deep Learning', 'Python', 'Neural Networks', 'Google Colab', 'Regression'],
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
    title: 'Intro to Azure Machine Learning',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-03',
    date: 'March 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Slides + Live Demo + Colab Notebook',
    summary:
      'Hands-on introduction to cloud-based machine learning using Azure ML — from workspace provisioning to model deployment, with students following along in a companion Colab notebook.',
    description:
      'This workshop introduced students to the world of cloud-based machine learning using Microsoft Azure ML Studio. The session began by explaining why cloud ML matters — the limitations of local training (memory, GPU, reproducibility) and how cloud platforms solve these by providing managed compute, experiment tracking, and one-click deployment. Students learned to navigate the Azure ML workspace, understanding how experiments, datasets, models, and endpoints are organized. The live demonstration walked through the full ML lifecycle on Azure: creating a compute cluster, uploading and registering a dataset, configuring a training experiment with MLflow logging, evaluating model metrics in the Studio UI, registering the best model, and deploying it as a real-time REST endpoint. Students followed along with a companion Colab notebook (Resources_for_Workshop.ipynb) that mirrored the cloud concepts locally, so they could practice the ML workflow even without Azure credits. The workshop drove home a critical industry skill: understanding that production ML is not just model.fit() in a notebook — it involves infrastructure, versioning, monitoring, and deployment, and cloud platforms are how professional teams manage that complexity.',
    covered: [
      'Why cloud ML platforms exist — limitations of local-only training',
      'Azure ML workspace navigation: experiments, datasets, models, endpoints',
      'Provisioning and configuring managed compute clusters',
      'Uploading and registering datasets in Azure ML',
      'Configuring training experiments with MLflow tracking and logging',
      'Evaluating model metrics and comparing runs in Azure ML Studio',
      'Model registration, versioning, and artifact management',
      'Deploying a trained model as a real-time REST endpoint',
      'Azure ML SDK v2 for Python — programmatic workspace interaction',
      'Companion Colab notebook: hands-on ML workflow mirroring cloud concepts',
      'Production ML reality: infrastructure, versioning, monitoring, and deployment',
    ],
    outcome: 'Students gained hands-on experience with the full Azure ML lifecycle — understanding that production machine learning requires cloud infrastructure, experiment tracking, and deployment pipelines, not just local notebooks.',
    tags: ['Azure ML', 'Python', 'MLflow', 'Cloud', 'Model Deployment'],
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
    format: 'Slides + Hands-on Colab Notebook + Step-by-Step Guide',
    summary:
      'Students built their own AI-powered study companion ("EVE") from scratch — learning prompt engineering, API integration, and conversational AI design through a guided, hands-on Colab project.',
    description:
      'This workshop was one of the most engaging sessions in the club\'s history, with students building a fully functional AI study companion named EVE (Educational Virtual Entity) from scratch. The session started with the fundamentals of how large language models work at a high level — tokenization, context windows, temperature, and why prompt design dramatically affects output quality. Students learned prompt engineering techniques: system prompts for persona definition, few-shot examples for consistent behavior, and structured output formatting. The core hands-on activity had students work through a Colab notebook where they connected to an LLM API, designed EVE\'s personality and teaching style through system prompts, implemented conversation memory so EVE could reference earlier parts of the discussion, and added specialized study features (quiz generation, concept explanation at adjustable difficulty levels, flashcard creation). A step-by-step PDF guide accompanied the notebook for students who wanted to work at their own pace. The recording was made available for anyone who missed the live session. Students learned that building AI applications is not about understanding transformer architecture in detail — it\'s about understanding how to effectively communicate with and orchestrate these models through well-designed prompts and application logic. By the end, every student had a personalized AI study tool they could continue using and customizing for their own courses.',
    covered: [
      'How large language models work at a high level (tokenization, context, temperature)',
      'Prompt engineering: system prompts, few-shot examples, output formatting',
      'Connecting to LLM APIs from Python (API keys, request structure, response parsing)',
      'Designing an AI persona with consistent behavior through system prompts',
      'Implementing conversation memory and context management',
      'Building study features: quiz generation, concept explanation, flashcard creation',
      'Adjustable difficulty levels through prompt parameterization',
      'Error handling and graceful degradation in AI applications',
      'Hands-on Colab notebook: building EVE from scratch step by step',
      'Step-by-step PDF guide for self-paced learning',
      'Key takeaway: AI app development is about prompt design and orchestration, not just model theory',
    ],
    outcome: '55+ attendees. Every student left with a working, personalized AI study companion they could immediately use for their courses — and the skills to build their own AI-powered tools for any domain.',
    tags: ['Python', 'LLM', 'Prompt Engineering', 'API Integration', 'Google Colab'],
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
    format: 'Slides + Hands-on Colab Notebook + Recording',
    summary:
      'Bridging cloud computing and business analytics — students built ETL pipelines using SQL and PySpark on a real retail dataset (SampleSuperstore), learning how businesses transform raw data into actionable insights.',
    description:
      'This workshop connected cloud computing concepts to real business value by showing students how companies use ETL (Extract, Transform, Load) pipelines to turn messy operational data into clean, analysis-ready datasets. The session opened with the business context: why companies invest in cloud data infrastructure, what ETL means in practice, and how SQL and PySpark fit into modern data stacks. Students worked with the SampleSuperstore.csv dataset — a realistic retail dataset with sales, profit, shipping, and customer segment data — making the exercises immediately relatable to real business scenarios. The hands-on Colab notebook walked students through extracting data from the CSV source, writing SQL queries to explore and understand the data (aggregations by region, product category profitability, shipping mode analysis), then building PySpark transformations to clean, reshape, and enrich the data at scale. Students learned why PySpark matters for large datasets that outgrow single-machine SQL — the distributed computing model, lazy evaluation, and DataFrame API. A solutions notebook was provided so students could check their work, and the full session recording was available for review. The workshop emphasized that ETL is not just a technical exercise — it is the bridge between raw business operations and the dashboards, reports, and ML models that drive decision-making.',
    covered: [
      'Why businesses invest in cloud data infrastructure and ETL pipelines',
      'ETL fundamentals: Extract, Transform, Load — what each stage means in practice',
      'SQL for data exploration: aggregations, filtering, GROUP BY, business-focused queries',
      'Analyzing real retail data: sales trends, profitability by category, regional patterns',
      'Introduction to PySpark: distributed computing, lazy evaluation, DataFrame API',
      'PySpark transformations: filtering, joining, aggregating, reshaping data at scale',
      'When to use SQL vs. PySpark — strengths and trade-offs',
      'Data quality in ETL: handling nulls, deduplication, type casting, validation',
      'Hands-on Colab notebook with the SampleSuperstore retail dataset',
      'Solutions notebook for self-checking and the full session recording for review',
      'Key insight: ETL bridges raw operations data and business decision-making',
    ],
    outcome: '50+ attendees. Students built real ETL pipelines on a retail dataset using both SQL and PySpark — gaining the practical skills to wrangle business data and understanding why clean data pipelines are essential for every analytics and ML workflow.',
    tags: ['SQL', 'PySpark', 'ETL', 'Cloud', 'Data Engineering'],
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
    format: 'Slides + Hands-on Colab Notebook + Recording',
    summary:
      'Hands-on introduction to data manipulation and visualization in Python — students explored, cleaned, and visualized datasets using pandas, matplotlib, and seaborn in a guided Colab notebook.',
    description:
      'This workshop gave students the foundational Python skills for working with data — the ability to load, explore, clean, transform, and visualize datasets using the core data science stack. The session began with pandas fundamentals: DataFrames, Series, indexing, filtering, and the mental model of thinking about data as structured tables rather than raw files. Students learned essential data manipulation operations: handling missing values (detecting, filling, dropping), type conversions, string operations, groupby aggregations, and merging/joining datasets. The visualization portion covered matplotlib and seaborn from the ground up — understanding the figure/axes paradigm, choosing appropriate chart types for different data relationships (scatter for correlation, bar for comparison, histogram for distribution, line for trends), and customizing plots for clarity and presentation quality. The hands-on Colab notebook had students work through a real dataset, producing a series of increasingly sophisticated visualizations while practicing the data wrangling steps needed to get the data into plottable shape. A solutions notebook was provided for self-checking, and the full recording was shared for students to revisit. Students learned that visualization is not just making pretty charts — it is the primary tool for understanding your data before modeling, communicating findings to stakeholders, and catching data quality issues early.',
    covered: [
      'pandas fundamentals: DataFrames, Series, indexing, filtering, selecting',
      'Data manipulation: handling missing values, type conversions, string operations',
      'GroupBy aggregations and summary statistics',
      'Merging and joining datasets',
      'matplotlib fundamentals: figure/axes paradigm, plot types, customization',
      'seaborn for statistical visualizations: distribution plots, heatmaps, pair plots',
      'Choosing the right chart type: scatter, bar, histogram, line, box plots',
      'Customizing plots for clarity: labels, titles, legends, color palettes',
      'Hands-on Colab notebook: wrangling and visualizing a real dataset end-to-end',
      'Solutions notebook and full session recording for review',
      'Key insight: visualization is the primary tool for understanding data before modeling',
    ],
    outcome: 'Students gained the ability to independently load, clean, and visualize any dataset in Python — the essential skill set that underpins all data science, analytics, and machine learning work.',
    tags: ['Python', 'pandas', 'matplotlib', 'seaborn', 'Data Viz'],
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
      'Designing and delivering hands-on technical workshops for 50+ University of Calgary students per session — covering deep learning, image classification, data engineering, cloud ML, AI applications, and more.',
    description:
      'As Workshop Director, I design and deliver hands-on sessions covering a rotating curriculum of practical data and ML topics — deep learning with real datasets, image classification with CNNs, cloud machine learning on Azure, data engineering pipelines, ETL with SQL and PySpark, data visualization in Python, and building AI-powered applications. Every session is built around real datasets and industry tools, not toy examples. Students leave each workshop with working code they can immediately apply. I also built an incentive-based engagement system (certificates, skill tournaments) to drive repeat attendance and keep the material challenging.',
    covered: [
      'Deep learning and neural networks (applied to cars, images, and more)',
      'Image classification with convolutional neural networks',
      'Cloud machine learning with Azure ML Studio',
      'AI application development (building study companion EVE)',
      'Data engineering pipelines and ETL workflows',
      'Cloud and business analytics with SQL and PySpark',
      'Data visualization and manipulation in Python',
    ],
    outcome: '90%+ satisfaction ratings. Consistent 50+ attendees. 7+ workshops delivered across deep learning, cloud ML, data engineering, and AI applications.',
    tags: ['Teaching', 'Data Science', 'Machine Learning', 'Python', 'Cloud Analytics'],
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
