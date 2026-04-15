import { memo } from 'react';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
  onClick: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  workshops: 'Workshop',
  teaching: 'Teaching',
  'public-projects': 'Project',
  professional: 'Professional',
};

function ProjectCard({ project, onClick }: Props) {
  return (
    <article
      className={`persona-card${project.featured ? ' persona-card--featured' : ''}${project.category === 'professional' ? ' persona-card--professional' : ''}`}
    >
      <button
        className="card-toggle"
        onClick={onClick}
        aria-label={`View details for ${project.title}`}
      >
        <div className="card-header">
          <h3>{project.title}</h3>
          <div className="card-header-right">
            <span className="card-category-pill">{CATEGORY_LABEL[project.category] ?? project.category}</span>
          </div>
        </div>

        <div className="card-meta-row">
          <span className="card-company">{project.company}</span>
          <span className="card-date">{project.date}</span>
        </div>

        {project.role && <div className="card-role">{project.role}</div>}
        <p className="card-summary">{project.summary}</p>

        <div className="card-tags">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="p5-tag">{tag}</span>
          ))}
          {project.tags.length > 4 && (
            <span className="p5-tag p5-tag--more">+{project.tags.length - 4}</span>
          )}
        </div>

        {project.status && (
          <span className={`card-status card-status--${project.status}`}>
            {project.status === 'in-progress' ? 'In Progress' : project.status === 'ongoing' ? 'Ongoing' : 'Complete'}
          </span>
        )}
      </button>
    </article>
  );
}

export default memo(ProjectCard);
