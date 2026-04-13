import { useState, useCallback } from 'react';
import type { Project } from '../data/projects';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

interface Props {
  projects: Project[];
}

export default function ProjectGrid({ projects }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);

  const openModal = useCallback((p: Project) => setSelected(p), []);
  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="compendium-grid">
        {projects.map((project) => (
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
