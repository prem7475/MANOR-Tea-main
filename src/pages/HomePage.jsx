import React, { useMemo } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

import styles from './HomePage.module.css'
import Container from '../components/ui/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import { getAllProducts, getProductsByCategory } from '../services/catalogService.js'
import { offers } from '../assets/data/offers.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function HomePage() {
  useDocumentTitle('Home')

  const featured = useMemo(() => getAllProducts().filter((p) => p.inStock).slice(0, 4), [])

  const bestSellers = useMemo(() => {
    const all = getAllProducts()
    const byTag = all.filter((p) => p.tags?.includes('bestSeller') && p.inStock)
    return (byTag.length ? byTag : all.filter((p) => p.inStock)).slice(0, 4)
  }, [])

  const giftPreview = useMemo(() => getProductsByCategory('gift').slice(0, 3), [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/3.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />

        <Container className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} />
            Premium. Calm. Trusted.
          </div>
          <h1 className={styles.heroTitle}>MANOR</h1>
          <p className={styles.heroSubtitle}>The Tea of Your Morning</p>
          <p className={styles.heroLead}>
            A premium tea experience designed for clarity — elegant choices, warm tones, and a smooth purchase flow.
          </p>

          <div className={styles.heroActions}>
            <Button to="/products" size="lg">
              Shop Premium Tea <ArrowRight size={18} />
            </Button>
            <Button to="/customize-tea" variant="outline" size="lg">
              Customize Your Tea
            </Button>
          </div>

          <div className={styles.heroNote}>Free delivery above ₹499 · Easy checkout · Mock payment UI</div>
        </Container>
      </section>

      <Container className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured products</h2>
          <p className={styles.sectionDesc}>A clean, premium selection to start with.</p>
        </div>
        <div className={styles.grid}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>

      <Container className={styles.section}>
        <div className={styles.whyGrid}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why MANOR</h2>
            <p className={styles.sectionDesc}>Trust-based, premium storytelling — without clutter.</p>
          </div>

          <div className={styles.promiseGrid}>
            <Card className={styles.promiseCard}>
              <div className={styles.promiseTitle}>Quality first</div>
              <div className={styles.promiseText}>Designed for consistent flavour across brews.</div>
            </Card>
            <Card className={styles.promiseCard}>
              <div className={styles.promiseTitle}>Clean packaging</div>
              <div className={styles.promiseText}>Packed to preserve freshness and aroma.</div>
            </Card>
            <Card className={styles.promiseCard}>
              <div className={styles.promiseTitle}>Easy buying</div>
              <div className={styles.promiseText}>Two clicks to any product. Clear checkout.</div>
            </Card>
            <Card className={styles.promiseCard}>
              <div className={styles.promiseTitle}>Real support</div>
              <div className={styles.promiseText}>Helpdesk + tracking flow that feels human.</div>
            </Card>
          </div>
        </div>
      </Container>

      <Container className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Best sellers</h2>
          <p className={styles.sectionDesc}>Loved for comfort, aroma, and consistency.</p>
        </div>
        <div className={styles.grid}>
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>

      <section className={styles.story}>
        <Container className={styles.storyInner}>
          <div className={styles.storyCard}>
            <div className={styles.storyKicker}>Customize Tea Bag</div>
            <h2 className={styles.storyTitle}>Make it yours</h2>
            <p className={styles.storyText}>
              Select the tea type, strength, flavours, and packaging — see a live summary and add your custom tea
              bag to cart in one click.
            </p>
            <Button to="/customize-tea" variant="secondary">
              Customize your tea
            </Button>
          </div>
        </Container>
      </section>

      <Container className={styles.section}>
        <div className={styles.split}>
          <div className={styles.splitLeft}>
            <h2 className={styles.sectionTitle}>Gift hampers</h2>
            <p className={styles.sectionDesc}>
              Curated hampers with premium packaging — made for tasteful gifting.
            </p>
            <div className={styles.splitActions}>
              <Button to="/gifts" variant="secondary">
                Explore gifts
              </Button>
              <Button to="/offers" variant="ghost">
                View offers
              </Button>
            </div>
          </div>
          <div className={styles.splitRight}>
            <div className={styles.giftGrid}>
              {giftPreview.map((p) => (
                <Card key={p.id} className={styles.giftCard}>
                  <img className={styles.giftImg} src={p.image} alt="" loading="lazy" />
                  <div className={styles.giftBody}>
                    <div className={styles.giftName}>{p.name}</div>
                    <div className={styles.giftText}>{p.subtitle}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Offers</h2>
          <p className={styles.sectionDesc}>Simple rules, clear savings.</p>
        </div>
        <div className={styles.offerGrid}>
          {offers.slice(0, 3).map((o) => (
            <Card key={o.id} className={styles.offerCard}>
              <Badge tone="accent">{o.code}</Badge>
              <div className={styles.offerTitle}>{o.title}</div>
              <div className={styles.offerText}>{o.description}</div>
              <Button to="/offers" variant="secondary" size="sm">
                View details
              </Button>
            </Card>
          ))}
        </div>
      </Container>

      <Container className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Testimonials</h2>
          <p className={styles.sectionDesc}>Simple, honest experiences (mock).</p>
        </div>
        <div className={styles.testimonials}>
          {[
            { name: 'Anita', text: 'Feels premium and simple. The checkout is clean and fast.' },
            { name: 'Rahul', text: 'Strong flavour, great aroma. Loved the gift packaging.' },
            { name: 'Meera', text: 'The custom tea builder is a lovely touch — easy to use.' },
          ].map((t) => (
            <Card key={t.name} className={styles.quote}>
              <div className={styles.quoteText}>“{t.text}”</div>
              <div className={styles.quoteBy}>— {t.name}</div>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  )
}
