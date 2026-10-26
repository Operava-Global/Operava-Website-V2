import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { BadgeCheck, CheckCircle2, ClipboardList, FileCheck2, FileDown, KeyRound, LockKeyhole,
  MailPlus, RefreshCcw, Search, ShieldCheck, UserCheck, Users, XCircle } from 'lucide-react'
import ThemeToggle from '../site/ThemeToggle'
import { usePageMeta } from '../site/seo'
import './AvaScreening.css'
import './RecruitmentAdmin.css'

type Role = 'tech' | 'ops' | 'cx'
type Tab = 'invite' | 'invitations' | 'applicants' | 'identity' | 'assessments'
type Invite = { id:string; name:string; email:string; role:Role; sent_at:number; expires_at:number; status:string }
type Pending = { id:string; name:string; email:string; role:Role; identity_kind:string; identity_submitted:number }
type PublicApplicant = { id:string; name:string; email:string; role:Role; created_at:number;verified_at:number|null;
  current_status:string;has_profile:number;review_status:string }
type Summary = { id:string; name:string; email:string; role:Role; assessment_status:string;
  answers_received:number; review_status:string; completed:number|null }
type Detail = { applicant:{ id:string;name:string;email:string;role:Role;identityStatus:string;
  assessmentStatus:string; profile:Record<string,string> };
  answers:{id:string;section:string;prompt:string;answer:string|null;advisoryReview:unknown}[];
  manualReview:{review_status:string;reviewer_note:string}|null;
  monitoringEventCounts:{event_type:string;count:number}[] }
const ROLES:Record<Role,string> = {tech:'Technology Executive',ops:'Business Operations Executive',cx:'Customer Experience Executive'}
const API='/recruitment-admin/api'

async function send(action:string, values:Record<string,unknown>={}) {
  const response=await fetch(API,{method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...values})})
  const data=await response.json().catch(()=>({})) as Record<string,unknown>
  if(!response.ok || data.error) throw new Error(String(data.error||'Action unsuccessful. Verify that Cloudflare Access and Ava are configured.'))
  return data
}
const date = (time?:number|null) => time ? new Date(time).toLocaleString() : '—'
function Empty({children}:{children:string}) { return <p className="ra-empty">{children}</p> }

