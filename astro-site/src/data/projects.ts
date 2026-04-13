/**
 * projects.ts — single source of truth for all project cards.
 *
 * HOW TO UPDATE CONTENT:
 *   - Edit text, tags, or outcome for an existing project → change it here, done.
 *   - Add a brand-new project → append a new object to the array below.
 *   - Change card layout or add a new section → edit projects.astro or ProjectCard.tsx.
 *
 * You should NEVER need to touch projects.astro for normal content updates.
 */

export interface Project {
  number: string;
  title: string;
  company: string;
  /** Short teaser shown on the card (1–2 sentences max). */
  summary: string;
  /** Full detail shown in the modal. */
  description: string;
  /** Your role on the project (e.g. "Lead Developer", "Workshop Director"). */
  role?: string;
  /** Quantified impact / outcome — shown in an accent block. */
  outcome?: string;
  tags: string[];
  /** Optional external link (GitHub, live demo, etc.) */
  link?: string;
  /** Screenshot / demo image paths (relative to /public). */
  images?: string[];
  /** Captions for each image (parallel to `images`). */
  imageCaptions?: string[];
  /** Path to an architecture diagram image. */
  architectureDiagram?: string;
  /** Caption for the architecture diagram. */
  architectureCaption?: string;
  /** Featured project — shown larger / highlighted. */
  featured?: boolean;
  /** Grouping category for potential filtering. */
  category?: 'data-engineering' | 'automation' | 'analytics' | 'teaching' | 'web' | 'workshops';
  /** Project status. */
  status?: 'completed' | 'in-progress' | 'ongoing';
}

/** All filter categories shown in the UI. */
export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  'data-engineering': 'Engineering',
  automation: 'Automation',
  analytics: 'Analytics',
  workshops: 'Workshops',
  teaching: 'Teaching',
  web: 'Web',
};

