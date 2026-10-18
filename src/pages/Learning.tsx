import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Search, Play, ExternalLink, X, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs } from '../site/ui'

type Topic = 'AI' | 'Automation' | 'Programming' | 'Data'
type Video = {
  id: string
  title: string
  publisher: string
  topic: Topic
  level: 'Beginner' | 'Intermediate'
  description: string
  outcome: string
}
const videos: Video[] = [
  {
    id: 'k7HaeJs-N-o',
    title: 'Generative AI for Beginners — Full Series',
    publisher: 'Microsoft Developer',
    topic: 'AI',
    level: 'Beginner',
    description: 'An 18-part introduction to generative AI, prompting, application building, responsible AI, retrieval, and agents.',
    outcome: 'Explain the building blocks of generative AI and sketch a responsible AI assistant.',
  },
  {
    id: 'i_LwzRVP7bg',
    title: 'Machine Learning for Everybody',
    publisher: 'freeCodeCamp.org',
    topic: 'AI',
    level: 'Beginner',
    description: 'Learn model training, classification, regression, neural networks, and unsupervised learning.',
    outcome: 'Identify the right machine learning approach for a simple business problem.',
  },
  {
    id: 'rfscVS0vtbw',
    title: 'Python — Full Course for Beginners',
    publisher: 'freeCodeCamp.org',
    topic: 'Programming',
    level: 'Beginner',
    description: 'Build Python foundations with variables, loops, functions, collections, files, and projects.',
    outcome: 'Write a simple script to automate a repetitive task.',
  },
  {
    id: 'PkZNo7MFNFg',
    title: 'JavaScript — Full Course for Beginners',
    publisher: 'freeCodeCamp.org',
    topic: 'Programming',
    level: 'Beginner',
    description: 'A practical introduction to JavaScript syntax, variables, functions, arrays, and logic.',
    outcome: 'Create the logic for an interactive web application.',
  },
  {
    id: 'Oe421EPjeBE',
    title: 'Node.js and Express.js — Full Course',
    publisher: 'freeCodeCamp.org',
    topic: 'Programming',
    level: 'Intermediate',
    description: 'Learn how to create backend applications and APIs with Node.js and Express.',
    outcome: 'Understand API routes and build a basic backend service.',
  },
  {
    id: 'HXV3zeQKqGY',
    title: 'SQL Tutorial — Full Database Course',
    publisher: 'freeCodeCamp.org',
    topic: 'Data',
    level: 'Beginner',
    description: 'Understand relational databases, queries, joins, filtering, and common database operations.',
    outcome: 'Query and combine data to answer business questions.',
  },
  {
    id: 'r-uOLxNrNk8',
    title: 'Data Analysis with Python — Full Course',
    publisher: 'freeCodeCamp.org',
    topic: 'Data',
    level: 'Beginner',
    description: 'Use NumPy, pandas, and plotting tools to explore, clean, and analyze data.',
    outcome: 'Turn a spreadsheet or CSV file into a useful analysis.',
  },
]

const additional = [
  {
    title: 'Power Automate: Build your first business flows',
    publisher: 'Microsoft Learn',
    topic: 'Automation' as Topic,
    level: 'Beginner',
    url: 'https://learn.microsoft.com/en-us/training/paths/automate-process-power-automate/',
    description: 'A guided learning path to create, test, and manage automations, approvals, and connected workflows.',
  },
  {
    title: 'n8n: Level One workflow automation course',
    publisher: 'n8n Documentation',
    topic: 'Automation' as Topic,
    level: 'Beginner',
    url: 'https://docs.n8n.io/courses/level-one/',
    description: 'Learn triggers, nodes, data mapping, and practical low-code workflow creation.',
  },
  {
    title: 'Power Automate: Expressions and Dataverse',
    publisher: 'Microsoft Learn',
    topic: 'Automation' as Topic,
    level: 'Intermediate',
    url: 'https://learn.microsoft.com/en-us/training/paths/automate-business-process-expressions-dataverse-actions/',
    description: 'Move from basic flows to expressions, conditions, and data-connected automations.',
  },
  {
    title: 'Microsoft Generative AI for Beginners — Lesson Repository',
    publisher: 'Microsoft',
    topic: 'AI' as Topic,
    level: 'Beginner',
    url: 'https://github.com/microsoft/generative-ai-for-beginners',
    description: 'Hands-on examples and lesson materials that accompany the public video series.',
  },
]

const topics: ('All' | Topic)[] = ['All', 'AI', 'Automation', 'Programming', 'Data']
const topicDescriptions: Record<Topic, string> = {
  AI: 'Models, prompting, agents and responsible adoption.',
  Automation: 'Workflows, triggers, approvals and everyday productivity.',
  Programming: 'Build scripts, applications and APIs.',
  Data: 'Turn raw information into decisions.',
}