export default function RecruitmentAdmin() {
  usePageMeta({title:'Private Operations Workspace',description:'Restricted recruitment operations workspace.'})
  const [tab,setTab]=useState<Tab>('invite')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [role,setRole]=useState<Role>('tech')
  const [invitations,setInvitations]=useState<Invite[]>([])
  const [pending,setPending]=useState<Pending[]>([])
  const [applicants,setApplicants]=useState<PublicApplicant[]>([])
  const [results,setResults]=useState<Summary[]>([])
  const [selected,setSelected]=useState<string|null>(null)
  const [detail,setDetail]=useState<Detail|null>(null)
  const [note,setNote]=useState('')
  const [filter,setFilter]=useState('')
  const [busy,setBusy]=useState(false)
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const refresh=useCallback(async()=>{
    setLoading(true);setError('')
    try {
      const [inv,ident,ass,pub]=await Promise.all([
        send('invitations'),send('pendingReviews'),send('screeningResults'),send('publicApplicants')])
      setInvitations((inv.invitations||[]) as Invite[])
      setPending((ident.pending||[]) as Pending[])
      setApplicants((pub.applicants||[]) as PublicApplicant[])
      setResults((ass.results||[]) as Summary[])
    } catch(e) {setError(e instanceof Error?e.message:'Unable to load private screening data.')}
    finally {setLoading(false)}
  },[])
  useEffect(()=>{void refresh()},[refresh])
  const act=async(fn:()=>Promise<unknown>,success:string)=>{
    setBusy(true);setError('');setMessage('')
    try {await fn();setMessage(success);await refresh()}
    catch(e){setError(e instanceof Error?e.message:'Operation was unsuccessful.')}
    finally{setBusy(false)}
  }
  const invite=(event:FormEvent)=>{
    event.preventDefault()
    if(!name.trim()||!email.trim()) return
    void act(async()=>{await send('invite',{name:name.trim(),email:email.trim().toLowerCase(),role})
      setName('');setEmail('')},'Invitation email sent. The candidate has seven days to open it.')
  }
  const identity=(item:Pending,decision:'approved'|'needs_resubmission')=>{
    if(!window.confirm(decision==='approved'
      ?'Confirm that you have inspected the original identity document and approve this applicant for assessment?'
      :'Request a new document from this candidate?')) return
    void act(()=>send('reviewIdentity',{id:item.id,decision}),decision==='approved'
      ?'Identity approved by a human reviewer.':'Identity resubmission requested.')
  }
  const download=async(id:string)=>{
    setBusy(true);setError('')
    try{
      const response=await fetch(API,{method:'POST',credentials:'same-origin',cache:'no-store',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'identityDocument',id})})
      if(!response.ok) { const text=await response.text();throw new Error(text.slice(0,200)||'Unable to download evidence.') }
      const blob=await response.blob()
      const ext=blob.type.includes('pdf')?'pdf':blob.type.includes('png')?'png':'jpg'
      const objectUrl=URL.createObjectURL(blob)
      const a=document.createElement('a')
      a.href=objectUrl;a.download='ava-restricted-evidence-'+id+'.'+ext
      document.body.appendChild(a);a.click();a.remove()
      window.setTimeout(()=>URL.revokeObjectURL(objectUrl),60000)
      setMessage('Private evidence downloaded. Store it only in approved secure locations.')
    }catch(e){setError(e instanceof Error?e.message:'Unable to retrieve evidence.')}
    finally{setBusy(false)}
  }
  const openDetail=async(id:string)=>{
    setBusy(true);setError('');setDetail(null);setSelected(id)
    try {const value=await send('screeningDetail',{id});const item=value as unknown as Detail;
      setDetail(item);setNote(item.manualReview?.reviewer_note||'')}
    catch(e){setError(e instanceof Error?e.message:'Unable to open candidate report.')}
    finally{setBusy(false)}
  }
  const recordReview=(status:'reviewed'|'follow_up_required')=>{
    if(!selected)return
    if(!window.confirm('Save this human review decision for the applicant?'))return
    void act(async()=>{await send('reviewScreening',{id:selected,status,note});await openDetail(selected)},
      status==='reviewed'?'Human review recorded.':'Candidate flagged for manual follow-up.')
  }
  const query=filter.toLowerCase().trim()
  const matches=(item:{name:string;email:string;id:string})=>!query||
    [item.name,item.email,item.id].some(value=>value.toLowerCase().includes(query))

  return <div className="ava-screening ra-workspace"><div className="ava-wrap">
    <header className="ava-app-topbar">
      <div className="ava-app-brand"><span className="ava-app-symbol"><LockKeyhole size={21}/></span>
        <div><strong>OPERAVA</strong><span>PRIVATE · TALENT OPERATIONS</span></div></div>
      <div className="ava-app-controls"><span className="ava-access-label"><ShieldCheck size={14}/> CLOUDFLARE ACCESS</span><ThemeToggle/></div>
    </header>
    <div className="ra-head"><div><p className="ava-kicker"><span className="ava-dot"/> RESTRICTED WORKSPACE</p>
      <h1>RECRUITMENT <span>ADMIN</span></h1><p>Private candidate invitations, document verification, and human assessment review.</p></div>
      <button type="button" className="ava-secondary" onClick={()=>void refresh()} disabled={loading||busy}>
        <RefreshCcw size={16}/>{loading?'Refreshing…':'Refresh records'}</button></div>
    <section className="ra-metrics" aria-label="Recruitment overview">
      <div><MailPlus/><span>Invitations</span><strong>{invitations.length}</strong></div>
      <div><UserCheck/><span>Identity reviews due</span><strong>{pending.length}</strong></div>
      <div><ClipboardList/><span>Completed assessments</span><strong>{results.length}</strong></div>
    </section>
    <nav className="ra-tabs" aria-label="Private recruitment sections">
      {([['invite','Send invitation',MailPlus],['invitations','Invitation tracking',Users],
        ['applicants','Public applicants',UserCheck],['identity','Identity review',FileCheck2],['assessments','Assessment results',ClipboardList]] as const)
        .map(([key,label,Icon])=><button key={key} type="button" className={tab===key?'is-active':''}
          aria-current={tab===key?'page':undefined} onClick={()=>{setTab(key);setMessage('');setError('')}}>
          <Icon size={17}/>{label}</button>)}
    </nav>
    <section className="ra-panel">
      {tab==='invite'&&<div className="ra-invite-layout">
        <div><p className="ava-label">01 · PRIVATE INVITATIONS</p><h2>Invite an applicant</h2>
          <p className="ra-intro">Send a unique, seven-day invitation directly through OPERAVA’s configured Amazon SES mail service. Each candidate confirms their invited email with a one-time code.</p>
          <form className="ra-invite-form" onSubmit={invite}>
            <label className="ava-field">Full name<input required minLength={2} maxLength={100} autoComplete="off" placeholder="Legal name" value={name} onChange={e=>setName(e.target.value)}/></label>
            <label className="ava-field">Applicant email<input required type="email" autoComplete="off" maxLength={180} placeholder="candidate@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
            <label className="ava-field">Assessment track<select value={role} onChange={e=>setRole(e.target.value as Role)}>
              {Object.entries(ROLES).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>
            <button type="submit" disabled={busy||loading} className="ava-primary"><MailPlus size={17}/>{busy?'Sending…':'Send secure invitation'}</button>
          </form>
        </div>
        <aside className="ra-illustration"><img src="/media/ava-assessment-verified.svg" alt="" width={140} height={140}/>
          <strong>How invitations work</strong><ol>
            <li>Recruiter sends a secure invite.</li><li>Candidate receives an email and verifies a six-digit code.</li>
            <li>Candidate submits profile and identity evidence.</li><li>Human reviewer approves the document.</li>
            <li>Candidate completes a 45-minute assessment.</li><li>Recruiter reviews written answers and records feedback.</li>
          </ol><p>Never forward or post invitation links publicly.</p></aside>
      </div>}
      {tab==='invitations'&&<><div className="ra-section-title"><div><p className="ava-label">INVITATION LOG</p><h2>Sent invitations</h2></div><span>Latest 100 invitations</span></div>
        <label className="ra-search"><Search size={18}/><input aria-label="Search invitations" placeholder="Search name or email" value={filter} onChange={e=>setFilter(e.target.value)}/></label>
        {invitations.filter(matches).length ? <div className="ra-table-scroll"><table className="ra-table"><thead><tr><th>Applicant</th><th>Position</th><th>Sent</th><th>Expires</th><th>Status</th></tr></thead>
        <tbody>{invitations.filter(matches).map(item=><tr key={item.id}><td><strong>{item.name}</strong><small>{item.email}</small></td><td>{ROLES[item.role]}</td><td>{date(item.sent_at)}</td><td>{date(item.expires_at)}</td><td><span className="ra-status">{item.status.replace(/_/g,' ')}</span></td></tr>)}</tbody></table></div>:<Empty>No invitations found. Use “Send invitation” to start a candidate screening.</Empty>}</>}
      {tab==='applicants'&&<><div className="ra-section-title"><div><p className="ava-label">PUBLIC APPLICANT ACCOUNTS</p><h2>Registered candidates</h2></div><span>Latest 100 registrations</span></div>
        <label className="ra-search"><Search size={18}/><input aria-label="Search applicant registrations"
          placeholder="Search name or email" value={filter} onChange={e=>setFilter(e.target.value)}/></label>
        {applicants.filter(matches).length?<div className="ra-table-scroll"><table className="ra-table">
          <thead><tr><th>Applicant</th><th>Assessment track</th><th>Registered</th><th>Email</th><th>Profile</th><th>Assessment status</th></tr></thead>
          <tbody>{applicants.filter(matches).map(item=><tr key={item.id}>
            <td><strong>{item.name}</strong><small>{item.email}</small></td>
            <td>{ROLES[item.role]}</td><td>{date(item.created_at)}</td>
            <td>{item.verified_at?'Verified':'Unverified'}</td>
            <td>{item.has_profile?'Completed':'Incomplete'}</td>
            <td><span className="ra-status">{item.current_status.replace(/_/g,' ')}</span></td>
          </tr>)}</tbody></table></div>:<Empty>No public applicants found.</Empty>}</>}
      {tab==='identity'&&<><div className="ra-section-title"><div><p className="ava-label">HUMAN VERIFICATION REQUIRED</p><h2>Identity review</h2></div><span>{pending.length} awaiting review</span></div>
        {pending.length? <div className="ra-list">{pending.map(item=><article className="ra-record" key={item.id}>
          <div className="ra-record-header"><img src="/media/ava-assessment-identity.svg" alt="" width={62} height={62}/><div><h3>{item.name}</h3><p>{item.email} · {ROLES[item.role]}</p><small>{item.identity_kind} · Submitted {date(item.identity_submitted)}</small></div></div>
          <p>Inspect the original document before making a decision. Uploaded evidence is not automated authenticity verification.</p>
          <div className="ra-actions"><button disabled={busy} className="ava-secondary" onClick={()=>void download(item.id)}><FileDown size={15}/>Download private evidence</button>
          <button disabled={busy} className="ava-primary" onClick={()=>identity(item,'approved')}><BadgeCheck size={15}/>Approve document</button>
          <button disabled={busy} className="ava-secondary" onClick={()=>identity(item,'needs_resubmission')}><XCircle size={15}/>Request resubmission</button></div></article>)}</div>:<Empty>No identity documents are pending a human review.</Empty>}</>}
      {tab==='assessments'&&<><div className="ra-section-title"><div><p className="ava-label">HUMAN-REVIEWED SCREENING</p><h2>Assessment reports</h2></div><span>{results.length} available · Latest 100</span></div>
        <label className="ra-search"><Search size={18}/><input aria-label="Search assessment reports" placeholder="Search name or email" value={filter} onChange={e=>setFilter(e.target.value)}/></label>
        <div className="ra-review-layout"><div className="ra-report-list">
          {results.filter(matches).length?results.filter(matches).map(item=><button className={'ra-report'+(selected===item.id?' is-active':'')}
            type="button" key={item.id} onClick={()=>void openDetail(item.id)}>
              <strong>{item.name}</strong><small>{item.email}</small><span>{ROLES[item.role]} · {item.answers_received} answers</span>
              <span className="ra-status">{item.review_status.replace(/_/g,' ')}</span></button>):<Empty>No completed screening reports yet.</Empty>}</div>
          <div className="ra-report-detail">{detail?<><div className="ra-section-title"><div><p className="ava-label">CANDIDATE REPORT</p><h3>{detail.applicant.name}</h3></div><img src="/media/ava-assessment-complete.svg" alt="" width={64} height={64}/></div>
            <p className="ra-intro">{detail.applicant.email} · {ROLES[detail.applicant.role]} · {detail.applicant.assessmentStatus.replace(/_/g,' ')}</p>
            <div className="ra-detail-profile"><strong>Background</strong>{Object.entries(detail.applicant.profile).filter(([key])=>key!=='fullName').map(([key,value])=><div key={key}><span>{key}</span><p>{String(value||'—')}</p></div>)}</div>
            <h4>Candidate responses</h4>{detail.answers.map((item,index)=><article className="ra-answer" key={item.id}>
              <span>QUESTION {index+1} · {item.section.toUpperCase()}</span><h5>{item.prompt}</h5>
              <p>{item.answer||'No response submitted.'}</p>
              {item.advisoryReview!==null&&<small>AI writing suggestion available (advisory; not a hiring decision).</small>}
            </article>)}
            <label className="ava-field">Human reviewer notes<textarea rows={4} maxLength={1500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Summary of competencies, concerns and follow-up actions"/></label>
            <div className="ra-actions"><button disabled={busy} type="button" className="ava-primary" onClick={()=>recordReview('reviewed')}><CheckCircle2 size={15}/>Mark human-reviewed</button>
              <button disabled={busy} className="ava-secondary" type="button" onClick={()=>recordReview('follow_up_required')}>Follow-up required</button></div>
            <p className="ra-footnote">Human review status is administrative only. No automatic hiring, rejection or applicant email is triggered.</p>
          </>:<div className="ra-placeholder"><img src="/media/ava-assessment-question.svg" width={120} height={120} alt=""/><p>Select a completed assessment to review its answers.</p></div>}</div>
        </div></>}
      {error&&<p role="alert" className="ava-alert">{error}</p>}
      {message&&<p role="status" className="ava-note"><CheckCircle2 size={17}/>{message}</p>}
    </section>
    <div className="ava-app-support"><KeyRound size={14}/> Access restricted to individually authorized OPERAVA administrators. No public dashboard navigation.</div>
  </div></div>
}
