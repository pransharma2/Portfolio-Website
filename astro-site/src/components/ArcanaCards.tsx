import { useState } from 'react';
import { motion } from 'motion/react';

interface ArcanaCard {
  id: number;
  arcana: string;
  title: string;
  description: string;
  image: string;
}

const cards: ArcanaCard[] = [
  {
    id: 1,
    arcana: 'Arcana I',
    title: 'Knowledge',
    description: 'Turns messy signals into clean decisions.',
    image: '/img/fixed_traits_from_user/knowledge.png',
  },
  {
    id: 2,
    arcana: 'Arcana II',
    title: 'Proficiency',
    description: 'Builds usable tools instead of dead-end demos.',
    image: '/img/fixed_traits_from_user/Proficiency.png',
  },
  {
    id: 3,
    arcana: 'Arcana III',
    title: 'Charm',
    description: 'Prefers systems that keep working after launch.',
    image: '/img/fixed_traits_from_user/charm.png',
  },
  {
    id: 4,
    arcana: 'Arcana IV',
    title: 'Guts',
    description: 'Maps the route before pushing data into motion.',
    image: '/img/fixed_traits_from_user/Guts.png',
  },
  {
    id: 5,
    arcana: 'Arcana V',
    title: 'Kindness',
    description: 'Focuses on shipping clear outcomes fast.',
    image: '/img/fixed_traits_from_user/Kindness.png',
  },
];

function ArcanaCard({ card }: { card: ArcanaCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.article
      className="arcana-card"
      onClick={() => setIsFlipped(!isFlipped)}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="arcana-card-inner"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front — trait icon */}
        <div className="arcana-card-face arcana-card-front">
          <img
            src={card.image}
            alt={card.title}
            loading="lazy"
          />
          <span className="arcana-flip-hint">Flip</span>
        </div>

        {/* Back — description */}
        <div className="arcana-card-face arcana-card-back">
          <span className="arcana-rank">{card.arcana}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function ArcanaCards() {
  return (
    <section className="arcana-section">
      <div className="page-banner">
        <h2>Arcana Deck</h2>
      </div>
      <div className="arcana-grid">
        {cards.map((card) => (
          <ArcanaCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
