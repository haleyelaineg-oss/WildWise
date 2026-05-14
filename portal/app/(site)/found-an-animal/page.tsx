import type { Metadata } from 'next'
import DecisionTree from './DecisionTree'

export const metadata: Metadata = {
  title: 'Found an Animal — WildWise',
  description:
    'Step-by-step guidance for Michigan wildlife emergencies. Connect with a licensed rehabilitator near you.',
}

export default function FoundAnAnimalPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-cream)',
        paddingTop: 'var(--nav-height)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DecisionTree />
    </div>
  )
}
