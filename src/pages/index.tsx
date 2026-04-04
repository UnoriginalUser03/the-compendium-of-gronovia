import { useEffect, useState, useRef, type ReactNode, use } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import Heading from '@theme/Heading';
import { motion } from 'framer-motion';
import Logo from '@site/static/img/logo.svg';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';
// @ts-ignore
import CLOUDS2 from 'vanta/dist/vanta.clouds2.min';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [vantaEffect, setVantaEffect] = useState(null);
  const texture = useBaseUrl('/img/noise.jpg');
  const myRef = useRef(null);
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(CLOUDS2({
        el: myRef.current,
        texturePath: texture,
        scale: 1.0,
      }))
    }
    return () => {
      if (vantaEffect) setVantaEffect(null);
    }
  }, [vantaEffect])
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} ref={myRef}>
      <div className={clsx("container", styles.heroInner)}>

        <motion.div
          className={styles.heroLogo}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Logo />
        </motion.div>


        <div className={styles.heroText}>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, type: 'tween' }}
            className="hero__title"
          >
            {siteConfig.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero__subtitle"
          >
            {siteConfig.tagline}
          </motion.p>

          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/compendium">
              Explore the Compendium ➜
            </Link>
          </div>
        </div>

      </div>
    </header>

  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
