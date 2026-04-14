import { memo } from 'react';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
  onClick: () => void;
}

function ProjectCard({ project, onClick }: Props) {
  return (
    <article
      className={`persona-card${project.featured ? ' persona-card--featured' : ''}`}
    >
      <button
        className="card-toggle"
        onClick={onClick}
        aria-label={`View details for ${project.title}`}
      >
        <div className="card-header">
          <h3>{project.title}</h3>
          <div className="card-header-right">
            <span className="card-number">No. {project.number}</span>
          </div>
        </div>

        <div className="card-company">{project.company}</div>
        {project.role && <div className="card-role">{project.role}</div>}
        <p className="card-summary">{project.summary}</p>

        <div className="card-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="p5-tag">{tag}</span>
          ))}
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
