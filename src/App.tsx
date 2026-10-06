import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { StoreProvider } from './store/store'
import { Toasts, Empty } from './components/ui'
import PublicLayout from './layouts/PublicLayout'
import PortalLayout from './layouts/PortalLayout'
import Home from './pages/public/Home'
import Programs from './pages/public/Programs'
import ProgramDetail from './pages/public/ProgramDetail'
import DemoSelect from './pages/public/DemoSelect'
import LearnerHome from './pages/learner/LearnerHome'
import LearnerProgram from './pages/learner/LearnerProgram'
import LessonPage from './pages/learner/LessonPage'
import Academic from './pages/learner/Academic'
import TrainerHome from './pages/trainer/TrainerHome'
import SectionPage from './pages/trainer/SectionPage'
import AdminOverview from './pages/admin/AdminOverview'
import Education from './pages/admin/Education'
import LearnersAdmin from './pages/admin/LearnersAdmin'
import Operations from './pages/admin/Operations'

function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 16px' }}>
      <Empty title="الصفحة غير موجودة" text="الرابط غير متاح في هذا النموذج." action={<Link to="/" className="btn btn-primary">العودة للرئيسية</Link>} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/demo" element={<DemoSelect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<PortalLayout />}>
            <Route path="/learner" element={<LearnerHome />} />
            <Route path="/learner/program/:id" element={<LearnerProgram />} />
            <Route path="/learner/lesson/:id" element={<LessonPage />} />
            <Route path="/learner/academic" element={<Academic />} />
            <Route path="/trainer" element={<TrainerHome />} />
            <Route path="/trainer/sections/:id" element={<SectionPage />} />
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/education" element={<Education />} />
            <Route path="/admin/learners" element={<LearnersAdmin />} />
            <Route path="/admin/operations" element={<Operations />} />
          </Route>
        </Routes>
        <Toasts />
      </BrowserRouter>
    </StoreProvider>
  )
}
