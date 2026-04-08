import React from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container.jsx'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <img className={styles.logo} src="/ManorLogo.png" alt="MANOR" />
            <div>
              <div className={styles.name}>MANOR</div>
              <div className={styles.caption}>Premium tea. Calm mornings.</div>
            </div>
          </div>
          <p className={styles.copy}>
            A modern, premium tea experience — simple choices, honest quality, and warm service.
          </p>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <div className={styles.colTitle}>Shop</div>
            <Link className={styles.link} to="/products">
              Products
            </Link>
            <Link className={styles.link} to="/gifts">
              Gifts
            </Link>
            <Link className={styles.link} to="/customize-tea">
              Customize Tea
            </Link>
            <Link className={styles.link} to="/offers">
              Offers
            </Link>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Support</div>
            <Link className={styles.link} to="/helpdesk">
              Helpdesk
            </Link>
            <Link className={styles.link} to="/track-order">
              Track Order
            </Link>
            <Link className={styles.link} to="/payments">
              Payments Info
            </Link>
            <Link className={styles.link} to="/contact">
              Contact
            </Link>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Company</div>
            <Link className={styles.link} to="/about">
              About
            </Link>
            <Link className={styles.link} to="/leadership">
              Leadership
            </Link>
            <Link className={styles.link} to="/contact">
              Contact
            </Link>
            <Link className={styles.link} to="/terms">
              Terms
            </Link>
            <Link className={styles.link} to="/privacy">
              Privacy
            </Link>
            <Link className={styles.link} to="/refunds">
              Refunds
            </Link>
            <Link className={styles.link} to="/shipping">
              Shipping
            </Link>
          </div>
        </div>
      </Container>

      <Container className={styles.bottom}>
        <div className={styles.bottomRow}>
          <div className={styles.legal}>© {new Date().getFullYear()} MANOR Tea Company</div>
          <img className={styles.fssai} src="/fsssai logo.png" alt="FSSAI logo" />
        </div>
      </Container>
    </footer>
  )
}
