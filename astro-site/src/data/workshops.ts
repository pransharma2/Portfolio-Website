export interface Workshop {
  title: string;
  audience: string;
  topic: string;
  format: string;
  attendance: string;
  summary: string;
  tools: string[];
  slidesLink?: string;
}

export const workshops: Workshop[] = [
  {
    title: 'Neural Networks from Scratch',
    audience: 'DS&ML Club Members',
    topic: 'Deep Learning Fundamentals',
    format: 'Live Coding + Slides',
    attendance: '55+',
    summary:
      'Walked through building a neural network from scratch in Python — forward pass, backpropagation, gradient descent — then connected it to PyTorch for comparison. Focused on intuition over math notation.',
    tools: ['Python', 'NumPy', 'PyTorch', 'Jupyter'],
  },
  {
    title: 'Cloud Data Engineering 101',
    audience: 'DS&ML Club Members',
    topic: 'Data Pipelines & Cloud',
    format: 'Workshop + Demo',
    attendance: '50+',
    summary:
      'Covered the end-to-end journey of data in the cloud — ingestion, transformation, storage, and orchestration. Live demo of an Azure Data Factory pipeline pulling from a REST API into a Snowflake warehouse.',
    tools: ['Azure', 'Snowflake', 'Data Factory', 'SQL'],
  },
  {
    title: 'SQL for Data Science',
    audience: 'DS&ML Club Members',
    topic: 'Analytical SQL',
    format: 'Hands-on Lab',
    attendance: '60+',
    summary:
      'Interactive session covering window functions, CTEs, aggregation patterns, and real analytical queries. Students worked through exercises on a shared dataset, building from basic selects to complex multi-step analyses.',
    tools: ['SQL', 'PostgreSQL', 'DBeaver'],
  },
  {
    title: 'Python for ML Workflows',
    audience: 'DS&ML Club Members',
    topic: 'Applied ML',
    format: 'Live Coding + Q&A',
    attendance: '45+',
    summary:
      'End-to-end ML workflow in Python — data cleaning with pandas, feature engineering, model training with scikit-learn, evaluation metrics, and model serialization. Emphasized reproducibility and clean notebook structure.',
    tools: ['Python', 'pandas', 'scikit-learn', 'Jupyter'],
  },
];
