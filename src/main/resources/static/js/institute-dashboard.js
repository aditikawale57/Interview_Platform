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
    const response = await fetch("/api/institute-dashboard", {
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

const API_BASE = "http://localhost:8080/departments";
/* ═══════════════════════════ STATE ═══════════════════════════ */
let loggedInstitute = JSON.parse(localStorage.getItem('currentInstitute')) ||
  {id:'1',instituteName:'ABC Institute of Technology',email:'admin@abc.edu'};
loggedInstitute.id = String(loggedInstitute.id);

(function syncRegistry(){
  const list = JSON.parse(localStorage.getItem('institutes'))||[];
  if(!list.find(i=>String(i.id)===loggedInstitute.id)){
    list.push({id:loggedInstitute.id,instituteName:loggedInstitute.instituteName||loggedInstitute.name,email:loggedInstitute.email});
    localStorage.setItem('institutes',JSON.stringify(list));
  }
})();

const iid = loggedInstitute.id;
const DEPTS_KEY  = 'instituteDepts_'+iid;
const SETUP_KEY  = 'instituteSetupDone_'+iid;
const TPO_KEY    = 'tpoCoordinators_'+iid;

let departments = [];
const palette   = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#0D9488','#6366F1','#EC4899'];

function getTpo(){ return JSON.parse(localStorage.getItem(TPO_KEY))||[]; }
function getLegacy(){ return JSON.parse(localStorage.getItem('departments'))||[]; }
function getStatus(n){ return localStorage.getItem('reqStatus_'+n)||'Pending'; }
function setStatus(n,s){ localStorage.setItem('reqStatus_'+n,s); }
function saveDepts(){ localStorage.setItem(DEPTS_KEY,JSON.stringify(departments)); }

/* ═══════════════ HEADER INFO ═══════════════ */
function initHeader(){
  const name = loggedInstitute.instituteName||loggedInstitute.name||'Institute';
  const short = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3)||'AI';
  document.getElementById('headerAvatar').textContent = short;
  document.getElementById('headerInstName').textContent = name.length>20?name.slice(0,20)+'…':name;
  document.getElementById('dropInstName').textContent  = name;
  document.getElementById('dropInstEmail').textContent = loggedInstitute.email||'';
}

/* ═══════════════ NAVIGATION ═══════════════ */
function showView(v){
  document.querySelectorAll('.nav-links a').forEach(l=>l.classList.remove('active'));
  document.getElementById('link-'+v).classList.add('active');
  document.querySelectorAll('.content-body').forEach(s=>s.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  const titles={overview:'Institute Overview',departments:'Departments',
    requests:'Interview Requests',schedule:'Schedule Interview',settings:'Settings'};
  document.getElementById('page-title').textContent    = titles[v]||v;
  document.getElementById('breadcrumb-cur').textContent = titles[v]||v;
  const fresh=JSON.parse(localStorage.getItem(DEPTS_KEY))||[];
  if(fresh.length) departments=fresh;
  if(v==='overview'){renderOverview();}
  if(v==='departments'){renderDeptCards();}
  if(v==='requests'){renderReqStats();renderReqTable();}
  if(v==='schedule'){renderDeptCheckboxes();}
  if(v==='settings'){renderSettingsTable();}
  closeSidebar(); closeUserMenu();
}

/* ═══════════════ SIDEBAR / USER MENU ═══════════════ */
function toggleSidebar(){
  const s=document.getElementById('sidebar');
  const o=document.getElementById('sidebarOverlay');
  const b=document.getElementById('hamburger');
  const open=s.classList.toggle('open');
  o.classList.toggle('active',open);
  b.classList.toggle('open',open);
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  document.getElementById('hamburger').classList.remove('open');
}
function toggleUserMenu(){ document.getElementById('userDropdown').classList.toggle('open'); }
function closeUserMenu(){ document.getElementById('userDropdown').classList.remove('open'); }
document.addEventListener('click',e=>{
  if(!e.target.closest('.user-menu-wrap')) closeUserMenu();
});

/* ═══════════════ MODAL HELPERS ═══════════════ */
function openOverlay(id){ document.getElementById(id).classList.add('open'); }
function closeOverlay(id){ document.getElementById(id).classList.remove('open'); }
window.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-overlay')&&e.target.id!=='setupModal') closeOverlay(e.target.id);
});

