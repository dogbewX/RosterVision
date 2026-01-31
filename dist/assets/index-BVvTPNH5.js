(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();function x(s){if(!s)return[];const e=s.split(`
`);if(e.length<2)return[];const t=e[0].split(",").map(a=>a.trim()),r={id:t.indexOf("Id"),pos:t.indexOf("Position"),name:t.indexOf("Nickname"),fppg:t.indexOf("FPPG"),salary:t.indexOf("Salary"),game:t.indexOf("Game"),team:t.indexOf("Team"),opp:t.indexOf("Opponent"),injury:t.indexOf("Injury Indicator"),details:t.indexOf("Injury Details")},n=[];for(let a=1;a<e.length;a++){const l=e[a];if(!l.trim())continue;const o=l.split(","),d=parseFloat(o[r.fppg])||0,y=parseInt(o[r.salary])||0,h=y>0?d/y*1e3:0;n.push({id:o[r.id],pos:o[r.pos],name:o[r.name],team:o[r.team],opp:o[r.opp],game:o[r.game],fppg:d,salary:y,injury:o[r.injury],injuryDetails:o[r.details],value:h})}return n}function L(s,e){return s.filter(t=>{const r=e.position==="ALL"||t.pos===e.position,n=t.salary<=e.maxSalary,a=e.search.toLowerCase(),l=!a||t.name&&t.name.toLowerCase().includes(a)||t.team&&t.team.toLowerCase().includes(a);return r&&n&&l})}function E(s,e){const t=[...s];return t.sort((r,n)=>{const[a,l]=e.split("-"),o=r[a]||0,d=n[a]||0;return l==="asc"?o-d:d-o}),t}let g=[],c=[],i={search:"",position:"ALL",maxSalary:1e4,sortBy:"value-desc"};const p=document.getElementById("playerGrid"),O=document.getElementById("searchInput"),m=document.querySelectorAll(".pos-btn"),S=document.getElementById("salaryRange"),P=document.getElementById("salaryValue"),b=document.getElementById("sortSelect"),I=document.getElementById("totalPlayers"),f=document.getElementById("avgValue"),v=document.getElementById("resultsTitle"),B={QB:"#ef4444",RB:"#3b82f6",WR:"#10b981",TE:"#f59e0b",D:"#8b5cf6"};async function C(){try{const e=await(await fetch("/assets/FanDuel-players-list.csv")).text();g=x(e),u(),$()}catch(s){console.error("Failed to load data:",s),p.innerHTML='<div class="error">Failed to load player data. Ensure CSV is in public/assets.</div>'}}function $(){O.addEventListener("input",s=>{i.search=s.target.value.toLowerCase(),u()}),m.forEach(s=>{s.addEventListener("click",()=>{m.forEach(e=>e.classList.remove("active")),s.classList.add("active"),i.position=s.dataset.pos,u()})}),S.addEventListener("input",s=>{i.maxSalary=parseInt(s.target.value),P.textContent=`$${i.maxSalary.toLocaleString()}`,u()}),b.addEventListener("change",s=>{i.sortBy=s.target.value,u()})}function u(){const s=L(g,i);c=E(s,i.sortBy),j(),F()}function j(){if(I.textContent=c.length,c.length>0){const s=c.reduce((e,t)=>e+t.value,0)/c.length;f.textContent=s.toFixed(2)}else f.textContent="0.00";i.position!=="ALL"?v.textContent=`${i.position} Players`:v.textContent="All Players"}function F(){if(p.innerHTML="",c.length===0){p.innerHTML='<div class="no-results">No players match your filters.</div>';return}const s=document.createDocumentFragment();c.forEach(e=>{const t=document.createElement("div");t.className="player-card",t.style.setProperty("--card-color",B[e.pos]||"#ccc");const r=e.injury?`<div class="injury-tag status-injured" title="${e.injuryDetails}">${e.injury}</div>`:"";t.innerHTML=`
            <div class="game-info">${e.game}</div>
            <div class="card-header">
                <div class="player-info">
                    <h3>${e.name}</h3>
                    <div class="player-meta">
                        <span class="position-badge">${e.pos}</span>
                        <span class="team-badge">${e.team}</span>
                        ${r}
                    </div>
                </div>
            </div>
            
            <div class="card-stats">
                <div class="stat-box">
                    <span class="label">Salary</span>
                    <span class="value">$${e.salary.toLocaleString()}</span>
                </div>
                <div class="stat-box">
                    <span class="label">FPPG</span>
                    <span class="value">${e.fppg.toFixed(1)}</span>
                </div>
                <div class="stat-box">
                    <span class="label">Value Score</span>
                    <span class="value value-score">${e.value.toFixed(2)}</span>
                </div>
                 <div class="stat-box">
                    <span class="label">Opponent</span>
                    <span class="value">${e.opp}</span>
                </div>
            </div>
`,s.appendChild(t)}),p.appendChild(s)}C();
