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

  // Filter then sort by date (newest first)
  const filtered = useMemo(() => {
    let result = activeFilter === 'all'
      ? [...projects]
      : projects.filter((p) => p.category === activeFilter);
    result.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return result;
  }, [projects, activeFilter]);

  // Split into main projects and professional highlights
  const mainProjects = useMemo(
    () => filtered.filter((p) => p.category !== 'professional'),
    [filtered],
  );
  const proHighlights = useMemo(
    () => filtered.filter((p) => p.category === 'professional'),
    [filtered],
  );

  const showProSection = activeFilter === 'all' || activeFilter === 'professional';

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

      {/* Main project grid */}
      {mainProjects.length > 0 && (
        <div className="compendium-grid">
          {mainProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => openModal(project)}
            />
          ))}
        </div>
      )}

      {/* Professional Highlights section */}
      {showProSection && proHighlights.length > 0 && (
        <section className="professional-highlights">
          <h2 className="professional-highlights-title">Professional Highlights</h2>
          <p className="professional-highlights-subtitle">
            Selected impact from employer-owned work — details kept concise to respect confidentiality.
          </p>
          <div className="compendium-grid compendium-grid--compact">
            {proHighlights.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => openModal(project)}
              />
            ))}
          </div>
        </section>
      )}

      <ProjectModal project={selected} onClose={closeModal} />
    </>
  );
}
