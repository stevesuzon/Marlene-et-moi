(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORAGE='marlene-clean-products-v1', CART='marlene-clean-cart-v1', ADMINS='marlene-clean-admins-v1', ADMIN_SESSION='marlene-clean-admin-session-v1', ADMIN_NAME='marlene-clean-admin-name-v1';
const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}}, safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1500)};
const euro=v=>{const n=parseFloat(String(v).replace(/[^0-9,.-]/g,'').replace(',','.'));return Number.isFinite(n)?n:0};
const money=v=>v.toLocaleString('fr-FR',{maximumFractionDigits:2})+' €';
const loader=$('#yarnLoader'), loaderNote=$('#yarnLoaderNote');
let loaderTimer=null, loaderBusy=false;
function showYarnLoader(note='Chargement…'){
  if(!loader)return;
  loaderBusy=true;
  if(loaderNote) loaderNote.textContent=note;
  loader.classList.add('on');
  loader.setAttribute('aria-hidden','false');
  clearTimeout(loaderTimer);
  loaderTimer=setTimeout(hideYarnLoader,4800);
}
function hideYarnLoader(){
  if(!loader)return;
  clearTimeout(loaderTimer);
  loader.classList.remove('on');
  loader.setAttribute('aria-hidden','true');
  loaderBusy=false;
}
async function withYarnLoader(note,work){
  showYarnLoader(note);
  const start=Date.now();
  try{
    const result=typeof work==='function'?work():null;
    await Promise.resolve(result);
    const left=Math.max(0,4200-(Date.now()-start));
    if(left) await new Promise(r=>setTimeout(r,left));
  }catch(e){
    console.error(e);
  }finally{
    hideYarnLoader();
  }
}
function svgUri(svg){return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
function jacket(a,b){return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700"><rect width="700" height="700" fill="#f1eee8"/><path d="M200 200 300 135 350 170 400 135 500 200 465 310 420 290 420 535 280 535 280 290 235 310Z" fill="'+a+'" stroke="#fff" stroke-width="12"/><path d="M350 170V535" stroke="'+b+'" stroke-width="8" opacity=".7"/></svg>')}
function bracelet(a,b,c){return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700"><rect width="700" height="700" fill="#f1eee8"/><ellipse cx="350" cy="300" rx="175" ry="106" fill="none" stroke="'+a+'" stroke-width="42"/><ellipse cx="350" cy="300" rx="122" ry="62" fill="none" stroke="'+b+'" stroke-width="18"/><circle cx="490" cy="232" r="26" fill="'+c+'" stroke="#fff" stroke-width="8"/></svg>')}
const defaults={
 echarpes:[
  {id:'e1',name:'Écharpe verte',info:'Laine mélangée · 180 × 65 cm',price:'39 €',imgs:['scarf-1.jpg','scarf-1.jpg','scarf-1.jpg']},
  {id:'e2',name:'Écharpe écrue',info:'Maille épaisse · 185 × 70 cm',price:'42 €',imgs:['scarf-2.jpg','scarf-2.jpg','scarf-2.jpg']},
  {id:'e3',name:'Écharpe bleu marine',info:'Laine mérinos · 180 × 65 cm',price:'45 €',imgs:['scarf-3.jpg','scarf-3.jpg','scarf-3.jpg']},
  {id:'e4',name:'Écharpe gris clair',info:'Mélange cachemire · 180 × 65 cm',price:'48 €',imgs:['scarf-4.jpg','scarf-4.jpg','scarf-4.jpg']},
  {id:'e5',name:'Écharpe beige',info:'Maille douce · 175 × 65 cm',price:'35 €',imgs:['scarf-2.jpg','scarf-2.jpg','scarf-2.jpg']},
  {id:'e6',name:'Écharpe bleu glacier',info:'Laine mélangée · 185 × 70 cm',price:'52 €',imgs:['scarf-3.jpg','scarf-3.jpg','scarf-3.jpg']}
 ],
 vestes:[
  {id:'v1',name:'Veste en maille verte',info:'Maille chaude · taille unique',price:'69 €',imgs:[jacket('#214f43','#b4c4bb'),jacket('#2e5c50','#d7e1da'),jacket('#173f35','#9fb4aa')]},
  {id:'v2',name:'Veste en maille écrue',info:'Maille douce · taille unique',price:'74 €',imgs:[jacket('#e6dccd','#baa894'),jacket('#f1e8dc','#c8b6a2'),jacket('#ddd1c1','#aa9a89')]}
 ],
 bracelets:[
  {id:'b1',name:'Bracelet vert et doré',info:'Finition dorée',price:'24 €',imgs:[bracelet('#355f54','#dfd0ad','#d4b474'),bracelet('#2b5349','#ccb37e','#c6a25a'),bracelet('#426d62','#e0c38d','#d8bb7c')]},
  {id:'b2',name:'Bracelet bleu et argenté',info:'Finition argentée',price:'27 €',imgs:[bracelet('#294b6d','#b7c6d6','#d8dde5'),bracelet('#1f4060','#c6d0da','#dce4ea'),bracelet('#3a5f82','#aab8ca','#e5ebef')]},
  {id:'b3',name:'Bracelet crème et doré',info:'Finition dorée · perle claire',price:'19 €',imgs:[bracelet('#d8cab5','#f0e5d3','#c8a55f'),bracelet('#cbbda9','#ece0cf','#b99651'),bracelet('#e2d6c4','#f5ead8','#d0ad68')]},
  {id:'b4',name:'Bracelet noir et doré',info:'Finition dorée',price:'32 €',imgs:[bracelet('#2f3331','#bca064','#d2b36c'),bracelet('#252927','#c7a96c','#dfc27c'),bracelet('#3a3e3c','#b89555','#cda85e')]},
  {id:'b5',name:'Bracelet rose poudré',info:'Finition rosée',price:'22 €',imgs:[bracelet('#b98583','#e2b7b2','#d39a91'),bracelet('#c18f8c','#ecd0cc','#c88780'),bracelet('#aa7876','#ddaaa4','#cf9188')]}
 ]
};
let products;try{products=JSON.parse(safeGet(STORAGE)||'null')||structuredClone(defaults)}catch{products=structuredClone(defaults)}
let cart;try{cart=JSON.parse(safeGet(CART)||'[]')||[]}catch{cart=[]}
let current='echarpes',page=1,viewerItem=null,viewerIndex=0,delivery='ship',selectedMarket='',selectedAdmin='John',editing=null;
let admins;try{admins=JSON.parse(safeGet(ADMINS)||'null')}catch{admins=null}
let admin=safeGet(ADMIN_SESSION)==='1',adminName=safeGet(ADMIN_NAME)||'';
const labels={echarpes:'Écharpes',vestes:'Vestes',bracelets:'Bracelets'};
const markets=['Rennes — Marché des Lices','Rennes — Marché Sainte-Thérèse','Saint-Malo — Marché de Rocabey','Dinard — Marché central','Nantes — Marché de Talensac','La Baule — Marché central','Vannes — Marché des Lices','Lorient — Marché de Merville','Quimper — Marché des Halles','Brest — Marché Saint-Louis','Palaiseau — Marché du Centre','Viry-Châtillon — Marché des Bosserons','Paris — Marché Bastille','Marseille — Marché du Prado'];
function saveProducts(){safeSet(STORAGE,JSON.stringify(products))}
function saveCart(){safeSet(CART,JSON.stringify(cart));renderCartBadge()}
function renderCartBadge(){$('#cartBadge').textContent=cart.reduce((s,x)=>s+x.qty,0)}
function find(cat,id){return (products[cat]||[]).find(p=>p.id===id)}
function render(){
 $('#sectionTitle').textContent=labels[current];
 $$('.category').forEach(b=>b.classList.toggle('active',b.dataset.cat===current));
 const list=products[current]||[],pages=Math.max(1,Math.ceil(list.length/10));page=Math.min(page,pages);const slice=list.slice((page-1)*10,page*10);
 $('#productGrid').innerHTML='';
 slice.forEach(p=>{
  const card=document.createElement('article');card.className='card';card.dataset.id=p.id;
  card.innerHTML='<div class="photo"><img src="'+p.imgs[0]+'" alt="'+p.name.replace(/"/g,'&quot;')+'"><div class="dots"><i></i><i></i><i></i></div></div><div class="meta"><div class="name">'+p.name+'</div><div class="info">'+p.info+'</div><div class="buy-row"><div class="price">'+p.price+'</div><input class="qty" type="number" min="1" max="99" value="1" aria-label="Quantité"><button class="mini-cart" aria-label="Ajouter au panier">🛒</button></div><div class="admin-tools '+(admin?'':'hidden')+'"><button class="edit">Modifier</button><button class="delete">Supprimer</button></div></div>';
  card.querySelector('.photo').onclick=()=>openViewer(p);
  card.querySelector('.mini-cart').onclick=e=>{const q=Math.max(1,parseInt(card.querySelector('.qty').value)||1);addToCart(current,p.id,q);animateToCart(e.currentTarget,p)};
  card.querySelector('.edit').onclick=()=>openProductModal(p);
  card.querySelector('.delete').onclick=()=>{if(confirm('Supprimer cet article ?')){products[current]=products[current].filter(x=>x.id!==p.id);saveProducts();render()}};
  $('#productGrid').appendChild(card);
 });
 $('#pageLabel').textContent='Page '+page+' / '+pages;$('#prevPage').disabled=page<=1;$('#nextPage').disabled=page>=pages;
 $('#addProductBtn').classList.toggle('hidden',!admin);updateAdminButton();
}
function addToCart(cat,id,qty){const i=cart.findIndex(x=>x.cat===cat&&x.id===id);if(i>=0)cart[i].qty+=qty;else cart.push({cat,id,qty});saveCart();toast('Ajouté au panier')}
function cartItems(){return cart.map(c=>({...c,p:find(c.cat,c.id)})).filter(x=>x.p)}
function totals(){const sub=cartItems().reduce((s,x)=>s+euro(x.p.price)*x.qty,0),ship=delivery==='ship'&&sub?10:0;return{sub,ship,total:sub+ship}}
function renderCart(){const box=$('#cartList'),items=cartItems();box.innerHTML='';if(!items.length)box.innerHTML='<p style="text-align:center;color:#777">Panier vide</p>';items.forEach(x=>{const row=document.createElement('div');row.className='cart-row';row.innerHTML='<img src="'+x.p.imgs[0]+'" alt=""><div><strong>'+x.p.name+'</strong><small>'+x.p.price+'</small><input type="number" min="1" max="99" value="'+x.qty+'"></div><button class="remove">×</button>';row.querySelector('input').onchange=e=>{x.qty=Math.max(1,parseInt(e.target.value)||1);const c=cart.find(c=>c.cat===x.cat&&c.id===x.id);c.qty=x.qty;saveCart();renderCart()};row.querySelector('.remove').onclick=()=>{cart=cart.filter(c=>!(c.cat===x.cat&&c.id===x.id));saveCart();renderCart()};box.appendChild(row)});const t=totals();$('#cartSubtotal').textContent=money(t.sub);$('#shippingFee').textContent=money(t.ship);$('#cartTotal').textContent=money(t.total)}
function openViewer(p){viewerItem=p;viewerIndex=0;renderViewer();$('#viewer').classList.add('on')}
function renderViewer(){if(!viewerItem)return;$('#viewerImage').src=viewerItem.imgs[viewerIndex]||viewerItem.imgs[0];$('#viewerName').textContent=viewerItem.name;$('#viewerInfo').textContent=viewerItem.info;$('#viewerDots').textContent=(viewerIndex+1)+' / '+viewerItem.imgs.length}
function show(id){$('#'+id).classList.add('on');$('#'+id).setAttribute('aria-hidden','false')}
function hide(id){$('#'+id).classList.remove('on');$('#'+id).setAttribute('aria-hidden','true')}
function updateAdminButton(){$('#adminBtn').textContent=admin?'⚙️':'🔒'}
function openAdmin(){if(!admins||!admins.John||!admins['Marlène']){$('#adminSetup').classList.remove('hidden');$('#adminLogin').classList.add('hidden');$('#adminSettings').classList.add('hidden');$('#adminTitle').textContent='Créer les deux accès'}else if(admin){$('#adminSetup').classList.add('hidden');$('#adminLogin').classList.add('hidden');$('#adminSettings').classList.remove('hidden');$('#adminWho').textContent=adminName}else{$('#adminSetup').classList.add('hidden');$('#adminLogin').classList.remove('hidden');$('#adminSettings').classList.add('hidden');$('#adminTitle').textContent='Connexion administrateur'}show('adminModal')}
function fileData(input){return new Promise(resolve=>{const f=input.files&&input.files[0];if(!f)return resolve('');const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>resolve('');r.readAsDataURL(f)})}
function openProductModal(p=null){editing=p;$('#productModalTitle').textContent=p?'Modifier l’article':'Ajouter un article';$('#productName').value=p?.name||'';$('#productInfo').value=p?.info||'';$('#productPrice').value=p?.price||'';['photo1','photo2','photo3'].forEach(id=>$('#'+id).value='');show('productModal')}
function animateToCart(btn,p){try{const target=$('#cartBtn'),a=btn.getBoundingClientRect(),b=target.getBoundingClientRect(),sx=a.left+a.width/2,sy=a.top+a.height/2,ex=b.left+b.width/2,ey=b.top+b.height/2,dir=ex>=sx?1:-1,bend=Math.max(90,Math.min(190,Math.abs(ex-sx)*.45)),c1x=sx+dir*bend,c1y=sy-90,c2x=ex-dir*bend*.55,c2y=ey+62,d='M '+sx+' '+sy+' C '+c1x+' '+c1y+', '+c2x+' '+c2y+', '+ex+' '+ey,ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.classList.add('yarn-svg');svg.setAttribute('width',innerWidth);svg.setAttribute('height',innerHeight);svg.setAttribute('viewBox','0 0 '+innerWidth+' '+innerHeight);svg.innerHTML='<defs><linearGradient id="yarnGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d7b6a6"/><stop offset="25%" stop-color="#d8c5a3"/><stop offset="50%" stop-color="#a8bfd8"/><stop offset="75%" stop-color="#d7afb3"/><stop offset="100%" stop-color="#b4b0ad"/></linearGradient></defs><path class="shadow" d="'+d+'"/><path class="main" d="'+d+'"/><path class="shine" d="'+d+'"/>';document.body.appendChild(svg);const path=svg.querySelector('.main'),els=[path,svg.querySelector('.shadow'),svg.querySelector('.shine')],len=path.getTotalLength();els.forEach(el=>{el.style.strokeDasharray=len;el.style.strokeDashoffset=len});const fly=document.createElement('img');fly.className='fly-photo';fly.src=p.imgs[0];fly.style.left=sx+'px';fly.style.top=sy+'px';document.body.appendChild(fly);const start=performance.now(),dur=1500;function f(now){const t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3),off=len*(1-e);els.forEach(el=>el.style.strokeDashoffset=off);const pt=path.getPointAtLength(len*e);fly.style.left=pt.x+'px';fly.style.top=pt.y+'px';fly.style.transform='translate(-50%,-50%) rotate('+(e*18-6)+'deg) scale('+(1-e*.48)+')';if(t<1)requestAnimationFrame(f);else{target.classList.remove('pop');void target.offsetWidth;target.classList.add('pop');setTimeout(()=>{svg.style.transition='opacity .35s';svg.style.opacity='0';fly.style.transition='opacity .3s,transform .3s';fly.style.opacity='0';fly.style.transform='translate(-50%,-50%) scale(.08)'},160);setTimeout(()=>{svg.remove();fly.remove();target.classList.remove('pop')},700)}}requestAnimationFrame(f)}catch{}}

$$('.category').forEach(b=>b.onclick=()=>withYarnLoader('Ouverture de la collection…',()=>{current=b.dataset.cat;page=1;render()}));$('#prevPage').onclick=()=>withYarnLoader('Page précédente…',()=>{page--;render();scrollTo({top:0,behavior:'smooth'})});$('#nextPage').onclick=()=>withYarnLoader('Page suivante…',()=>{page++;render();scrollTo({top:0,behavior:'smooth'})});
$('#viewerBack').onclick=()=>hide('viewer');$('#viewerPrev').onclick=()=>{viewerIndex=(viewerIndex-1+viewerItem.imgs.length)%viewerItem.imgs.length;renderViewer()};$('#viewerNext').onclick=()=>{viewerIndex=(viewerIndex+1)%viewerItem.imgs.length;renderViewer()};
$('#cartBtn').onclick=()=>{renderCart();$('#cartScreen').classList.add('on')};$('#cartBack').onclick=()=>$('#cartScreen').classList.remove('on');
$('#shipBtn').onclick=()=>{delivery='ship';$('#shipBtn').classList.add('active');$('#pickupBtn').classList.remove('active');$('#pickupBox').classList.add('hidden');renderCart()};$('#pickupBtn').onclick=()=>{delivery='pickup';$('#pickupBtn').classList.add('active');$('#shipBtn').classList.remove('active');$('#pickupBox').classList.remove('hidden');renderCart()};
$('#marketSearch').oninput=e=>{const q=e.target.value.toLowerCase(),r=$('#marketResults');r.innerHTML='';if(q.length<2)return;markets.filter(m=>m.toLowerCase().includes(q)).slice(0,8).forEach(m=>{const b=document.createElement('button');b.textContent=m;b.onclick=()=>{selectedMarket=m;$('#selectedMarket').textContent='Choisi : '+m;r.innerHTML=''};r.appendChild(b)})};
$('#orderBtn').onclick=()=>{if(!cart.length)return toast('Panier vide');if(delivery==='pickup'&&!selectedMarket)return toast('Choisis un marché');const p=$('#orderPreview');p.innerHTML='';cartItems().forEach(x=>{const d=document.createElement('div');d.className='line';d.innerHTML='<img src="'+x.p.imgs[0]+'"><span>'+x.p.name+' × '+x.qty+'</span><b>'+money(euro(x.p.price)*x.qty)+'</b>';p.appendChild(d)});show('orderModal')};
$$('[data-close]').forEach(b=>b.onclick=()=>hide(b.dataset.close));
$('#sendOrder').onclick=()=>{const first=$('#buyerFirst').value.trim(),last=$('#buyerLast').value.trim(),email=$('#buyerEmail').value.trim(),phone=$('#buyerPhone').value.trim();if(!first||!last||!email||!phone)return toast('Remplis les informations');const t=totals(),lines=cartItems().map(x=>'• '+x.p.name+' x'+x.qty+' — '+money(euro(x.p.price)*x.qty)).join('\n');const mode=delivery==='pickup'?'À venir chercher — '+selectedMarket:'Envoi à domicile';const body='Commande Marlène et moi\n\nClient : '+first+' '+last+'\nE-mail : '+email+'\nTéléphone : '+phone+'\n'+mode+'\n\n'+lines+'\n\nTotal : '+money(t.total);location.href='mailto:appli.suzon@gmail.com?subject='+encodeURIComponent('Commande Marlène et moi — '+first+' '+last)+'&body='+encodeURIComponent(body);hide('orderModal');toast('Commande préparée')};
$('#adminBtn').onclick=openAdmin;
$$('.admin-pill').forEach(b=>b.onclick=()=>{selectedAdmin=b.dataset.admin;$$('.admin-pill').forEach(x=>x.classList.toggle('active',x===b))});
$('#saveAdminCodes').onclick=()=>{const j=$('#johnCode').value.trim(),m=$('#marleneCode').value.trim();if(j.length<4||m.length<4||j===m)return toast('Codes différents de 4 caractères minimum');admins={John:j,'Marlène':m};safeSet(ADMINS,JSON.stringify(admins));hide('adminModal');toast('Codes enregistrés')};
$('#loginAdmin').onclick=()=>{const code=$('#adminCode').value;if(!admins||admins[selectedAdmin]!==code)return toast('Code incorrect');admin=true;adminName=selectedAdmin;safeSet(ADMIN_SESSION,'1');safeSet(ADMIN_NAME,adminName);hide('adminModal');render();toast('Mode administrateur')};
$('#logoutAdmin').onclick=()=>{admin=false;adminName='';safeSet(ADMIN_SESSION,'0');safeSet(ADMIN_NAME,'');hide('adminModal');render()};
$('#changeCodeOpen').onclick=()=>{hide('adminModal');show('changeCodeModal')};
$('#saveNewCode').onclick=()=>{const c=$('#currentCode').value,n=$('#newCode').value,f=$('#confirmCode').value,msg=$('#changeCodeMessage');if(!admins||admins[adminName]!==c){msg.textContent='Code actuel incorrect';return}if(n.length<4){msg.textContent='4 caractères minimum';return}if(n!==f){msg.textContent='Les deux nouveaux codes ne correspondent pas';return}admins[adminName]=n;safeSet(ADMINS,JSON.stringify(admins));msg.textContent='Code changé';setTimeout(()=>hide('changeCodeModal'),700)};
$('#addProductBtn').onclick=()=>openProductModal();
$('#saveProduct').onclick=async()=>{const name=$('#productName').value.trim(),info=$('#productInfo').value.trim(),price=$('#productPrice').value.trim();if(!name||!price)return toast('Nom et prix obligatoires');const incoming=await Promise.all([fileData($('#photo1')),fileData($('#photo2')),fileData($('#photo3'))]);if(editing){editing.name=name;editing.info=info;editing.price=price;editing.imgs=editing.imgs||[];incoming.forEach((v,i)=>{if(v)editing.imgs[i]=v});while(editing.imgs.length<3)editing.imgs.push(editing.imgs[0]||'scarf-1.jpg')}else{const imgs=incoming.filter(Boolean);while(imgs.length<3)imgs.push(imgs[0]||'scarf-1.jpg');products[current].push({id:'p'+Date.now(),name,info,price,imgs:imgs.slice(0,3)})}saveProducts();hide('productModal');render();toast('Article enregistré')};

const collectionBtn=$('#collectionUpdateBtn');
if(collectionBtn)collectionBtn.onclick=async()=>{
  if(collectionBtn.disabled)return;
  collectionBtn.disabled=true;
  collectionBtn.textContent='↻ Mise à jour…';
  showYarnLoader('Nouvelle collection…');
  try{
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('marlene-')).map(k=>caches.delete(k)));
    }
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.update().catch(()=>{})));
    }
    await new Promise(r=>setTimeout(r,4200));
    const u=new URL(location.href);
    u.searchParams.set('collection',Date.now().toString());
    location.replace(u.href);
  }catch(e){
    hideYarnLoader();
    collectionBtn.disabled=false;
    collectionBtn.textContent='↻ Mise à jour nouvelle collection';
    toast('Mise à jour impossible');
  }
};

renderCartBadge();render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js?v=2').catch(()=>{});
})();