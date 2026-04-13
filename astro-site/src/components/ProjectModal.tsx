import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Project } from '../data/projects';

interface Props {
  project: Project | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Complete',
  'in-progress': 'In Progress',
  ongoing: 'Ongoing',
};

export default function ProjectModal({ project, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const scrollY = useRef(0);

  // Lock body scroll when modal opens, restore on close
  useEffect(() => {
    if (project) {
      scrollY.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY.current}px`;
      document.body.style.width = '100%';
      // Focus the close button for keyboard users
      requestAnimationFrame(() => closeBtn.current?.focus());
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY.current);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [project]);

  // ESC to close
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, onClose]);

  // Focus trap
  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !overlayRef.current) return;
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  useEffect(() => {
    if (!project) return;
    window.addEventListener('keydown', trapFocus);
    return () => window.removeEventListener('keydown', trapFocus);
  }, [project, trapFocus]);

  // Backdrop click
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const duration = prefersReduced ? 0 : 0.35;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          ref={overlayRef}
          className="project-modal-overlay"
          onClick={onBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.6 }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            className="project-modal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Close button */}
            <button
              ref={closeBtn}
              className="project-modal-close"
              onClick={onClose}
              aria-label="Close project details"
            >
              &times;
            </button>

            {/* Header */}
            <div className="project-modal-header">
              <span className="project-modal-number">No. {project.number}</span>
              <h2 className="project-modal-title">{project.title}</h2>
              <div className="project-modal-meta">
                <span className="project-modal-company">{project.company}</span>
                {project.role && (
                  <span className="project-modal-role">{project.role}</span>
                )}
                {project.status && (
                  <span className={`project-modal-status project-modal-status--${project.status}`}>
                    {STATUS_LABEL[project.status] ?? project.status}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="project-modal-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="p5-tag">{tag}</span>
              ))}
            </div>

            {/* Body */}
            <div className="project-modal-body">
              <p className="project-modal-summary">{project.summary}</p>
              <p className="project-modal-description">{project.description}</p>

              {/* Outcome */}
              {project.outcome && (
                <div className="project-modal-outcome">
                  <span className="project-modal-outcome-label">Impact</span>
                  <p>{project.outcome}</p>
                </div>
              )}

              {/* Screenshots */}
              {project.images && project.images.length > 0 && (
                <div className="project-modal-gallery">
                  {project.images.map((src, i) => (
                    <figure key={src} className="project-modal-figure">
                      <img
                        src={src}
                        alt={project.imageCaptions?.[i] ?? `${project.title} screenshot ${i + 1}`}
                        loading="lazy"
                      />
                      {project.imageCaptions?.[i] && (
                        <figcaption>{project.imageCaptions[i]}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}

              {/* Architecture Diagram */}
              {project.architectureDiagram && (
                <figure className="project-modal-arch">
                  <img
                    src={project.architectureDiagram}
                    alt={project.architectureCaption ?? `${project.title} architecture diagram`}
                    loading="lazy"
                  />
                  {project.architectureCaption && (
                    <figcaption>{project.architectureCaption}</figcaption>
                  )}
                </figure>
              )}

              {/* Link */}
              {project.link && (
                <a
                  href={project.link}
                  className="project-modal-link p5-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project &#8599;
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
