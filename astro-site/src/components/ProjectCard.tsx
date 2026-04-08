import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Project } from '../data/projects';

export default function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      className={`persona-card${open ? ' persona-card--open' : ''}`}
      layout
      transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* ── Always-visible header ── */}
      <button
        className="card-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${open ? 'Collapse' : 'Expand'} ${project.title}`}
      >
        <div className="card-header">
          <h3>{project.title}</h3>
          <div className="card-header-right">
            <span className="card-number">No. {project.number}</span>
            <motion.span
              className="card-chevron"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
              aria-hidden="true"
            >
              ▾
            </motion.span>
          </div>
        </div>

        {/* Company tag + summary always visible */}
        <div className="card-company">{project.company}</div>
        <p className="card-summary">{project.summary}</p>

        <div className="card-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="p5-tag">{tag}</span>
          ))}
        </div>
      </button>

      {/* ── Expandable detail section ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="card-detail"
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card-detail-inner">
              <p className="card-description">{project.description}</p>

              {project.outcome && (
                <div className="card-outcome">
                  <span className="card-outcome-label">Impact</span>
                  <p>{project.outcome}</p>
                </div>
              )}

              {project.link && (
                <a
                  href={project.link}
                  className="card-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project ↗
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
