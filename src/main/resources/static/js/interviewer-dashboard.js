async function loadDashboard() {

    const dashboardEl = document.getElementById("dashboardContent");

  if (!dashboardEl) {
    console.error("dashboardContent element not found!");
    return;
  }

  const token = localStorage.getItem("accessToken");

  if (!token) {
    dashboardEl.innerText = "Not logged in";
    return;
  }

  try {
    const response = await fetch("/api/interviewer-dashboard", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (response.status === 401) {
      dashboardEl.innerText = "Session expired. Please login again.";
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    if (response.status === 403) {
  dashboardEl.innerText = "Access Denied (Insufficient permissions)";
  return;
}

    if (!response.ok) {
      dashboardEl.innerText = "Access Denied";
      return;
    }

    const data = await response.text();
    dashboardEl.innerText = data;

  } catch (err) {
    console.error(err);
    dashboardEl.innerText = "Server error";
  }
}


window.addEventListener("load", loadDashboard);


const students=[
  {initials:'AR',name:'Alex Rivera',id:'STU-2024-0091',degree:'B.Tech Computer Science (Final Year)',institute:'Global Tech University',cgpa:'8.7/10',year:'Final Year',time:'10:00 AM – 10:45 AM',domains:['Full Stack Dev','Machine Learning','Python/React'],resume:'Rivera_Resume_v2.pdf',projects:[{title:'E-Commerce Platform',tech:'React, Node.js, MongoDB'},{title:'Sentiment Analysis Engine',tech:'Python, NLTK, Flask'}]},
  {initials:'PM',name:'Priya Mehta',id:'STU-2024-0105',degree:'B.Tech Data Science (3rd Year)',institute:'Apex Institute of Tech',cgpa:'9.1/10',year:'3rd Year',time:'11:30 AM – 12:15 PM',domains:['Data Science','Python','Machine Learning'],resume:'Mehta_Resume_v1.pdf',projects:[{title:'Predictive Analytics Dashboard',tech:'Python, Pandas, Streamlit'},{title:'NLP Text Classifier',tech:'Python, TensorFlow, Flask'}]},
  {initials:'RK',name:'Rohan Kumar',id:'STU-2024-0118',degree:'B.Tech IT (Final Year)',institute:"St. Xavier's College",cgpa:'7.9/10',year:'Final Year',time:'02:00 PM – 02:45 PM',domains:['Java Backend','Spring Boot','MySQL'],resume:'Kumar_Resume_v3.pdf',projects:[{title:'Banking REST API',tech:'Java, Spring Boot, MySQL'},{title:'Task Management App',tech:'Java, Hibernate, Angular'}]}
];
let currentStudentIndex=0,timerInterval,seconds=0,evalSubmitted=false;

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarOverlay').classList.toggle('show');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('show');}

function showView(v){
  document.querySelectorAll('.nav-links a').forEach(l=>l.classList.remove('active'));
  const lnk=document.getElementById('link-'+v);if(lnk)lnk.classList.add('active');
  document.querySelectorAll('.content-body').forEach(s=>s.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  const T={live:'Live Interview',schedule:'Schedule',history:'History',profile:'Profile'};
  document.getElementById('page-title').innerText=T[v]||v;
  document.getElementById('breadcrumb-sub').innerText=T[v]||v;
  closeSidebar();closeAllDropdowns();
  if(v==='history')updateHistCount();
}
function closeAllDropdowns(){document.getElementById('userDropdown').classList.remove('open');document.getElementById('notifPanel').classList.remove('open');}
function toggleUserMenu(){document.getElementById('userDropdown').classList.toggle('open');document.getElementById('notifPanel').classList.remove('open');}
function closeUserMenu(){document.getElementById('userDropdown').classList.remove('open');}
function toggleNotif(){document.getElementById('notifPanel').classList.toggle('open');document.getElementById('userDropdown').classList.remove('open');}
function markAllRead(){document.querySelectorAll('.notif-item.unread').forEach(el=>el.classList.remove('unread'));document.getElementById('notifDot').style.display='none';showToast('All notifications marked as read');document.getElementById('notifPanel').classList.remove('open');}
document.addEventListener('click',function(e){if(!e.target.closest('#notifWrap'))document.getElementById('notifPanel').classList.remove('open');if(!e.target.closest('#userMenuWrap'))document.getElementById('userDropdown').classList.remove('open');});

function openOverlay(id){document.getElementById(id).classList.add('open');}
function closeOverlay(id){document.getElementById(id).classList.remove('open');}
function scrollToSection(id){setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},200);}

function setStep(n){for(let i=1;i<=3;i++){const s=document.getElementById('step'+i);s.classList.remove('active','done');if(i<n)s.classList.add('done');else if(i===n)s.classList.add('active');}for(let i=1;i<=2;i++)document.getElementById('div'+i).classList.toggle('done',i<n);}

function goToPhase2(){document.getElementById('phase-info').classList.remove('active');document.getElementById('phase-live').classList.add('active');setStep(2);}
function startSession(){
  document.getElementById('startBtn').disabled=true;document.getElementById('endBtn').disabled=false;seconds=0;
  timerInterval=setInterval(()=>{seconds++;const h=String(Math.floor(seconds/3600)).padStart(2,'0'),m=String(Math.floor((seconds%3600)/60)).padStart(2,'0'),s=String(seconds%60).padStart(2,'0');document.getElementById('liveClock').innerText=`${h}:${m}:${s}`;},1000);
}
function confirmEndSession(){
  closeOverlay('endConfirmModal');clearInterval(timerInterval);document.getElementById('endBtn').disabled=true;
  const dur=document.getElementById('liveClock').innerText;document.getElementById('evalDuration').innerText=dur;
  const s=students[currentStudentIndex%students.length];
  document.getElementById('eval-avatar').innerText=s.initials;document.getElementById('eval-name').innerText=s.name;
  document.getElementById('overallPerformance').value='';
  ['strengthsField','improvField','remarksField'].forEach(id=>{document.getElementById(id).value='';});
  document.querySelectorAll('#phase-eval input[type="range"]').forEach((r,i)=>{r.value=5;document.getElementById('v'+(i+1)).innerText='5';});
  evalSubmitted=false;
  document.getElementById('phase-live').classList.remove('active');document.getElementById('phase-eval').classList.add('active');setStep(3);
}
function submitEvalAndNext(){
  const perf=document.getElementById('overallPerformance').value;
  if(!perf){showToast('Please select Overall Performance before submitting.','warn');document.getElementById('overallPerformance').focus();return;}
  if(evalSubmitted)return;evalSubmitted=true;currentStudentIndex++;
  const next=students[currentStudentIndex%students.length];
  clearInterval(timerInterval);seconds=0;document.getElementById('liveClock').innerText='00:00:00';
  document.getElementById('startBtn').disabled=false;document.getElementById('endBtn').disabled=true;
  document.getElementById('live-avatar').innerText=next.initials;document.getElementById('live-name').innerText=next.name;
  document.getElementById('live-avatar2').innerText=next.initials;document.getElementById('live-name2').innerText=next.name;
  document.getElementById('live-degree').innerText=next.degree;document.getElementById('info-name').innerText=next.name;
  document.getElementById('info-program').innerText=next.degree.split('(')[0].trim();
  const cols=['bg-info','bg-pending','bg-success','bg-blue'];
  document.getElementById('live-domains').innerHTML=next.domains.map((d,i)=>`<span class="badge ${cols[i%cols.length]}">${d}</span>`).join('');
  document.getElementById('phase-eval').classList.remove('active');document.getElementById('phase-live').classList.remove('active');document.getElementById('phase-info').classList.add('active');setStep(1);
  showToast(`✓ Evaluation submitted! Loading: ${next.name}`);
}

function openStudentModal(idx){
  const s=students[idx];const cols=['bg-info','bg-pending','bg-success','bg-blue'];
  document.getElementById('studentModalContent').innerHTML=`
    <div class="student-modal-banner"><div class="student-modal-avatar">${s.initials}</div><div><h3 style="font-size:15px;">${s.name}</h3><p style="font-size:13px;opacity:.85;margin-top:3px;">${s.degree}</p><p style="font-size:12px;opacity:.7;margin-top:2px;">${s.id} · ${s.institute}</p></div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
      <div style="background:#F8FAFC;padding:10px;border-radius:var(--r);border-left:3px solid var(--secondary);"><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;">CGPA</div><b>${s.cgpa}</b></div>
      <div style="background:#F8FAFC;padding:10px;border-radius:var(--r);border-left:3px solid var(--secondary);"><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;">Year</div><b>${s.year}</b></div>
      <div style="background:#F8FAFC;padding:10px;border-radius:var(--r);border-left:3px solid var(--secondary);"><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;">Slot</div><b style="font-size:12.5px;">${s.time}</b></div>
    </div>
    <div style="margin-bottom:13px;"><div style="font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px;">Domains</div><div style="display:flex;flex-wrap:wrap;gap:6px;">${s.domains.map((d,i)=>`<span class="badge ${cols[i%cols.length]}">${d}</span>`).join('')}</div></div>
    <div style="margin-bottom:13px;"><div style="font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px;">Projects</div>${s.projects.map(p=>`<div style="background:#F8FAFC;border-radius:var(--r);padding:9px 12px;margin-bottom:7px;border-left:3px solid var(--warning);"><b>${p.title}</b><p style="font-size:12px;color:var(--muted);margin-top:2px;">${p.tech}</p></div>`).join('')}</div>
    <div style="background:#F9FAFB;border-radius:var(--r);padding:11px;display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-file-pdf" style="font-size:1.6rem;color:#ef4444;flex-shrink:0;"></i><div><b>${s.resume}</b><p style="font-size:12px;color:var(--muted);">Candidate Resume</p></div><button class="btn btn-s btn-sm" style="margin-left:auto;"><i class="fa-solid fa-eye"></i> View</button></div>`;
  openOverlay('studentModal');
}

function updateHistCount(){
  const cards=document.querySelectorAll('#historyList .history-card');
  let v=0;cards.forEach(c=>{if(c.style.display!=='none')v++;});
  const el=document.getElementById('histCount');if(el)el.innerText=`${v} record${v!==1?'s':''}`;
}
function applyHistFilters(){
  const instVal=(document.getElementById('histInstFilter').value||'').toLowerCase().trim();
  let visible=0;
  document.querySelectorAll('#historyList .history-card').forEach(card=>{
    const ok=!instVal||(card.getAttribute('data-institute')||'').toLowerCase().includes(instVal);
    card.style.display=ok?'block':'none';if(ok)visible++;
  });
  document.getElementById('historyEmpty').style.display=visible===0?'block':'none';
  updateHistCount();
}
function clearHistFilters(){document.getElementById('histInstFilter').value='';applyHistFilters();}
function openVideoModal(s,d){document.getElementById('vm-student').innerText=s;document.getElementById('vm-date').innerText=d;document.getElementById('videoModalTitle').innerText=`Recording — ${s}`;openOverlay('videoModal');}

function handleProfilePic(input){
  if(!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=function(e){
    document.getElementById('profilePicLg').innerHTML=`<img src="${e.target.result}" alt="Profile">`;
    document.getElementById('headerAvatar').innerHTML=`<img src="${e.target.result}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(input.files[0]);showToast('Profile photo updated!');
}
function handleCvUpload(input){if(!input.files||!input.files[0])return;const name=input.files[0].name;const el=document.getElementById('cvFileName');document.getElementById('cvFileNameText').innerText=name+' — ready to upload';el.style.display='flex';showToast('CV selected: '+name);}
function saveProfile(){showToast('Profile saved successfully!');}
function removeSkill(icon){icon.closest('.skill-tag').remove();}
function addSkill(e){if(e.key==='Enter'){const input=document.getElementById('skillInput');const val=input.value.trim();if(!val)return;const tag=document.createElement('span');tag.className='skill-tag';tag.innerHTML=`${val} <i class="fa-solid fa-xmark" onclick="removeSkill(this)"></i>`;document.getElementById('skillTagArea').insertBefore(tag,input);input.value='';}}

function checkPassStrength(){const v=document.getElementById('newPass').value;const el=document.getElementById('passStrength');if(!v){el.style.display='none';return;}el.style.display='block';if(v.length<6){el.style.color='#DC2626';el.innerText='⚠ Weak password';}else if(v.length<10||!/[A-Z]/.test(v)||!/[0-9]/.test(v)){el.style.color='#EAB308';el.innerText='⚡ Medium strength';}else{el.style.color='#16A34A';el.innerText='✓ Strong password';}}
function changePassword(){const np=document.getElementById('newPass').value;const cp=document.getElementById('confirmPass').value;if(!np){showToast('Enter a new password.','warn');return;}if(np!==cp){showToast('Passwords do not match.','error');return;}showToast('Password updated successfully!');document.getElementById('newPass').value='';document.getElementById('confirmPass').value='';document.getElementById('passStrength').style.display='none';}
function confirmLogout(){closeOverlay('logoutOverlay');showToast('Logged out successfully.');setTimeout(()=>window.location.reload(),1200);}

function showToast(msg,type='success'){const map={success:['#DCFCE7','#166534'],warn:['#FEF3C7','#92400E'],error:['#FEE2E2','#991B1B']};const[bg,col]=map[type]||map.success;const t=document.createElement('div');t.className='toast';t.style.cssText=`background:${bg};color:${col};`;t.innerText=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);}

// init
updateHistCount();