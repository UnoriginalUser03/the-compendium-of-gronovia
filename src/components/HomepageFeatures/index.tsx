import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  to: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Catch up on Sessions',
    Svg: require('@site/static/img/campfire.svg').default,
    description: (
      <>
        Missed a session? Read session recaps to see who was at the table and the character decisions that shaped the story.
      </>
    ),
    to: '/sessions',
  },
  {
    title: 'Explore the World',
    Svg: require('@site/static/img/castle.svg').default,
    description: (
      <>
        Explore the world of Gronovia and dive deep into the lore of its locations, culture, factions, and history.
      </>
    ),
    to: '/compendium'
  },
  {
    title: 'Meet the Characters',
    Svg: require('@site/static/img/flying-dragon.svg').default,
    description: (
      <>
        Learn about the unique characters of Gronovia, their backgrounds, motivations, and roles in the story.
      </>
    ),
    to: '/compendium'
  },
];

function Feature({ title, Svg, description, to }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={to} className={styles.featureLink}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" fill="var(--ifm-font-color-base)" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}


export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