/* ═══════════════ FIRST-TIME SETUP ═══════════════ */
let setupDepts=[];
function renderSetupTags(){
  const c=document.getElementById('setupDeptTags');
  document.getElementById('setupCount').textContent=setupDepts.length;
  if(!setupDepts.length){
    c.innerHTML='<span style="color:var(--muted);font-size:12px;align-self:center;">No departments added yet…</span>';
    return;
  }
  c.innerHTML=setupDepts.map((n,i)=>`
    <span class="tag-item"><i class="fa-solid fa-sitemap" style="font-size:9px;"></i>${n}
      <i class="fa-solid fa-xmark" onclick="removeSetupDept(${i})"></i>
    </span>`).join('');
}
function addSetupDept(){
  const inp=document.getElementById('setupDeptInput');
  const n=inp.value.trim(); if(!n)return;
  if(!setupDepts.find(d=>d.toLowerCase()===n.toLowerCase())) setupDepts.push(n);
  inp.value=''; renderSetupTags();
}
function removeSetupDept(i){ setupDepts.splice(i,1); renderSetupTags(); }
function saveSetup(){
  if(!setupDepts.length){showToast('Add at least one department or skip.','warn');return;}
  setupDepts.forEach(n=>{
    if(!departments.find(d=>d.name.toLowerCase()===n.toLowerCase()))
      departments.push({name:n,coordinator:'Not Assigned'});
  });
  saveDepts(); renderAll();
  localStorage.setItem(SETUP_KEY,'true');
  closeOverlay('setupModal');
  showToast('Departments saved!');
}
function skipSetup(){ localStorage.setItem(SETUP_KEY,'true'); closeOverlay('setupModal'); }
function checkSetup(){
  if(!localStorage.getItem(SETUP_KEY)){setupDepts=[];renderSetupTags();openOverlay('setupModal');}
}

/* ═══════════════ DEPT MANAGEMENT ═══════════════ */
async function addDept(){
  const inp = document.getElementById('newDeptInput');
  const n = inp.value.trim();

  if(!n){
    showToast('Enter a department name.','warn');
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: n,
        instituteId: Number(iid)   // IMPORTANT
      })
    });

    if(!res.ok) throw new Error("Failed");

    const data = await res.json();

    // ✅ Update UI (keep your existing flow)
    departments.push({
      id: data.id,
      name: data.name,
      coordinator: 'Not Assigned'
    });

    saveDepts();
    renderAll();

    inp.value='';
    showToast(`Department "${n}" added.`);

  } catch(err){
    console.error(err);
    showToast("Backend error, saved locally","warn");

    // fallback (your old logic)
    departments.push({name:n,coordinator:'Not Assigned'});
    saveDepts();
    renderAll();
  }
}

async function fetchDepartments(){
  try {
    const res = await fetch(`${API_BASE}/institute/${iid}`);
    const data = await res.json();

    // 🔥 Get existing local data (IMPORTANT FIX)
    const localDepts = JSON.parse(localStorage.getItem(DEPTS_KEY)) || [];

    // 🔥 Merge backend + local (DON'T lose coordinator, schedule, etc.)
    departments = data.map(d => {
      const local = localDepts.find(ld => ld.name === d.name) || {};

      return {
        id: d.id,
        name: d.name,
        coordinator: local.coordinator || 'Not Assigned',
        timeSlot: local.timeSlot,
        startDate: local.startDate,
        expertise: local.expertise,
        contactPerson: local.contactPerson
      };
    });

    saveDepts();   // 🔥 keep in sync
    renderAll();

  } catch(err){
    console.error("Backend error", err);
  }
}

async function deleteDeptFromBackend(id){
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE"
    });

    if(!res.ok) throw new Error("Delete failed");

    await fetchDepartments(); // reload from backend
    showToast("Department deleted successfully");

  } catch(err){
    console.error(err);
    showToast("Delete failed","error");
  }
}

let _delIdx=null;
function promptDel(i){
  _delIdx=i;
  document.getElementById('deleteDeptText').textContent=
    `Remove "${departments[i]?.name}"? This cannot be undone.`;
  openOverlay('deleteDeptModal');
}
function confirmDeleteDept(){
  if(_delIdx === null) return;

  const dept = departments[_delIdx];

  // If department has ID → delete from backend
  if(dept.id){
    deleteDeptFromBackend(dept.id);
  } else {
    // fallback (old local data)
    departments.splice(_delIdx,1);
    renderAll();
  }

  _delIdx = null;
  closeOverlay('deleteDeptModal');
}

function renderSettingsTable(){
  const tbody=document.getElementById('deptTable');
  const tpos=getTpo(); const tpoMap={};
  tpos.forEach(c=>{tpoMap[c.departmentName]=c;});
  if(!departments.length){
    tbody.innerHTML='<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:24px;">No departments added yet.</td></tr>';
    return;
  }
  tbody.innerHTML=departments.map((d,i)=>{
    const tpo=tpoMap[d.name];
    const coord=tpo?.coordinatorName||d.coordinator||'Not Assigned';
    return `<tr>
      <td><b>${d.name}</b></td>
      <td><span class="badge ${tpo?'bg-success':'bg-pending'}">${tpo?'<i class="fa-solid fa-circle-check"></i> '+coord:'<i class="fa-solid fa-clock"></i> Awaiting'}</span></td>
      <td><button class="btn btn-danger-outline btn-sm" onclick="promptDel(${i})"><i class="fa-solid fa-trash"></i> Remove</button></td>
    </tr>`;
  }).join('');
}

