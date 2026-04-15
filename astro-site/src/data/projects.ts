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
    id: 'w-azure-ml',
    title: 'Intro to Azure Machine Learning',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-03',
    date: 'March 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Workshop + Live Demo',
    summary:
      'Hands-on introduction to Azure Machine Learning — provisioning workspaces, managed compute, training experiments, and deploying models as endpoints.',
    description:
      'Walked attendees through the full Azure ML lifecycle: provisioning a workspace, configuring managed compute, running training experiments with logging, evaluating models, and deploying as real-time endpoints. Covered the Azure ML Studio UI and SDK v2 for Python, with a focus on when to use each.',
    covered: [
      'Azure ML workspace setup and navigation',
      'Managed compute clusters vs. compute instances',
      'Training experiments with MLflow tracking',
      'Model registration and versioning',
      'Real-time endpoint deployment',
      'Azure ML SDK v2 for Python',
    ],
    outcome: 'Attendees deployed a live ML endpoint by end of session.',
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
    id: 'w-neural-nets',
    title: 'Neural Networks from Scratch',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2025-01',
    date: 'January 2025',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — all levels',
    format: 'Live Coding + Slides',
    summary:
      'Live-coding a neural network from scratch in Python — forward pass, backpropagation, gradient descent — then connecting it to PyTorch.',
    description:
      'Walked through building a neural network from scratch in Python — forward pass, backpropagation, gradient descent — then connected it to PyTorch for comparison. Focused on intuition over math notation, with visual diagrams of gradient flow at each step.',
    covered: [
      'Neuron model and activation functions',
      'Forward propagation from scratch',
      'Loss functions and cost calculation',
      'Backpropagation and chain rule intuition',
      'Gradient descent implementation',
      'Comparison with PyTorch autograd',
    ],
    outcome: '55+ attendees. Focused on intuition over math notation.',
    tags: ['Python', 'NumPy', 'PyTorch', 'Jupyter'],
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
    id: 'w-cloud-de',
    title: 'Cloud Data Engineering 101',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-11',
    date: 'November 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — beginners to intermediate',
    format: 'Workshop + Live Demo',
    summary:
      'End-to-end data journey in the cloud — ingestion, transformation, storage, orchestration — with a live ADF-to-Snowflake demo.',
    description:
      'Covered the end-to-end journey of data in the cloud — ingestion, transformation, storage, and orchestration. Live demo of an Azure Data Factory pipeline pulling from a REST API into a Snowflake warehouse. Students saw a pipeline go from zero to running in under 40 minutes.',
    covered: [
      'Cloud data architecture fundamentals',
      'Azure Data Factory pipeline creation',
      'REST API data ingestion',
      'Data transformation with Data Flows',
      'Snowflake warehouse loading',
      'Orchestration and scheduling patterns',
    ],
    outcome: '50+ attendees. Live demo from zero to running pipeline.',
    tags: ['Azure', 'Snowflake', 'Data Factory', 'SQL'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1n4zDqrl3mRltO3L5rHclUmagH4jBsa_d',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-sql-ds',
    title: 'SQL for Data Science',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-10',
    date: 'October 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — all levels',
    format: 'Hands-on Lab',
    summary:
      'Hands-on lab covering window functions, CTEs, aggregation patterns, and real analytical queries on a shared dataset.',
    description:
      'Interactive session covering window functions, CTEs, aggregation patterns, and real analytical queries. Students worked through exercises on a shared dataset, building from basic selects to complex multi-step analyses. Emphasis on writing production-quality analytical SQL, not just textbook examples.',
    covered: [
      'SELECT fundamentals and filtering',
      'JOINs and relationship patterns',
      'GROUP BY with aggregation functions',
      'Common Table Expressions (CTEs)',
      'Window functions: ROW_NUMBER, RANK, LAG/LEAD',
      'Multi-step analytical query composition',
    ],
    outcome: '60+ attendees. Students built from basic selects to complex multi-step analyses.',
    tags: ['SQL', 'PostgreSQL', 'DBeaver'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1YcPcgQ_qeUe4B6TqzkhqWfpiGxG0QVxc',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-python-ml',
    title: 'Python for ML Workflows',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-09',
    date: 'September 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — intermediate',
    format: 'Live Coding + Q&A',
    summary:
      'End-to-end ML workflow — data cleaning, feature engineering, model training with scikit-learn, evaluation, and serialization.',
    description:
      'End-to-end ML workflow in Python — data cleaning with pandas, feature engineering, model training with scikit-learn, evaluation metrics, and model serialization. Emphasized reproducibility and clean notebook structure over black-box convenience.',
    covered: [
      'Data cleaning and preprocessing with pandas',
      'Feature engineering strategies',
      'Train/test splitting and cross-validation',
      'Model training with scikit-learn',
      'Evaluation metrics: accuracy, precision, recall, F1',
      'Model serialization with joblib/pickle',
    ],
    outcome: '45+ attendees. Emphasized reproducibility and clean notebook structure.',
    tags: ['Python', 'pandas', 'scikit-learn', 'Jupyter'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1jHLFYUrO8zV6iRhr-09f2tKnNIEOSfID',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-data-viz',
    title: 'Data Visualization & Storytelling',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-03',
    date: 'March 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — all levels',
    format: 'Workshop + Slides',
    summary:
      'Principles of effective data visualization — chart selection, storytelling with data, and hands-on work with matplotlib and seaborn.',
    description:
      'Covered the fundamentals of data visualization and how to communicate findings clearly. Topics included chart type selection, color theory for data, storytelling frameworks, and hands-on exercises building publication-quality charts with matplotlib and seaborn.',
    covered: [
      'Chart type selection for different data shapes',
      'Color theory and accessibility in visualization',
      'Data storytelling frameworks',
      'matplotlib and seaborn fundamentals',
      'Building publication-quality charts',
      'Dashboard design principles',
    ],
    outcome: 'Attendees produced polished visualizations from a shared dataset.',
    tags: ['Python', 'matplotlib', 'seaborn', 'Data Viz'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/12EuIcR6blhT3fu7985_GacpaD_myoGOc',
      },
    ],
    status: 'completed',
  },
  {
    id: 'w-git-collab',
    title: 'Git & Collaboration for Data Teams',
    company: 'UCalgary — DS&ML Club',
    category: 'workshops',
    sortDate: '2024-02',
    date: 'February 2024',
    role: 'Workshop Lead',
    audience: 'DS&ML Club Members — beginners',
    format: 'Live Coding + Lab',
    summary:
      'Practical Git workflow for data science teams — branching, pull requests, merge conflicts, and collaboration patterns.',
    description:
      'Hands-on session covering Git fundamentals from a data science perspective. Covered branching strategies, pull request workflows, resolving merge conflicts, and best practices for collaborating on notebooks and data projects. Students practiced on a shared repository with simulated team workflows.',
    covered: [
      'Git fundamentals: init, add, commit, push',
      'Branching strategies for data projects',
      'Pull request workflows',
      'Resolving merge conflicts',
      'Notebook collaboration best practices',
      '.gitignore patterns for data/ML projects',
    ],
    outcome: 'Attendees completed a full PR workflow in a shared repo by end of session.',
    tags: ['Git', 'GitHub', 'Collaboration', 'Data Science'],
    publicLinks: [
      {
        label: 'Workshop Materials (Google Drive)',
        url: 'https://drive.google.com/drive/folders/1xD26d8R5w7q1b51orq-7514676UUsYee',
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
      'Designing and delivering hands-on technical workshops for 50+ University of Calgary students per session, covering neural networks, data engineering, cloud analytics, and more.',
    description:
      'As Workshop Director, I design and deliver hands-on sessions covering a rotating curriculum of practical data topics — neural networks, cloud-based data engineering, SQL and Python workflows, and more. Sessions are structured around real datasets and tools students would encounter in industry, not toy examples. I also built an incentive-based engagement system (certificates, skill tournaments) to drive repeat attendance and keep the material challenging.',
    covered: [
      'Neural networks and deep learning fundamentals',
      'Cloud data engineering with Azure and Snowflake',
      'SQL for analytical workloads',
      'Python for ML pipelines',
      'Data visualization and storytelling',
      'Git collaboration workflows',
    ],
    outcome: '90%+ satisfaction ratings. Consistent 50+ attendees. 7+ workshops delivered.',
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
