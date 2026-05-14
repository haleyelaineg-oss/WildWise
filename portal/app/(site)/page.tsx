import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import './home.css'
import { ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'WildWise — Helping people help wildlife wisely.',
  description:
    'Found injured wildlife in Michigan? WildWise connects you with licensed rehabilitators fast. Free, confidential, and always available.',
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <img
            className="hero__bg-img"
            src="/assets/logos/full-color-logo-dark.png"
            alt=""
            style={{ transform: 'translate(-25px, -20px)' }}
          />
        </div>

        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow fade-in">
              <span className="hero__eyebrow-line" />
              <span className="hero__eyebrow-text">Est. 2025</span>
              <span className="hero__eyebrow-line" />
            </div>

            <h1 className="hero__h1 fade-in">
              <em>Helping people<br />
              help wildlife</em> wisely.
            </h1>

            <p className="hero__subhead fade-in">
              Wildlife rescue is rooted in kindness, but good intentions can cause serious harm
              without the right knowledge. That's why it's so important to be educated on first response when you've found an animal. WildWise is here to match the right response to the situation and connects finder with licensed
              rehabilitators who can help.
            </p>

            <div className="hero__actions btn-group fade-in">
              <Link href="/found-an-animal" className="btn-primary">
                Get Help Now
              </Link>
              <Link href="/learn" className="btn-secondary btn-secondary--light">
                Learn What to Do First
              </Link>
            </div>
          </div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <ChevronDownIcon />
          <span>Learn More</span>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">We share a home with wildlife</span>
            <h2>Let&apos;s be good neighbors.</h2>
          </div>

          <div className="card-grid card-grid--3 stagger-children">
            <Link href="/found-an-animal" className="feature-card feature-card--steel">
              <div className="feature-card__icon">
                <Image src="/assets/icons/helping-hand.svg" alt="" width={52} height={52} />
              </div>
              <span className="section-label">Found an Animal</span>
              <h3 className="feature-card__title">Get Help Now</h3>
              <div className="feature-card__body">
                <p>Found an injured or orphaned animal? Our guided tool walks you through what to do and connects you with a licensed rehabber near you.</p>
              </div>
              <span className="feature-card__arrow">
                Start here
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>

            <Link href="/learn" className="feature-card feature-card--forest">
              <div className="feature-card__icon">
                <Image src="/assets/icons/book.png" alt="" width={52} height={52} />
              </div>
              <span className="section-label">Helping Animals 101</span>
              <h3 className="feature-card__title">Wildlife Education</h3>
              <div className="feature-card__body">
                <p>Learn when to intervene, when to wait, and what Michigan law says about native wildlife. Proper first response can mean the difference between life and death.</p>
              </div>
              <span className="feature-card__arrow">
                Explore the guides
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>

            <Link href="/verify" className="feature-card feature-card--steel">
              <div className="feature-card__icon">
                <Image src="/assets/icons/hand-paw-prints-icon.png" alt="" width={52} height={52} />
              </div>
              <span className="section-label">Credential Lookup</span>
              <h3 className="feature-card__title">Verify a Rehabber</h3>
              <div className="feature-card__body">
                <p>Before handing off an animal, confirm that your rehabilitator holds a valid DNR permit. Only transfer wildlife to verified, licensed professionals.</p>
              </div>
              <span className="feature-card__arrow">
                Verify up a rehabber
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why licensed rehabbers matter */}
      <section className="section section--navy">
        <div className="container content-grid content-grid--2col" style={{ alignItems: 'center' }}>
          <div>
            <span className="section-label">Why It Matters</span>
            <h2 style={{ color: 'var(--color-cream)', marginTop: 'var(--space-3)' }}>
              Well-meaning help can cause serious harm
            </h2>
            <p style={{ color: 'rgba(247,249,239,0.78)', marginTop: 'var(--space-5)' }}>
              Not all animals found alone need intervention. And even for those who do need help, improper handling stresses animals and can
              cause injuries that endangers their lives.
            </p>
            <p style={{ color: 'rgba(247,249,239,0.78)', marginTop: 'var(--space-4)' }}>
              Licensed rehabilitators know when to intervene, when to leave an animal
              alone, and exactly how to stabilize each species for transport.
            </p>
            <div className="btn-group" style={{ marginTop: 'var(--space-8)' }}>
              <Link href="/learn" className="btn-primary">
                Learn More
              </Link>
              <Link href="/verify" className="btn-secondary btn-secondary--light">
                Verify a Rehabber
              </Link>
            </div>
          </div>

          <div className="card-dark">
            <span className="section-label">Common Mistakes</span>
            <ul style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                ['Feeding wildlife', 'Human food can cause metabolic disease in many species.'],
                ['Giving water', 'Aspiration is a leading cause of death in rescued birds.'],
                ['Taking in "orphans"', 'Most baby animals found alone are not truly abandoned. Parents often leave their young alone while they forage.'],
                ['Relocating', 'Relocating raccoons leaves them with an 18% chance of survival due to starvation, extreme stress, and fighting with existing territorial animals.'],
              ].map(([mistake, reason]) => (
                <li key={mistake} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-olive)',
                      flexShrink: 0,
                      marginTop: 9,
                    }}
                  />
                  <span>
                    <strong style={{ color: 'var(--color-cream)', display: 'block' }}>{mistake}</strong>
                    <span style={{ color: 'rgba(247,249,239,0.65)', fontSize: 'var(--text-sm)' }}>{reason}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Network CTA */}
      <section className="section section--cream">
        <div className="container" style={{ textAlign: 'center', maxWidth: 'var(--container-md)' }}>
          <span className="section-label">Get Involved</span>
          <h2 style={{ marginTop: 'var(--space-3)' }}>Join the WildWise Network!</h2>
          <p style={{ margin: 'var(--space-5) auto 0', color: 'var(--color-text-muted)' }}>
            Whether you&apos;re a licensed rehabilitator, veterinarian, sub-permittee, or looking
            to volunteer, create a profile and become part of Michigan&apos;s wildlife rescue network.
          </p>
          <div className="btn-group" style={{ marginTop: 'var(--space-8)', justifyContent: 'center' }}>
            <Link href="/login?tab=register" className="btn-primary">
              Create a Profile
            </Link>
            <Link href="/learn#michigan-system" className="btn-secondary">
              How the System Works
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