/* ═══════════════ DEPT CARDS ═══════════════ */
function renderDeptCards(){
  const grid=document.getElementById('deptCardsGrid');
  if(!grid)return;
  const tpos=getTpo(); const tpoMap={};
  tpos.forEach(c=>{tpoMap[c.departmentName]=c;});
  const leg=getLegacy(); const legMap={};
  leg.forEach(d=>{legMap[d.departmentName||d.name]=d;});

  if(!departments.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13.5px;grid-column:1/-1;padding:20px 0;">No departments yet. Add them in <strong>Settings</strong>.</p>';
    return;
  }
  grid.innerHTML='';
  departments.forEach((dept,idx)=>{
    const color=palette[idx%palette.length];
    const tpo=tpoMap[dept.name]||null;
    const l=legMap[dept.name]||{};
    const coord=tpo?.coordinatorName||l.coordinatorName||dept.coordinator||'Not Assigned';
    const email=tpo?.email||l.email||'—';
    const phone=tpo?.phone||l.phone||'—';
    const desg =tpo?.designation||l.designation||'TPO Coordinator';
    const isReg=!!tpo;
    const regBadge=isReg
      ?`<span class="badge bg-success"><i class="fa-solid fa-circle-check"></i> Coordinator Registered</span>`
      :`<span class="badge bg-pending"><i class="fa-solid fa-clock"></i> Awaiting Registration</span>`;
    const initials=coord!=='Not Assigned'?coord.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3):'N/A';

    const card=document.createElement('div');
    card.className='dept-card';
    card.style.cssText=`border-left:5px solid ${color};background:linear-gradient(to bottom right,${color}10,#fff);`;
    card.innerHTML=`
      <div class="dept-card-top">
        <div>
          <div class="dept-card-title">${dept.name}</div>
          <div style="margin-top:6px;">${regBadge}</div>
        </div>
        <i class="fa-solid fa-users-rectangle" style="color:${color};opacity:.6;font-size:18px;"></i>
      </div>
      <div class="coord-meta">TPO Coordinator</div>
      <div class="coord-name">${coord}</div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px;">
          <span>Progress</span><span style="color:${color}">0%</span>
        </div>
        <div class="prog-bar-wrap"><div class="prog-bar-fill" style="width:0%;background:${color};"></div></div>
      </div>`;
    card.onclick=()=>loadDeptDetail(dept.name,coord,initials,email,phone,desg,color);
    grid.appendChild(card);
  });
}

function loadDeptDetail(name,coord,initials,email,phone,desg,color){
  const d=document.getElementById('deptDetailInline');
  d.style.display='block';
  document.getElementById('det-title').innerHTML=`<i class="fa-solid fa-sitemap" style="color:${color};"></i> ${name}`;
  document.getElementById('det-icon').textContent=initials;
  document.getElementById('det-coord-name').textContent=coord;
  document.getElementById('det-coord-desg').textContent=desg||'TPO Coordinator';
  document.getElementById('det-coord-email').innerHTML=`<i class="fa-solid fa-envelope"></i> ${email}`;
  document.getElementById('det-coord-phone').innerHTML=`<i class="fa-solid fa-phone"></i> ${phone}`;
  document.getElementById('det-total').textContent='—';
  document.getElementById('det-comp').textContent='—';
  document.getElementById('det-sched').textContent='—';
  document.getElementById('det-pend').textContent='—';
  document.getElementById('det-perc-text').textContent='0%';
  document.getElementById('det-perc-bar').style.width='0%';
  d.scrollIntoView({behavior:'smooth',block:'start'});
}
function hideDeptDetail(){ document.getElementById('deptDetailInline').style.display='none'; }