export default function Learning() {
  const [topic, setTopic] = useState<'All' | Topic>('All')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Video | null>(null)

  usePageMeta({
    title: 'Free Learning Hub',
    description: 'Explore free public learning resources and YouTube lessons curated by OPERAVA on artificial intelligence, automation, programming and data skills.',
    crumbs: [{ name: 'Learning Hub', path: '/learning' }],
  })

  const filteredVideos = useMemo(() => videos.filter((v) =>
    (topic === 'All' || topic === v.topic) &&
    [v.title, v.publisher, v.topic, v.description, v.outcome].join(' ').toLowerCase().includes(query.toLowerCase())
  ), [topic, query])

  const filteredResources = useMemo(() => additional.filter((r) =>
    (topic === 'All' || topic === r.topic) &&
    [r.title, r.publisher, r.topic, r.description].join(' ').toLowerCase().includes(query.toLowerCase())
  ), [topic, query])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <Page>
      <Crumbs items={[{ label: 'Learning Hub' }]} />
      <section className="relative overflow-hidden rounded-xl border border-neutral-800 mt-6 min-h-[360px] sm:min-h-[420px] bg-[#090811] flex items-end">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_at_75%_30%,rgba(159,103,255,.55),transparent_55%),linear-gradient(135deg,#000,#1a1033)]" aria-hidden="true" />
        <div className="absolute right-[-15%] top-[-65%] h-[620px] w-[620px] border border-[#9f67ff]/30 rounded-full" aria-hidden="true" />
        <div className="absolute right-[-8%] top-[-40%] h-[480px] w-[480px] border border-[#9f67ff]/30 rounded-full" aria-hidden="true" />
        <div className="relative p-8 sm:p-12 lg:p-16 max-w-[900px]">
          <div className="flex items-center gap-2 text-accent text-[11px] font-bold tracking-[.25em] uppercase mb-6"><BookOpen size={17} /> OPERAVA Learning Hub</div>
          <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] leading-[.88] font-black uppercase tracking-[-.045em]">Learn skills.<br /><span className="text-neutral-400">Build what's next.</span></h1>
          <p className="max-w-[610px] text-neutral-300 mt-6 leading-relaxed text-sm sm:text-base">Free, publicly available video lessons and practical resources. Explore AI, automation, coding and data — at your own pace.</p>
          <a href="#lessons" className="inline-flex gap-2 items-center mt-8 h-11 px-6 rounded border border-white hover:bg-white hover:text-black transition-colors uppercase text-[11px] font-bold tracking-widest">Explore lessons <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="py-12 lg:py-16" aria-label="Learning pathways">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
          <div><p className="text-accent text-xs uppercase tracking-widest font-bold">Discover your pathway</p><h2 className="mt-3 text-3xl sm:text-4xl font-black uppercase">Explore four subjects</h2></div>
          <span className="text-neutral-500 text-sm">Free educational resources</span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {(Object.keys(topicDescriptions) as Topic[]).map((name, i) => (
            <button key={name} type="button" onClick={() => { setTopic(name); document.getElementById('lessons')?.scrollIntoView({ behavior: 'smooth' }) }} className="group text-left border border-neutral-800 rounded-xl p-6 bg-[#0a0a0a] hover:border-accent/60 hover:bg-[#100b1a] transition-[border-color,background-color]">
              <p className="text-accent text-xs font-bold">0{i + 1}</p>
              <h3 className="text-xl font-black uppercase mt-9 mb-3 group-hover:text-accent transition-colors">{name}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed min-h-[4rem]">{topicDescriptions[name]}</p>
              <span className="text-xs mt-4 inline-flex gap-2 items-center text-neutral-300 group-hover:text-white">Explore <ArrowUpRight size={14}/></span>
            </button>
          ))}
        </div>
      </section>

      <section id="lessons" className="py-12 border-t border-neutral-800 scroll-mt-24">
        <p className="uppercase text-[11px] tracking-[.24em] text-accent font-bold">Curated library</p>
        <h2 className="font-black uppercase text-[clamp(2rem,5vw,4rem)] leading-none mt-3">Watch. Learn. Apply.</h2>
        <p className="text-neutral-400 max-w-[670px] mt-4 text-sm leading-relaxed">Browse real courses from their original educators. Choose a lesson, then apply what you learn with a small project.</p>
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 mt-9 mb-8">
          <div className="flex items-center gap-2 flex-wrap flex-1" aria-label="Filter by subject">
            {topics.map((name) => <button key={name} type="button" onClick={() => setTopic(name)} aria-pressed={topic === name} className={'px-4 py-2.5 rounded-full border text-xs font-semibold transition-colors ' + (topic === name ? 'bg-white text-black border-white' : 'border-neutral-700 text-neutral-300 hover:border-accent')}>{name}</button>)}
          </div>
          <label className="flex items-center gap-3 bg-[#111] border border-neutral-700 rounded-lg px-4 h-11 w-full lg:max-w-[300px] focus-within:border-accent">
            <Search className="text-neutral-400 shrink-0" size={18} />
            <span className="sr-only">Search lessons</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search topics or skills" className="bg-transparent outline-none text-sm w-full placeholder:text-neutral-500" />
          </label>
        </div>
        <p className="text-xs text-neutral-500 mb-5" aria-live="polite">{filteredVideos.length + filteredResources.length} resources found</p>

        {filteredVideos.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <article key={video.id} className="rounded-xl border border-neutral-800 bg-[#0a0a0a] overflow-hidden group hover:border-accent/50 transition-colors flex flex-col">
                <button type="button" onClick={() => setActive(video)} className="relative w-full aspect-video bg-neutral-900 text-left overflow-hidden" aria-label={'Watch ' + video.title}>
                  <img src={'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg'} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#9f67ff] text-black shadow-lg"><Play size={19} fill="currentColor" /></span>
                  <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/80 text-[11px] font-semibold">YouTube</span>
                </button>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider"><span className="text-accent">{video.topic} · {video.level}</span><span className="text-neutral-500">{video.publisher}</span></div>
                  <h3 className="text-xl font-black leading-tight mt-4">{video.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-3">{video.description}</p>
                  <div className="mt-auto pt-5">
                    <p className="border-t border-neutral-800 pt-4 text-xs text-neutral-400"><strong className="text-neutral-200">Try this:</strong> {video.outcome}</p>
                    <div className="flex gap-5 mt-5">
                      <button type="button" onClick={() => setActive(video)} className="text-sm font-semibold text-white hover:text-accent transition-colors">Watch here →</button>
                      <a href={'https://www.youtube.com/watch?v=' + video.id} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center text-sm text-neutral-400 hover:text-accent transition-colors">YouTube <ExternalLink size={13}/></a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredResources.length > 0 && (
          <div className="pt-12">
            <h3 className="uppercase text-2xl font-black mb-5">Practice with guided resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border border-neutral-800 bg-[#0e0e0e] hover:border-accent/60 group transition-colors">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide"><span className="text-accent font-semibold">{item.topic} · {item.level}</span><ExternalLink size={16} className="text-neutral-400 group-hover:text-accent" /></div>
                  <h4 className="font-black text-xl mt-5">{item.title}</h4>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{item.description}</p>
                  <p className="mt-5 text-xs text-neutral-500">By {item.publisher} · Open original course ↗</p>
                </a>
              ))}
            </div>
          </div>
        )}
        {filteredVideos.length === 0 && filteredResources.length === 0 &&
          <div className="py-16 border border-neutral-800 rounded-xl text-center"><p className="text-neutral-300">No matches. Try a different topic or search term.</p><button type="button" onClick={() => { setTopic('All'); setQuery('') }} className="mt-5 text-accent underline underline-offset-4">Reset filters</button></div>}
      </section>

      <section className="py-12 mb-16 border-t border-neutral-800">
        <div className="rounded-xl border border-neutral-800 bg-[#0d0a16] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div><Sparkles className="text-accent mb-5" size={25} /><h2 className="text-3xl lg:text-5xl font-black uppercase leading-none">Keep learning.<br/><span className="text-neutral-400">Keep building.</span></h2><p className="text-neutral-400 mt-5 max-w-[630px] text-sm leading-relaxed">These independent, public resources are curated for self-study. They are not OPERAVA courses, certificates, or endorsements. For structured programs, explore OPERAVA Academy.</p></div>
          <Link to="/academy" className="inline-flex items-center justify-center gap-2 border border-white rounded px-7 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors whitespace-nowrap">Explore Academy <ArrowUpRight size={17}/></Link>
        </div>
      </section>

      {active && (
        <div role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setActive(null) }} className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div role="dialog" aria-modal="true" aria-label={'Watch ' + active.title} className="w-full max-w-5xl bg-[#0b0b0b] rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 gap-4">
              <div className="min-w-0"><p className="text-accent uppercase tracking-widest text-[10px] font-semibold">{active.publisher} · {active.topic}</p><h3 className="text-sm sm:text-lg font-bold truncate mt-1">{active.title}</h3></div>
              <button type="button" onClick={() => setActive(null)} aria-label="Close video" className="w-10 h-10 flex items-center justify-center border border-neutral-700 hover:border-accent rounded-lg shrink-0"><X size={20}/></button>
            </div>
            <div className="aspect-video bg-black">
              <iframe key={active.id} src={'https://www.youtube-nocookie.com/embed/' + active.id + '?autoplay=1&rel=0'} title={active.title} className="w-full h-full border-0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
            <div className="px-5 py-4 text-xs text-neutral-400 flex gap-5 flex-wrap justify-between"><p>Video from an independent public educator. Playback is provided by YouTube.</p><a href={'https://www.youtube.com/watch?v=' + active.id} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4 hover:text-accent">Open directly on YouTube ↗</a></div>
          </div>
        </div>
      )}
    </Page>
  )
}
