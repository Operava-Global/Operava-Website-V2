import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './site/Layout'
import CookieNotice from './site/CookieNotice'

import Home from './pages/Home'
import ServicesHub from './pages/ServicesHub'
import ServiceCategory from './pages/ServiceCategory'
import ServiceDetail from './pages/ServiceDetail'
import EngagementModels from './pages/EngagementModels'
import Industries from './pages/Industries'
import IndustryDetail from './pages/IndustryDetail'
import Insights from './pages/Insights'
import InsightCategory from './pages/InsightCategory'
import InsightArticle from './pages/InsightArticle'
import Careers from './pages/Careers'
import CareerRole from './pages/CareerRole'
import LifeAtOperava from './pages/LifeAtOperava'
import HiringProcess from './pages/HiringProcess'
import TalentDevelopment from './pages/TalentDevelopment'
import Apply from './pages/Apply'
import About from './pages/About'
import OperatingPhilosophy from './pages/OperatingPhilosophy'
import RemoteFirstModel from './pages/RemoteFirstModel'
import CorporateRegistration from './pages/CorporateRegistration'
import Contact from './pages/Contact'
import Partnership from './pages/Partnership'
import Quote from './pages/Quote'
import Contacts from './pages/Contacts'
import Faq from './pages/Faq'
import Verification from './pages/Verification'
import PaymentPortal from './pages/PaymentPortal'
import NotFound from './pages/NotFound'

// Long documents and standalone tools load on demand
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const Academy = lazy(() => import('./pages/Academy'))
const Learning = lazy(() => import('./pages/Learning'))
const OutsourcingRisks = lazy(() => import('./pages/OutsourcingRisks'))
const AvaScreening = lazy(() => import('./pages/AvaScreening'))
const RecruitmentAdmin = lazy(() => import('./pages/RecruitmentAdmin'))

function Loading() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Services */}
            <Route path="/services" element={<ServicesHub />} />
            <Route path="/services/engagement-models" element={<EngagementModels />} />
            <Route path="/services/:cat" element={<ServiceCategory />} />
            <Route path="/services/:cat/:slug" element={<ServiceDetail />} />

            {/* Industries */}
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:slug" element={<IndustryDetail />} />

            {/* Insights */}
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/outsourcing-risks" element={<OutsourcingRisks />} />
            <Route path="/insights/:categorySlug" element={<InsightCategory />} />
            <Route path="/insights/:categorySlug/:articleSlug" element={<InsightArticle />} />

            {/* Careers */}
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/roles/:roleSlug" element={<CareerRole />} />
            <Route path="/careers/life-at-operava" element={<LifeAtOperava />} />
            <Route path="/careers/hiring-process" element={<HiringProcess />} />
            <Route path="/careers/talent-development" element={<TalentDevelopment />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/ai-job-screening" element={<Navigate to="/careers/hiring-process" replace />} />
            {/* New, invitation-only Ava Screening. Do not promote in public navigation. */}
            <Route path="/ava-screening/*" element={<AvaScreening />} />
            <Route path="/applicant-portal/*" element={<AvaScreening />} />
            {/* Hidden recruitment admin route. Protected at Cloudflare Access AND the Pages Function origin. */}
            <Route path="/recruitment-admin/*" element={<RecruitmentAdmin />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/learnings" element={<Learning />} />

            {/* About */}
            <Route path="/about" element={<About />} />
            <Route path="/about/operating-philosophy" element={<OperatingPhilosophy />} />
            <Route path="/about/remote-first-model" element={<RemoteFirstModel />} />
            <Route path="/about/corporate-registration" element={<CorporateRegistration />} />

            {/* Contact & portals */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/partnerships" element={<Partnership />} />
            <Route path="/partnership" element={<Navigate to="/partnerships" replace />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/request-a-quote" element={<Quote />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/payment-portal" element={<PaymentPortal />} />
            <Route path="/payment" element={<PaymentPortal />} />
            <Route path="/pay" element={<PaymentPortal />} />
            <Route path="/client-portal/payment" element={<PaymentPortal />} />

            {/* Legal */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/refundpolicy" element={<RefundPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <CookieNotice />
    </BrowserRouter>
  )
}
