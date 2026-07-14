// packages/web/src/App.jsx
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import WhyAvalanche from './components/WhyAvalanche'
import ValueProposition from './components/ValueProposition'
import NodeRunr from './components/NodeRunr'
import ECash from './components/ECash'
import Team from './components/Team'
import Roadmap from './components/Roadmap'
import CTA from './components/CTA'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-white text-gray-800">
      <Nav />
      <Hero />
      <About />
      <WhyAvalanche />
      <ValueProposition />
      <NodeRunr />
      <ECash />
      <Team />
      <Roadmap />
      <CTA />
      <Footer />
    </div>
  )
}

export default App
