import { useState, useCallback, useMemo } from 'react';
import type { Project } from '../data/projects';
import { CATEGORY_LABELS } from '../data/projects';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

interface Props {
  projects: Project[];
}

export default function ProjectGrid({ projects }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const openModal = useCallback((p: Project) => setSelected(p), []);
  const closeModal = useCallback(() => setSelected(null), []);

  // Only show categories that actually have projects
  const availableCategories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return Object.entries(CATEGORY_LABELS).filter(
      ([key]) => key === 'all' || cats.has(key as Project['category']),
    );
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <>
      {/* Category filter bar */}
      <nav className="project-filter-bar" aria-label="Filter projects by category">
        {availableCategories.map(([key, label]) => (
          <button
            key={key}
            className={`project-filter-btn${activeFilter === key ? ' project-filter-btn--active' : ''}`}
            onClick={() => setActiveFilter(key)}
            aria-pressed={activeFilter === key}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="compendium-grid">
        {filtered.map((project) => (
          <ProjectCard
            key={project.number}
            project={project}
            onClick={() => openModal(project)}
          />
        ))}
      </div>
      <ProjectModal project={selected} onClose={closeModal} />
    </>
  );
}
