import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AnimateOnScroll from '@/components/AnimateOnScroll'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
      <AnimateOnScroll />
    </>
  )
}