/* ═══════════════ OVERVIEW ═══════════════ */
function renderOverview(){
  const tpos=getTpo(); const tpoMap={};
  tpos.forEach(c=>{tpoMap[c.departmentName]=c;});
  const leg=getLegacy(); const legMap={};
  leg.forEach(d=>{legMap[d.departmentName||d.name]=d;});

  let total=0,pending=0,confirmed=0,cancelled=0,rescheduled=0;
  departments.forEach(d=>{
    const l=legMap[d.name]||{};
    if(!(d.timeSlot||d.startDate||l.timeSlot||l.startDate))return;
    total++;
    const s=getStatus(d.name);
    if(s==='Pending')pending++;
    if(s==='Confirmed')confirmed++;
    if(s==='Cancel')cancelled++;
    if(s==='Rescheduled')rescheduled++;
  });

  document.getElementById('ovDepts').textContent=departments.length;
  document.getElementById('ovReqs').textContent=total;
  document.getElementById('ovConfirmed').textContent=confirmed;
  document.getElementById('ovPending').textContent=pending;

  // status summary
  const summary=document.getElementById('ovStatusSummary');
  if(!departments.length){
    summary.innerHTML='<p style="color:var(--muted);font-size:13.5px;">No departments found. Add some in <strong>Settings</strong>.</p>';
  } else {
    const statuses=[['Pending',pending,'#D97706'],['Confirmed',confirmed,'var(--secondary)'],
      ['Rescheduled',rescheduled,'#8B5CF6'],['Cancel',cancelled,'var(--danger)']];
    summary.innerHTML=statuses.map(([s,c,col])=>{
      const pct=total?((c/total)*100).toFixed(0):0;
      return `<div class="status-row">
        <div class="status-row-top">
          <span style="display:flex;align-items:center;gap:7px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${col};display:inline-block;"></span>${s}
          </span>
          <span style="color:${col};">${c} dept${c!==1?'s':''}</span>
        </div>
        <div class="prog-bar-wrap"><div class="prog-bar-fill" style="width:${pct}%;background:${col};"></div></div>
      </div>`;
    }).join('');
  }

  // overview dept grid
  const grid=document.getElementById('ovDeptGrid');
  if(!departments.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13.5px;">No departments added yet.</p>';
    return;
  }
  grid.innerHTML='';
  departments.forEach((dept,idx)=>{
    const color=palette[idx%palette.length];
    const tpo=tpoMap[dept.name]||null;
    const l=legMap[dept.name]||{};
    const coord=tpo?.coordinatorName||l.coordinatorName||dept.coordinator||'Not Assigned';
    const status=getStatus(dept.name);
    const isReg=!!tpo;

    const card=document.createElement('div');
    card.className='ov-dept-card';
    card.style.cssText=`border-left:4px solid ${color};background:linear-gradient(to bottom right,${color}0d,#fff);`;
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <b style="font-size:13.5px;">${dept.name}</b>
        <i class="fa-solid fa-users-rectangle" style="color:${color};opacity:.6;font-size:14px;"></i>
      </div>
      <div style="margin-bottom:8px;">
        ${isReg
          ?`<span class="badge bg-success" style="font-size:10.5px;"><i class="fa-solid fa-circle-check"></i> Registered</span>`
          :`<span class="badge bg-pending" style="font-size:10.5px;"><i class="fa-solid fa-clock"></i> Awaiting</span>`}
      </div>
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;">Coordinator</div>
      <div style="font-weight:700;font-size:13px;margin-bottom:10px;">${coord}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11.5px;font-weight:600;color:var(--muted);">Request</span>
        ${statusBadge(status)}
      </div>`;
    card.onclick=()=>openDeptModal(dept,tpo,l,color);
    grid.appendChild(card);
  });
}

function openDeptModal(dept,tpo,l,color){
  const coord=tpo?.coordinatorName||l.coordinatorName||dept.coordinator||'Not Assigned';
  const email=tpo?.email||l.email||'—';
  const phone=tpo?.phone||l.phone||'—';
  const desg =tpo?.designation||l.designation||'TPO Coordinator';
  const timeSlot=dept.timeSlot||l.timeSlot||'Not Scheduled';
  const expertise=dept.expertise||l.expertise||'—';
  const isReg=!!tpo;
  const status=getStatus(dept.name);
  document.getElementById('deptDetailTitle').innerHTML=
    `<i class="fa-solid fa-sitemap" style="color:${color};"></i> ${dept.name}`;
  document.getElementById('deptDetailBody').innerHTML=`
    <div class="modal-stat-grid">
      <div class="modal-stat-box">
        <div class="ms-label"><i class="fa-solid fa-user-tie"></i> TPO Coordinator</div>
        <div class="ms-value">${coord}</div>
        <div class="ms-sub"><i class="fa-solid fa-envelope"></i> ${email}</div>
        <div class="ms-sub"><i class="fa-solid fa-phone"></i> ${phone}</div>
        <div class="ms-sub"><i class="fa-solid fa-briefcase"></i> ${desg}</div>
      </div>
      <div class="modal-stat-box">
        <div class="ms-label"><i class="fa-solid fa-calendar"></i> Interview Slot</div>
        <div class="ms-value" style="font-size:13px;">${timeSlot}</div>
        <div class="ms-label" style="margin-top:12px;"><i class="fa-solid fa-code"></i> Expertise</div>
        <div class="ms-value" style="font-size:13px;">${expertise}</div>
      </div>
    </div>
    <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border:1px solid var(--border);">
      <span style="font-size:13px;font-weight:700;">Request Status</span>${statusBadge(status)}
    </div>
    <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);">
      <span style="font-size:13px;font-weight:700;">Coordinator Registration</span>
      ${isReg
        ?`<span class="badge bg-success"><i class="fa-solid fa-circle-check"></i> Registered</span>`
        :`<span class="badge bg-pending"><i class="fa-solid fa-clock"></i> Awaiting</span>`}
    </div>
    <div style="display:flex;gap:10px;margin-top:18px;">
      <button class="btn btn-p" style="flex:1;justify-content:center;" onclick="showView('schedule');closeOverlay('deptDetailModal');">
        <i class="fa-solid fa-calendar-plus"></i> Schedule
      </button>
      <button class="btn btn-ghost" style="flex:1;justify-content:center;" onclick="closeOverlay('deptDetailModal');">
        <i class="fa-solid fa-xmark"></i> Close
      </button>
    </div>`;
  openOverlay('deptDetailModal');
}

/* ═══════════════ REQUESTS ═══════════════ */
function renderReqStats(){
  const today=new Date().toISOString().slice(0,10);
  const leg=getLegacy(); const legMap={};
  leg.forEach(d=>{legMap[d.departmentName||d.name]=d;});
  let total=0,pending=0,confirmed=0,canceled=0,todayCount=0;
  departments.forEach(d=>{
    const l=legMap[d.name]||{};
    if(!(d.timeSlot||d.startDate||l.timeSlot||l.startDate))return;
    total++;
    const s=getStatus(d.name);
    if(s==='Pending')pending++;
    if(s==='Confirmed')confirmed++;
    if(s==='Cancel')canceled++;
    const sd=d.startDate||l.startDate||'';
    if(sd&&sd.startsWith(today))todayCount++;
  });
  const rate=total?Math.round((confirmed/total)*100):0;
  document.getElementById('rscTotal').textContent=total;
  document.getElementById('rscPending').textContent=pending;
  document.getElementById('rscConfirmed').textContent=confirmed;
  document.getElementById('rscCanceled').textContent=canceled;
  document.getElementById('rscToday').textContent=todayCount;
  document.getElementById('rscRate').textContent=rate+'%';
}

function populateDeptFilter(){
  const sel=document.getElementById('fDept');
  if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">All Departments</option>';
  const leg=getLegacy(); const legMap={};
  leg.forEach(d=>{legMap[d.departmentName||d.name]=d;});
  departments.forEach(d=>{
    const l=legMap[d.name]||{};
    if(!(d.timeSlot||d.startDate||l.timeSlot||l.startDate))return;
    sel.innerHTML+=`<option value="${d.name}">${d.name}</option>`;
  });
  sel.value=cur;
}

function renderReqTable(){ populateDeptFilter(); applyFilters(); }

function applyFilters(){
  const tbody=document.getElementById('reqTableBody');
  if(!tbody)return;
  const fS=(document.getElementById('fStatus')?.value||'').trim();
  const fD=(document.getElementById('fDept')?.value||'').trim();
  const fDate=(document.getElementById('fDate')?.value||'').trim();
  const fQ=(document.getElementById('fSearch')?.value||'').trim().toLowerCase();
  const leg=getLegacy(); const legMap={};
  leg.forEach(d=>{legMap[d.departmentName||d.name]=d;});
  const tpos=getTpo(); const tpoMap={};
  tpos.forEach(c=>{tpoMap[c.departmentName]=c;});

  const sched=departments.filter(d=>{
    const l=legMap[d.name]||{};
    return !!(d.timeSlot||d.startDate||l.timeSlot||l.startDate);
  });

  tbody.innerHTML='';
  if(!sched.length){
    tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px;">
      No interviews scheduled yet. <a href="javascript:void(0)" onclick="showView('schedule')" style="color:var(--primary);font-weight:700;">Schedule one →</a>
    </td></tr>`;
    renderChips(fS,fD,fDate,fQ);
    document.getElementById('reqCount').textContent='';
    return;
  }

  let visible=0;
  sched.forEach(d=>{
    const l=legMap[d.name]||{};
    const tpo=tpoMap[d.name]||null;
    const coord=tpo?.coordinatorName||l.coordinatorName||d.coordinator||'Not Assigned';
    const exp=d.expertise||l.expertise||'—';
    const slot=d.timeSlot||l.timeSlot||'Not Scheduled';
    const sd=d.startDate||l.startDate||'';
    const s=getStatus(d.name);
    if(fS&&s!==fS)return;
    if(fD&&d.name!==fD)return;
    if(fDate){const slotDate=sd?sd.slice(0,10):slot.slice(0,10);if(!slotDate.startsWith(fDate))return;}
    if(fQ&&!(d.name+' '+coord+' '+exp).toLowerCase().includes(fQ))return;
    visible++;
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><b>${d.name}</b></td><td>${coord}</td>
      <td style="font-size:12.5px;color:var(--muted);">${exp}</td>
      <td style="font-size:12.5px;color:var(--muted);">${slot}</td>
      <td>${statusBadge(s)}</td>`;
    tbody.appendChild(tr);
  });

  if(!visible) tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--muted);">
    No results match your filters. <a href="javascript:void(0)" onclick="resetFilters()" style="color:var(--primary);font-weight:700;">Reset filters</a>
  </td></tr>`;

  document.getElementById('reqCount').textContent=
    visible===sched.length?`Showing all ${sched.length} department${sched.length!==1?'s':''}`
    :`Showing ${visible} of ${sched.length} department${sched.length!==1?'s':''}`;
  renderChips(fS,fD,fDate,fQ);
}

function renderChips(fS,fD,fDate,fQ){
  const c=document.getElementById('activeChips');
  const chips=[];
  if(fS)chips.push({l:'Status: '+fS,clear:()=>{document.getElementById('fStatus').value='';applyFilters();}});
  if(fD)chips.push({l:'Dept: '+fD,clear:()=>{document.getElementById('fDept').value='';applyFilters();}});
  if(fDate)chips.push({l:'Date: '+fDate,clear:()=>{document.getElementById('fDate').value='';applyFilters();}});
  if(fQ)chips.push({l:'Search: "'+fQ+'"',clear:()=>{document.getElementById('fSearch').value='';applyFilters();}});
  window.__chipClears=chips.map(ch=>ch.clear);
  c.innerHTML=chips.map((ch,i)=>`<span class="chip">${ch.l}<i class="fa-solid fa-xmark" onclick="__chipClears[${i}]()"></i></span>`).join('');
}

function resetFilters(){
  ['fStatus','fDept','fDate','fSearch'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  applyFilters();
}

/* ═══════════════ STATUS BADGE ═══════════════ */
function statusBadge(s){
  const map={Pending:'bg-pending',Confirmed:'bg-success',Rescheduled:'bg-purple',Cancel:'bg-cancel'};
  const ico={Pending:'fa-clock',Confirmed:'fa-circle-check',Rescheduled:'fa-rotate',Cancel:'fa-ban'};
  return `<span class="badge ${map[s]||'bg-pending'}"><i class="fa-solid ${ico[s]||'fa-clock'}"></i> ${s}</span>`;
}

/* ═══════════════ SCHEDULE FORM ═══════════════ */
function renderDeptCheckboxes(){
  const grid=document.getElementById('deptCbGrid');
  if(!grid)return;
  if(!departments.length){
    grid.innerHTML='<p style="color:var(--muted);font-size:13px;">No departments yet. Add them in Settings first.</p>';
    return;
  }
  grid.innerHTML=departments.map(d=>{
    const sid='dcb_'+d.name.replace(/\s+/g,'_');
    return `<div class="cb-item" id="w_${sid}" onclick="toggleCbDept('${sid}')">
      <input type="checkbox" id="${sid}" value="${d.name}" onchange="syncDeptTags()">
      <label for="${sid}">${d.name}</label>
    </div>`;
  }).join('');
  syncDeptTags();
}

function toggleCbDept(id){
  const cb=document.getElementById(id);
  cb.checked=!cb.checked;
  document.getElementById('w_'+id).classList.toggle('checked',cb.checked);
  syncDeptTags();
}
function syncDeptTags(){
  const checked=[...document.querySelectorAll('#deptCbGrid input:checked')];
  document.getElementById('deptCbTags').innerHTML=checked.map(cb=>`
    <span class="tag-item"><i class="fa-solid fa-sitemap" style="font-size:9px;"></i>${cb.value}
      <i class="fa-solid fa-xmark" onclick="uncheckDept('${cb.id}')"></i>
    </span>`).join('');
}
function uncheckDept(id){
  const cb=document.getElementById(id); if(cb){cb.checked=false;}
  document.getElementById('w_'+id)?.classList.remove('checked');
  syncDeptTags();
}

function toggleCb(el){
  const cb=el.querySelector('input[type="checkbox"]');
  cb.checked=!cb.checked;
  el.classList.toggle('checked',cb.checked);
  syncExpTags();
}
function syncExpTags(){
  const checked=[...document.querySelectorAll('#expertiseCbGrid input:checked')];
  document.getElementById('expTags').innerHTML=checked.map(cb=>`
    <span class="tag-item">${cb.value}
      <i class="fa-solid fa-xmark" onclick="uncheckExp('${cb.id}')"></i>
    </span>`).join('');
}
function uncheckExp(id){
  const cb=document.getElementById(id); if(cb){cb.checked=false;}
  cb?.closest('.cb-item')?.classList.remove('checked');
  syncExpTags();
}
function addCustomDomain(){
  const inp=document.getElementById('customDomainInput');
  const n=inp.value.trim(); if(!n)return;
  const all=[...document.querySelectorAll('#expertiseCbGrid input')];
  const ex=all.find(cb=>cb.value.toLowerCase()===n.toLowerCase());
  if(ex){ex.checked=true;ex.closest('.cb-item')?.classList.add('checked');syncExpTags();inp.value='';return;}
  const id='exp_custom_'+Date.now();
  const item=document.createElement('div');
  item.className='cb-item checked';
  item.onclick=function(){toggleCb(this);};
  item.innerHTML=`<input type="checkbox" id="${id}" value="${n}" checked onchange="syncExpTags()"><label for="${id}">${n}</label>`;
  document.getElementById('expertiseCbGrid').appendChild(item);
  syncExpTags(); inp.value='';
}
function getSelectedDepts(){ return [...document.querySelectorAll('#deptCbGrid input:checked')].map(c=>c.value); }
function getSelectedExp(){   return [...document.querySelectorAll('#expertiseCbGrid input:checked')].map(c=>c.value); }

function handleSchedSubmit(e){
  e.preventDefault();
  const depts=getSelectedDepts();
  if(!depts.length){showToast('Select at least one department.','warn');return;}
  const exp=getSelectedExp();
  if(!exp.length){showToast('Select at least one expertise domain.','warn');return;}
  const start=document.getElementById('startDT').value;
  const end  =document.getElementById('endDT').value;
  const cp   =document.getElementById('contactPerson').value;
  const ce   =document.getElementById('contactEmail').value;
  const rem  =document.getElementById('schedRemarks').value;
  if(!start||!end||!cp||!ce){showToast('Fill in all required fields.','warn');return;}
  const timeSlot=start+' – '+end;
  const expertise=exp.join(', ');
  const stored=getLegacy();

  depts.forEach(name=>{
    setStatus(name,'Pending');
    const idx=departments.findIndex(d=>d.name===name);
    if(idx!==-1){departments[idx].timeSlot=timeSlot;departments[idx].startDate=start;
      departments[idx].expertise=expertise;departments[idx].contactPerson=cp;}
    const si=stored.findIndex(d=>(d.departmentName||d.name)===name);
    const entry={departmentName:name,expertise,timeSlot,startDate:start,endDate:end,contactPerson:cp,contactEmail:ce,remarks:rem};
    if(si!==-1)stored[si]={...stored[si],...entry};
    else stored.push(entry);
  });
  localStorage.setItem('departments',JSON.stringify(stored));
  saveDepts();
  // uncheck
  document.querySelectorAll('#deptCbGrid input:checked').forEach(cb=>{cb.checked=false;cb.closest('.cb-item')?.classList.remove('checked');});
  syncDeptTags();
  document.querySelectorAll('#expertiseCbGrid input:checked').forEach(cb=>{cb.checked=false;cb.closest('.cb-item')?.classList.remove('checked');});
  document.querySelectorAll('#expertiseCbGrid .cb-item').forEach(el=>{if(el.querySelector('input')?.id?.includes('custom'))el.remove();});
  syncExpTags();
  document.getElementById('schedForm').reset();
  renderReqStats(); renderOverview();
  openOverlay('schedSuccessModal');
}

/* ═══════════════ REGISTRATION LINK ═══════════════ */
async function genRegLink(){
  try {
    const res = await fetch(`http://localhost:8080/register/institutes/${iid}/registration-link`);
    const link = await res.text();

    document.getElementById('genLinkText').textContent = link;
    document.getElementById('genLinkBox').style.display = 'block';

  } catch(err){
    console.error(err);
    showToast("Failed to generate link","error");
  }
}
function copyGenLink(){
  const link=document.getElementById('genLinkText').textContent;
  navigator.clipboard.writeText(link).then(()=>{
    document.getElementById('copyLinkPreview').textContent=link;
    openOverlay('copyLinkModal');
  });
}

/* ═══════════════ STATUS CONFIRM ═══════════════ */
let _pendStatus=null,_pendDropdown=null,_prevStatus=null,_newStatus=null;
function handleStatusChange(sel){
  _prevStatus=sel.dataset.previous||'Pending';
  _newStatus=sel.value;
  _pendDropdown=sel;
  document.getElementById('statusModalTitle').textContent='Confirm Status Change';
  document.getElementById('statusModalText').textContent=`Change status to "${_newStatus}"?`;
  openOverlay('statusModal');
}
function confirmStatus(){
  if(_pendDropdown) _pendDropdown.dataset.previous=_newStatus;
  if(_pendStatus){ setStatus(_pendStatus,_newStatus); renderReqTable(); renderOverview(); renderReqStats(); }
  _pendStatus=null; _pendDropdown=null;
  closeOverlay('statusModal');
}
function cancelStatus(){
  if(_pendDropdown) _pendDropdown.value=_prevStatus;
  _pendStatus=null; _pendDropdown=null;
  closeOverlay('statusModal');
}

/* ═══════════════ BRANDING / LOGO ═══════════════ */
const LOGO_KEY    = 'instituteLogo_'+iid;
const BRANDING_KEY= 'instituteBranding_'+iid;

function initBranding(){
  const name=loggedInstitute.instituteName||loggedInstitute.name||'Institute';
  const inp=document.getElementById('instDisplayName');
  if(inp) inp.value=name;
  const saved=JSON.parse(localStorage.getItem(BRANDING_KEY)||'{}');
  if(saved.website) document.getElementById('instWebsite').value=saved.website;
  if(saved.displayName){ if(inp) inp.value=saved.displayName; }
  document.getElementById('logoInstNameDisplay').textContent=saved.displayName||name;
  const logo=localStorage.getItem(LOGO_KEY);
  if(logo) applyLogoPreview(logo);
}

function applyLogoPreview(src){
  const img=document.getElementById('logoPreviewImg');
  const icon=document.getElementById('logoPlaceholderIcon');
  const rmBtn=document.getElementById('removeLogoBtn');
  img.src=src; img.style.display='block';
  icon.style.display='none';
  rmBtn.style.display='inline-flex';
}

function handleLogoUpload(e){
  const file=e.target.files[0];
  if(!file)return;
  if(file.size>2*1024*1024){showToast('File too large. Max 2 MB.','warn');return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    localStorage.setItem(LOGO_KEY,ev.target.result);
    applyLogoPreview(ev.target.result);
    showToast('Logo uploaded successfully!');
  };
  reader.readAsDataURL(file);
  e.target.value='';
}

function removeLogo(){
  localStorage.removeItem(LOGO_KEY);
  const img=document.getElementById('logoPreviewImg');
  const icon=document.getElementById('logoPlaceholderIcon');
  const rmBtn=document.getElementById('removeLogoBtn');
  img.src=''; img.style.display='none';
  icon.style.display='';
  rmBtn.style.display='none';
  showToast('Logo removed.');
}

function saveBranding(){
  const displayName=(document.getElementById('instDisplayName').value||'').trim();
  const website   =(document.getElementById('instWebsite').value||'').trim();
  if(!displayName){showToast('Enter an institute display name.','warn');return;}
  const saved={displayName,website};
  localStorage.setItem(BRANDING_KEY,JSON.stringify(saved));
  document.getElementById('logoInstNameDisplay').textContent=displayName;
  // update header too
  document.getElementById('headerInstName').textContent=displayName.length>20?displayName.slice(0,20)+'…':displayName;
  document.getElementById('dropInstName').textContent=displayName;
  showToast('Branding saved successfully!');
}


function changePassword(){
  const cur=document.getElementById('curPass').value;
  const np=document.getElementById('newPass').value;
  const cp=document.getElementById('confirmPass').value;
  if(!cur){showToast('Enter current password.','warn');return;}
  if(np.length<8){showToast('New password must be at least 8 characters.','warn');return;}
  if(np!==cp){showToast('Passwords do not match.','warn');return;}
  showToast('Password updated successfully!');
  document.getElementById('curPass').value='';
  document.getElementById('newPass').value='';
  document.getElementById('confirmPass').value='';
}

/* ═══════════════ LOGOUT ═══════════════ */
function openLogout(){
  if(localStorage.getItem('skipLogoutConfirm')==='true'){confirmLogout();return;}
  openOverlay('logoutModal');
}
function confirmLogout(){
  if(document.getElementById('skipLogout')?.checked) localStorage.setItem('skipLogoutConfirm','true');
  localStorage.removeItem('currentInstitute');
  showToast('Logged out successfully.');
  setTimeout(()=>{window.location.href='login.html';},800);
}

/* ═══════════════ TOAST ═══════════════ */
function showToast(msg,type='success'){
  const cols={success:['#DCFCE7','#166534'],warn:['#FEF3C7','#92400E'],error:['#FEE2E2','#991B1B']};
  const[bg,col]=cols[type]||cols.success;
  const t=document.createElement('div');
  t.className='toast';
  t.style.cssText=`background:${bg};color:${col};`;
  t.innerHTML=`<i class="fa-solid fa-${type==='error'?'circle-xmark':type==='warn'?'triangle-exclamation':'circle-check'}"></i>${msg}`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

/* ═══════════════ RENDER ALL ═══════════════ */
function renderAll(){
  renderOverview(); renderDeptCards(); renderSettingsTable();
  renderDeptCheckboxes(); renderReqStats(); renderReqTable();
}

/* ═══════════════ INIT ═══════════════ */
window.addEventListener('DOMContentLoaded',()=>{
  initHeader();
  initBranding();
  const saved=JSON.parse(localStorage.getItem(DEPTS_KEY))||[];
  departments=saved;
  renderAll();
  fetchDepartments();
  checkSetup();
});