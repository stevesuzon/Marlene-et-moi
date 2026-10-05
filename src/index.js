export class ShopState {
  constructor(state, env){ this.state=state; this.env=env; }
  async load(){ return (await this.state.storage.get("shop")) || {admins:null,tokens:{},orders:[],revision:0,lastEvent:null,orderSeq:0}; }
  async save(s){ await this.state.storage.put("shop",s); }
  json(data,status=200){ return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}}); }
  async hash(v){ const b=new TextEncoder().encode("marlene-et-moi|"+String(v)); const d=await crypto.subtle.digest("SHA-256",b); return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
  token(){ const a=new Uint8Array(24); crypto.getRandomValues(a); return [...a].map(x=>x.toString(16).padStart(2,"0")).join(""); }
  auth(req,s){ const h=req.headers.get("authorization")||""; const t=h.startsWith("Bearer ")?h.slice(7):""; return t&&s.tokens[t]?{token:t,admin:s.tokens[t]}:null; }
  summarize(o){ return (o.items||[]).map(x=>x.name+" "+(x.shade||"")+" ×"+x.qty).join(" · ")+"\nTotal : "+(o.totalText||""); }
  async fetch(req){
    const url=new URL(req.url), path=url.pathname; let s=await this.load();
    if(path==="/api/status" && req.method==="GET") return this.json({adminsReady:!!s.admins});
    if(path==="/api/admin/setup" && req.method==="POST"){
      if(s.admins) return this.json({error:"Administrateurs déjà configurés"},409);
      const b=await req.json();
      if(!b.johnCode||!b.marleneCode||b.johnCode===b.marleneCode) return this.json({error:"Codes invalides"},400);
      s.admins={John:{hash:await this.hash(b.johnCode)},"Marlène":{hash:await this.hash(b.marleneCode)}};
      const t=this.token(); s.tokens[t]="John"; await this.save(s); return this.json({token:t,admin:"John"});
    }
    if(path==="/api/admin/login" && req.method==="POST"){
      if(!s.admins) return this.json({error:"Administrateurs non configurés"},409);
      const b=await req.json(); const a=b.admin==="Marlène"?"Marlène":"John";
      if(await this.hash(b.code||"")!==s.admins[a].hash) return this.json({error:"Code incorrect"},401);
      const t=this.token(); s.tokens[t]=a; await this.save(s); return this.json({token:t,admin:a});
    }
    if(path==="/api/order" && req.method==="POST"){
      const b=await req.json();
      if(!b.first||!b.last||!b.email||!b.phone||!Array.isArray(b.items)||!b.items.length) return this.json({error:"Commande incomplète"},400);
      const id=crypto.randomUUID(), key=this.token(); s.orderSeq=(s.orderSeq||0)+1;
      const now=new Date(), y=now.getUTCFullYear(), m=String(now.getUTCMonth()+1).padStart(2,"0"), d=String(now.getUTCDate()).padStart(2,"0");
      const orderNumber="ME-"+y+m+d+"-"+String(s.orderSeq).padStart(3,"0");
      const o={id,key,orderNumber,first:String(b.first).slice(0,80),last:String(b.last).slice(0,80),email:String(b.email).slice(0,160),phone:String(b.phone).slice(0,60),deliveryText:String(b.deliveryText||"").slice(0,200),totalText:String(b.totalText||"").slice(0,40),items:b.items.slice(0,50).map(x=>({name:String(x.name||"").slice(0,160),shade:String(x.shade||"").slice(0,80),qty:Math.max(1,Math.min(99,Number(x.qty)||1)),lineTotal:String(x.lineTotal||"").slice(0,40),price:String(x.price||"").slice(0,40),image:String(x.image||"").slice(0,250000)})),status:"paid",assignedTo:null,completedBy:null,sentBy:null,createdAt:now.toISOString(),updatedAt:now.toISOString()};
      s.orders.unshift(o); if(s.orders.length>300) s.orders.length=300;
      s.revision=(s.revision||0)+1;s.lastEvent={type:"new_order",revision:s.revision,orderId:id,orderName:o.first+" "+o.last,summary:this.summarize(o),at:o.updatedAt};
      await this.save(s); return this.json({ok:true,id,key,orderNumber});
    }
    if(path==="/api/order/status" && req.method==="GET"){
      const o=(s.orders||[]).find(x=>x.id===url.searchParams.get("id")&&x.key===url.searchParams.get("key"));
      if(!o)return this.json({error:"Commande introuvable"},404);
      return this.json({order:{id:o.id,orderNumber:o.orderNumber,status:o.status,updatedAt:o.updatedAt}});
    }
    const au=this.auth(req,s); if(!au) return this.json({error:"Connexion administrateur requise"},401);
    if(path==="/api/admin/orders" && req.method==="GET") return this.json({orders:(s.orders||[]).map(({key,...o})=>o),revision:s.revision||0,lastEvent:s.lastEvent||null,admin:au.admin});
    if(path==="/api/admin/change-code" && req.method==="POST"){
      const b=await req.json();if(!b.newCode||String(b.newCode).length<4)return this.json({error:"Nouveau code trop court"},400);
      if(await this.hash(b.currentCode||"")!==s.admins[au.admin].hash)return this.json({error:"Code actuel incorrect"},401);
      s.admins[au.admin].hash=await this.hash(b.newCode);await this.save(s);return this.json({ok:true});
    }
    if((path==="/api/admin/order/claim"||path==="/api/admin/order/finish"||path==="/api/admin/order/send") && req.method==="POST"){
      const b=await req.json(),o=(s.orders||[]).find(x=>x.id===b.id);if(!o)return this.json({error:"Commande introuvable"},404);
      let type="";
      if(path.endsWith("/claim")){if(o.status!=="paid")return this.json({error:(o.assignedTo||"Quelqu’un")+" s’en occupe déjà"},409);o.status="in_progress";o.assignedTo=au.admin;type="claimed";}
      else if(path.endsWith("/finish")){if(o.status!=="in_progress"||o.assignedTo!==au.admin)return this.json({error:"Seul "+(o.assignedTo||"l’administrateur")+" peut terminer cette commande"},409);o.status="done";o.completedBy=au.admin;type="done";}
      else {if(o.status!=="done")return this.json({error:"Le colis doit être terminé avant l’envoi"},409);o.status="sent";o.sentBy=au.admin;type="sent";}
      o.updatedAt=new Date().toISOString();s.revision=(s.revision||0)+1;s.lastEvent={type,by:au.admin,revision:s.revision,orderId:o.id,summary:this.summarize(o),at:o.updatedAt};
      await this.save(s);return this.json({ok:true,order:o,revision:s.revision});
    }
    return this.json({error:"Introuvable"},404);
  }
}
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith("/api/")){const id=env.SHOP.idFromName("marlene-et-moi");return env.SHOP.get(id).fetch(request)}return env.ASSETS.fetch(request)}};