export const projects: Project[] = [
  {
    number: '001',
    title: 'Data Pipeline Monitor',
    company: 'Suncor Energy',
    role: 'Data Engineer',
    summary: 'Power BI app giving full visibility into Suncor\'s orchestration stack — pipelines, Iceberg tables, Snowflake query history — across all medallion layers.',
    description:
      'Built a Power BI monitoring app that pulls from Azure Log Analytics Workspaces to surface real-time statuses for source-to-bronze, bronze-to-silver, and silver-to-gold pipelines. Covers pipeline run history, Iceberg table refresh schedules, trigger states, and Snowflake query performance in a single consolidated view — replacing a fragmented manual checking process.',
    outcome: 'Eliminated manual pipeline status checks across 3 data factory environments. Reduced incident detection time from hours to minutes.',
    tags: ['Power BI', 'Azure', 'Snowflake', 'Log Analytics', 'Data Engineering'],
    featured: true,
    category: 'analytics',
    status: 'completed',
  },
  {
    number: '002',
    title: 'Dim/Fact Build Automation',
    company: 'Suncor Energy',
    role: 'Data Engineer',
    summary: 'Python automation (migrated to a Streamlit app) enabling any project team to accelerate Snowflake object creation — $550 saved per object, ~3 hours per build.',
    description:
      'Designed and built reusable Dimension and Fact table automation scripts originally in Python, then migrated to a Streamlit web app so any project team could self-serve without scripting knowledge. The app generates DDL, transformation logic, and pipeline scaffolding from a simple form input, cutting the manual effort of building each Snowflake object drastically.',
    outcome: '$550 saved per object. ~3 hours saved per build. Adopted by multiple project teams across the Snowflake migration.',
    tags: ['Python', 'Streamlit', 'Snowflake', 'Automation', 'ETL'],
    featured: true,
    category: 'automation',
    status: 'completed',
  },
  {
    number: '003',
    title: 'SAP Table Migration',
    company: 'Suncor Energy',
    role: 'Data Engineer',
    summary: 'Shifted ingestion of 400 SAP tables from SLT to Datasphere by upgrading the orchestration tooling — driving 300K+ in annual savings.',
    description:
      'Led the orchestration tool upgrade that enabled Datasphere ingestion for 400 SAP source tables previously running through SLT. Coordinated table mapping, validation, and cutover logic to ensure zero data loss during migration. The upgrade also improved scalability of the pipeline layer for future SAP source onboarding.',
    outcome: '300K+ in annual cost savings. 400 SAP tables migrated with zero data loss.',
    tags: ['SAP', 'Azure Data Factory', 'Datasphere', 'ETL', 'Cost Reduction'],
    featured: true,
    category: 'data-engineering',
    status: 'completed',
  },
  {
    number: '004',
    title: 'IoT Data Ingestion Pipelines',
    company: 'Suncor Energy',
    role: 'Data Engineer',
    summary: 'Azure Data Factory pipelines for Otodata and DXFleet — IoT fuel tank and fleet vehicle data — with dynamic pagination and daily/hourly batching.',
    description:
      'Designed ADF pipelines for two IoT source systems: Otodata (fuel tank level monitoring) and DXFleet (fleet vehicle telemetry). Both pipelines use dynamic pagination to handle variable API response sizes and separate daily vs. hourly batching cadences. Built parameterized pipeline templates so future IoT sources can onboard with minimal config changes.',
    outcome: 'Reliable daily and hourly ingestion for two IoT source systems. Parameterized design cuts future IoT onboarding time.',
    tags: ['Azure Data Factory', 'IoT', 'REST API', 'Pagination', 'Data Ingestion'],
    category: 'data-engineering',
    status: 'completed',
  },
  {
    number: '005',
    title: 'Incident Ticket Automation',
    company: 'SDK Tek Services',
    role: 'Data Engineer',
    summary: 'Power BI report consolidating pipeline failures across data factories via Log Analytics, then auto-generating ServiceNow tickets — shifting the team from triaging to troubleshooting.',
    description:
      'Built a Power BI report that aggregates pipeline failure events across multiple Azure Data Factory environments using Log Analytics Workspaces. The report feeds an automated workflow that generates ServiceNow incident tickets with pre-populated context (pipeline name, failure reason, severity). Previously the team spent hours manually triaging and creating tickets; this automation shifted that time to actual troubleshooting.',
    outcome: 'Eliminated manual triage. Team capacity redirected from ticket creation to root cause resolution.',
    tags: ['Power BI', 'ServiceNow', 'Azure', 'Log Analytics', 'Automation'],
    category: 'automation',
    status: 'completed',
  },
  {
    number: '006',
    title: 'DS&ML Club Workshops',
    company: 'UCalgary — DS&ML Club',
    role: 'Workshop Director',
    summary: 'Interactive technical workshops for 50+ University of Calgary students per session, covering neural networks, data engineering, and cloud analytics.',
    description:
      'As Workshop Director, I design and deliver hands-on sessions covering a rotating curriculum of practical data topics — neural networks, cloud-based data engineering, SQL and Python workflows, and more. Sessions are structured around real datasets and tools students would encounter in industry, not toy examples. I also built an incentive-based engagement system (certificates, skill tournaments) to drive repeat attendance and keep the material challenging.',
    outcome: '90%+ satisfaction and relevance ratings. Consistent 50+ attendees. Strong feedback on practical applicability.',
    tags: ['Teaching', 'Data Science', 'Machine Learning', 'Python', 'Cloud Analytics'],
    category: 'teaching',
    status: 'ongoing',
  },
  // ── Workshop archive (migrated from homepage WorkshopSection) ──
  {
    number: 'W01',
    title: 'Neural Networks from Scratch',
    company: 'UCalgary — DS&ML Club',
    role: 'Workshop Lead',
    summary: 'Live-coding a neural network from scratch in Python — forward pass, backpropagation, gradient descent — then connecting it to PyTorch.',
    description:
      'Walked through building a neural network from scratch in Python — forward pass, backpropagation, gradient descent — then connected it to PyTorch for comparison. Focused on intuition over math notation.',
    outcome: '55+ attendees. Focused on intuition over math notation.',
    tags: ['Python', 'NumPy', 'PyTorch', 'Jupyter'],
    category: 'workshops',
    status: 'completed',
  },
  {
    number: 'W02',
    title: 'Cloud Data Engineering 101',
    company: 'UCalgary — DS&ML Club',
    role: 'Workshop Lead',
    summary: 'End-to-end data journey in the cloud — ingestion, transformation, storage, orchestration — with a live ADF-to-Snowflake demo.',
    description:
      'Covered the end-to-end journey of data in the cloud — ingestion, transformation, storage, and orchestration. Live demo of an Azure Data Factory pipeline pulling from a REST API into a Snowflake warehouse.',
    outcome: '50+ attendees. Live demo of an Azure Data Factory pipeline pulling from a REST API into Snowflake.',
    tags: ['Azure', 'Snowflake', 'Data Factory', 'SQL'],
    category: 'workshops',
    status: 'completed',
  },
  {
    number: 'W03',
    title: 'SQL for Data Science',
    company: 'UCalgary — DS&ML Club',
    role: 'Workshop Lead',
    summary: 'Hands-on lab covering window functions, CTEs, aggregation patterns, and real analytical queries on a shared dataset.',
    description:
      'Interactive session covering window functions, CTEs, aggregation patterns, and real analytical queries. Students worked through exercises on a shared dataset, building from basic selects to complex multi-step analyses.',
    outcome: '60+ attendees. Students built from basic selects to complex multi-step analyses.',
    tags: ['SQL', 'PostgreSQL', 'DBeaver'],
    category: 'workshops',
    status: 'completed',
  },
  {
    number: 'W04',
    title: 'Python for ML Workflows',
    company: 'UCalgary — DS&ML Club',
    role: 'Workshop Lead',
    summary: 'End-to-end ML workflow — data cleaning, feature engineering, model training with scikit-learn, evaluation, and serialization.',
    description:
      'End-to-end ML workflow in Python — data cleaning with pandas, feature engineering, model training with scikit-learn, evaluation metrics, and model serialization. Emphasized reproducibility and clean notebook structure.',
    outcome: '45+ attendees. Emphasized reproducibility and clean notebook structure.',
    tags: ['Python', 'pandas', 'scikit-learn', 'Jupyter'],
    category: 'workshops',
    status: 'completed',
  },
];
