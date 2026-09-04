const DEFAULT_NEWS = [
  {id:1,title:"Большое обновление проекта",tag:"Обновления",description:"Новые изменения, исправления и улучшения игрового процесса.",content:"В проекте вышло новое обновление. Здесь позже будет размещён полноценный текст новости с подробностями изменений.",date:Date.now()-1000*60*35,image:""},
  {id:2,title:"Изменения в руководстве сервера",tag:"Сервера",description:"Обновлена структура руководства одного из серверов проекта.",content:"В руководстве сервера произошли изменения. Подробности и список новых должностей будут опубликованы здесь.",date:Date.now()-1000*60*60*5,image:""},
  {id:3,title:"Новости сообщества",tag:"Сообщество",description:"Последние события и интересные новости нашего сообщества.",content:"Здесь будет размещаться информация о событиях сообщества.",date:Date.now()-1000*60*60*26,image:""}
];
const DEFAULT_CHANGES = [
  {id:101,title:"Обновлена система новостей",description:"Добавлен новый раздел новостей проекта.",date:Date.now()-1000*60*18},
  {id:102,title:"Изменена структура серверов",description:"Обновлена информация о проектах и серверах.",date:Date.now()-1000*60*60*4},
  {id:103,title:"Исправлены ошибки интерфейса",description:"Исправлены мелкие визуальные ошибки.",date:Date.now()-1000*60*60*28}
];

function getData(key, fallback){try{const x=localStorage.getItem(key);return x?JSON.parse(x):fallback}catch{return fallback}}
function saveData(key,data){localStorage.setItem(key,JSON.stringify(data))}
let news=getData("scp_news",DEFAULT_NEWS), changes=getData("scp_changes",DEFAULT_CHANGES);

function ago(ts){
  let s=Math.max(0,Date.now()-ts)/1000;
  if(s<60)return "только что";
  if(s<3600)return Math.floor(s/60)+" мин. назад";
  if(s<86400)return Math.floor(s/3600)+" ч. назад";
  if(s<604800)return Math.floor(s/86400)+" дн. назад";
  return new Date(ts).toLocaleDateString("ru-RU");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

const grid=document.getElementById("newsGrid");
function renderNews(filter="all"){
  if(!grid)return;
  const list=news.filter(n=>filter==="all"||n.tag===filter);
  grid.innerHTML=list.map(n=>`
    <article class="news-card">
      <a href="news.html?id=${n.id}">
        <div class="news-image">${n.image?`<img src="${n.image}" alt="">`:"" }<span class="tag">${esc(n.tag)}</span></div>
        <div class="news-body"><h3>${esc(n.title)}</h3><p>${esc(n.description)}</p><div class="meta">${ago(n.date)}</div></div>
      </a>
    </article>`).join("")||'<p class="lead">Новостей пока нет.</p>';
}
renderNews();
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderNews(b.dataset.filter)}));

const changesList=document.getElementById("changesList");
function renderChanges(){
 if(!changesList)return;
 changesList.innerHTML=changes.map(c=>`<div class="change"><div class="change-time">${ago(c.date)}</div><div><h4>${esc(c.title)}</h4><p>${esc(c.description)}</p></div></div>`).join("");
}
renderChanges();
setInterval(()=>{renderNews(document.querySelector(".filter.active")?.dataset.filter||"all");renderChanges();renderAdmin()},30000);

const article=document.getElementById("article");
if(article){
 const id=new URLSearchParams(location.search).get("id"), n=news.find(x=>String(x.id)===String(id))||news[0];
 if(n)article.innerHTML=`<span class="article-tag">${esc(n.tag)}</span><h1>${esc(n.title)}</h1><div class="article-date">${new Date(n.date).toLocaleString("ru-RU")}</div><div class="article-cover">${n.image?`<img src="${n.image}" alt="">`:""}</div><div class="article-content">${esc(n.content)}</div>`;
}

const loginBtn=document.getElementById("loginBtn");
if(loginBtn)loginBtn.addEventListener("click",()=>{document.getElementById("loginCard").classList.add("hidden");document.getElementById("dashboard").classList.remove("hidden");renderAdmin()});
function renderAdmin(){
 const an=document.getElementById("adminNews"),ac=document.getElementById("adminChanges");
 if(!an||!ac)return;
 an.innerHTML=news.map(n=>`<div class="admin-item"><div><b>${esc(n.title)}</b><small>${esc(n.tag)} · ${ago(n.date)}</small></div><div class="actions"><button class="danger" onclick="deleteNews(${n.id})">Удалить</button></div></div>`).join("");
 ac.innerHTML=changes.map(c=>`<div class="admin-item"><div><b>${esc(c.title)}</b><small>${ago(c.date)}</small></div><div class="actions"><button class="danger" onclick="deleteChange(${c.id})">Удалить</button></div></div>`).join("");
}
window.deleteNews=function(id){if(confirm("Удалить новость?")){news=news.filter(n=>n.id!==id);saveData("scp_news",news);renderAdmin();renderNews()}};
window.deleteChange=function(id){if(confirm("Удалить изменение?")){changes=changes.filter(c=>c.id!==id);saveData("scp_changes",changes);renderAdmin();renderChanges()}};

const newNewsBtn=document.getElementById("newNewsBtn"),editor=document.getElementById("editor");
if(newNewsBtn)newNewsBtn.onclick=()=>editor.classList.remove("hidden");
document.getElementById("closeEditor")?.addEventListener("click",()=>editor.classList.add("hidden"));
document.getElementById("saveNews")?.addEventListener("click",()=>{
 const title=document.getElementById("formTitle").value.trim(),tag=document.getElementById("formTag").value,desc=document.getElementById("formDescription").value.trim(),content=document.getElementById("formContent").value.trim(),file=document.getElementById("formImage").files[0];
 if(!title||!desc||!content)return alert("Заполни заголовок, описание и текст.");
 const add=image=>{news.unshift({id:Date.now(),title,tag,description:desc,content,date:Date.now(),image:image||""});saveData("scp_news",news);editor.classList.add("hidden");document.querySelectorAll("#editor input,#editor textarea").forEach(x=>x.value="");renderAdmin()};
 if(file){const r=new FileReader();r.onload=()=>add(r.result);r.readAsDataURL(file)}else add("");
});

const ce=document.getElementById("changeEditor");
document.getElementById("newChangeBtn")?.addEventListener("click",()=>ce.classList.remove("hidden"));
document.getElementById("closeChange")?.addEventListener("click",()=>ce.classList.add("hidden"));
document.getElementById("saveChange")?.addEventListener("click",()=>{
 const title=document.getElementById("changeTitle").value.trim(),description=document.getElementById("changeDescription").value.trim();
 if(!title||!description)return alert("Заполни оба поля.");
 changes.unshift({id:Date.now(),title,description,date:Date.now()});saveData("scp_changes",changes);ce.classList.add("hidden");document.getElementById("changeTitle").value="";document.getElementById("changeDescription").value="";renderAdmin();
});