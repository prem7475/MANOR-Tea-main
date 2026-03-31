import React from 'react'
import styles from './AboutPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Container from '../components/ui/Container.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function AboutPage() {
  useDocumentTitle('About')

  return (
    <div className={styles.page}>
      <PageShell
        title="Our story"
        subtitle="MANOR is built around one idea: premium tea should feel simple, calm, and trustworthy."
      >
        <div className={styles.grid}>
          <Card className={styles.card}>
            <div className={styles.kicker}>What we stand for</div>
            <h2 className={styles.h2}>Premium without complexity</h2>
            <p className={styles.p}>
              We focus on consistent flavour, honest sourcing, and clean packaging — so you can choose
              quickly and enjoy daily.
            </p>
          </Card>

          <Card className={styles.card}>
            <div className={styles.kicker}>How we craft</div>
            <h2 className={styles.h2}>Fresh, balanced, reliable</h2>
            <p className={styles.p}>
              Every blend is designed for aroma, body, and a clean finish — strong enough for milk,
              elegant enough to enjoy straight.
            </p>
          </Card>
        </div>
      </PageShell>

      <section className={styles.mediaSection}>
        <Container className={styles.mediaInner}>
          <div className={styles.mediaText}>
            <div className={styles.kicker}>The MANOR experience</div>
            <h2 className={styles.h2}>From leaf to cup</h2>
            <p className={styles.p}>
              Sourcing, processing, and packing are handled with care — to protect freshness, preserve
              aroma, and deliver the same premium cup every time.
            </p>
          </div>
          <div className={styles.media}>
            <img className={styles.image} src="/manor bg 1.jpg" alt="Tea leaves and warm tones" loading="lazy" />
          </div>
        </Container>
      </section>

      <Container className={styles.steps}>
        <Card className={styles.step}>
          <div className={styles.kicker}>01</div>
          <div className={styles.stepTitle}>Sourcing</div>
          <div className={styles.stepText}>Leaves selected for aroma and consistency across brews.</div>
        </Card>
        <Card className={styles.step}>
          <div className={styles.kicker}>02</div>
          <div className={styles.stepTitle}>Blending</div>
          <div className={styles.stepText}>Balanced profiles — bold where needed, smooth where it matters.</div>
        </Card>
        <Card className={styles.step}>
          <div className={styles.kicker}>03</div>
          <div className={styles.stepTitle}>Packing</div>
          <div className={styles.stepText}>Packed to preserve freshness and protect the tasting notes.</div>
        </Card>
      </Container>
    </div>
  )
}

