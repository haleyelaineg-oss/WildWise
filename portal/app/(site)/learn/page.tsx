import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learn — WildWise',
  description:
    'Understand Michigan\'s wildlife rehabilitation system, common species, and what to do when you find an injured animal.',
}

export default function LearnPage() {
  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="container page-hero__inner">
          <span className="section-label">Wildlife Education</span>
          <h1>Michigan Wildlife — What You Need to Know</h1>
          <p className="lead">
            Michigan is home to hundreds of native wildlife species. Understanding the
            rules, the biology, and the rehabilitation system can mean the difference
            between an animal&apos;s life and death.
          </p>
        </div>
      </div>

      {/* What to do first */}
      <section className="section section--white">
        <div className="container content-grid content-grid--sidebar">
          <div className="prose">
            <span className="section-label">First Response</span>
            <h2>What to do when you find an animal</h2>

            <div className="timeline" style={{ marginTop: 'var(--space-8)' }}>
              {[
                {
                  n: '1',
                  title: 'Observe before you act',
                  body: 'Watch for 30–60 minutes from a distance. Many animals that appear injured or abandoned are not — parents are often nearby. Movement and loud noises will keep them away.',
                },
                {
                  n: '2',
                  title: 'Assess the situation',
                  body: 'A baby animal on the ground without feathers or fur, an animal that cannot move away from you, or one that is visibly bleeding or injured needs help. "Fledglings" (young birds with some feathers) are usually learning to fly and should be left alone.',
                },
                {
                  n: '3',
                  title: 'Contain safely — do not feed or water',
                  body: 'Place the animal in a cardboard box with air holes and a towel in the bottom. Keep it dark, warm, and quiet. Do not feed it or give it water — this can cause aspiration or metabolic shock.',
                },
                {
                  n: '4',
                  title: 'Contact a licensed rehabilitator',
                  body: 'Use WildWise\'s "Found an Animal" tool to get connected with a licensed rehabber near you. You can also call the DNR at 1-800-292-7800.',
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="timeline__item">
                  <div className="timeline__number">{n}</div>
                  <h3 className="timeline__title">{title}</h3>
                  <p className="timeline__body">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--space-6))' }}>
              <span className="section-label">Need Help Now?</span>
              <h3 className="card__title" style={{ marginBottom: 'var(--space-4)' }}>Found an injured animal?</h3>
              <p className="card__body">Use our guided tool to get matched with a licensed rehabber in your area.</p>
              <Link href="/found-an-animal" className="btn-primary" style={{ marginTop: 'var(--space-5)', display: 'inline-flex' }}>
                Get Help Now
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Michigan system explainer */}
      <section id="michigan-system" className="section section--cream">
        <div className="container">
          <div className="section-header">
            <span className="section-label">The System</span>
            <h2>How Michigan wildlife rehabilitation works</h2>
            <p>
              Michigan&apos;s wildlife rehabilitation system is a network of licensed individuals
              operating under the Michigan Department of Natural Resources (DNR).
            </p>
          </div>

          <div className="card-grid card-grid--2" style={{ maxWidth: 'var(--container-lg)' }}>
            {[
              {
                title: 'Licensed Rehabilitators',
                body: 'Primary permit holders. They have passed training requirements and hold an DNR Wildlife Rehabilitation Permit. They are responsible for all animals in their care and for supervising sub-permittees.',
              },
              {
                title: 'Sub-permittees',
                body: 'Individuals who work under a licensed rehabber\'s permit. They can receive and care for animals but must be affiliated with and supervised by their sponsoring rehabber.',
              },
              {
                title: 'Transport Volunteers',
                body: 'Volunteers who transport animals from finders to rehabilitators. They do not provide care — only safe, covered transport. No permit required, but training is recommended.',
              },
              {
                title: 'Licensed Veterinarians',
                body: 'Vets who partner with the rehabilitation system to provide medical care. They can treat wildlife without a separate rehab permit when working with a licensed rehabber.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="card">
                <h3 className="card__title">{title}</h3>
                <p className="card__body">{body}</p>
              </div>
            ))}
          </div>

          <div className="pull-quote" style={{ maxWidth: 'var(--container-md)', marginTop: 'var(--space-12)' }}>
            <p>
              Keeping native wildlife without a permit is a violation of the Michigan Natural
              Resources and Environmental Protection Act, even if your intentions are good.
            </p>
            <cite>Michigan DNR, Wildlife Division</cite>
          </div>
        </div>
      </section>

      {/* Common species */}
      <section className="section section--white">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Common Species</span>
            <h2>Wildlife you might encounter in Michigan</h2>
          </div>

          <div className="mistake-grid">
            {[
              {
                num: '01',
                label: 'Birds',
                title: 'Songbirds & Raptors',
                body: 'Window strikes are the #1 cause of songbird injuries. Raptors are often hit by vehicles. Both require species-specific care — never attempt to feed.',
                fix: 'Place in a dark, ventilated box. Do not wear gloves with small birds — the pressure can injure them.',
              },
              {
                num: '02',
                label: 'Mammals',
                title: 'Deer, Rabbits & Squirrels',
                body: 'Baby cottontails with eyes open and ears up are usually independent. White-tailed deer fawns found alone are almost always NOT abandoned — mothers leave fawns for hours at a time.',
                fix: 'Leave fawns alone unless they are crying, injured, or you\'ve confirmed the doe has been killed.',
              },
              {
                num: '03',
                label: 'Waterfowl',
                title: 'Ducks, Geese & Herons',
                body: 'Fishing line entanglement is the most common waterfowl emergency. Herons and bitterns are dangerous to handle — their bills can cause serious eye injuries.',
                fix: 'Wear eye protection when handling herons. Use a towel to wrap the bird and pin the bill.',
              },
              {
                num: '04',
                label: 'Reptiles',
                title: 'Turtles & Snakes',
                body: 'Turtles hit by cars may look dead but often survive with care. If you move a turtle off a road, always move it in the direction it was heading — never relocate it.',
                fix: 'Snapping turtles require careful handling. Use a blunt object to guide them, never pick up by the tail.',
              },
            ].map(({ num, label, title, body, fix }) => (
              <div key={num} className="mistake-card">
                <div className="mistake-card__number">{num}</div>
                <span className="section-label">{label}</span>
                <h3 className="mistake-card__title">{title}</h3>
                <p className="mistake-card__body">{body}</p>
                <div className="mistake-card__fix">
                  <strong>Quick tip</strong>
                  {fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
