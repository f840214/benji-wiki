import { Routes, Route } from 'react-router-dom'
import { useAuth } from './store.js'
import Lock from './components/Lock.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Tailwind from './pages/Tailwind.jsx'
import HtmlTags from './pages/HtmlTags.jsx'
import ReactPage from './pages/ReactPage.jsx'
import ReactDomPage from './pages/ReactDomPage.jsx'
import ReactRouterPage from './pages/ReactRouterPage.jsx'
import ZustandPage from './pages/ZustandPage.jsx'
import NexusClientPage from './pages/NexusClientPage.jsx'
import PixiPage from './pages/PixiPage.jsx'
import ColorGameDirsPage from './pages/ColorGameDirsPage.jsx'
import FigmaToReactPage from './pages/FigmaToReactPage.jsx'
import ColorGameLogPage from './pages/ColorGameLogPage.jsx'

export default function App() {
  const unlocked = useAuth((s) => s.unlocked)
  if (!unlocked) return <Lock />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tailwind" element={<Tailwind />} />
        <Route path="/html-tags" element={<HtmlTags />} />
        <Route path="/react" element={<ReactPage />} />
        <Route path="/react-dom" element={<ReactDomPage />} />
        <Route path="/react-router" element={<ReactRouterPage />} />
        <Route path="/zustand" element={<ZustandPage />} />
        <Route path="/nexus-client" element={<NexusClientPage />} />
        <Route path="/pixi" element={<PixiPage />} />
        <Route path="/colorgame-dirs" element={<ColorGameDirsPage />} />
        <Route path="/figma-to-react" element={<FigmaToReactPage />} />
        <Route path="/colorgame-log" element={<ColorGameLogPage />} />
      </Route>
    </Routes>
  )
}
