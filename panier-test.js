(()=>{
if(window.__PANIER_TEST__)return;window.__PANIER_TEST__=1;
const st=document.createElement('style');
st.textContent='.cart-yarn-flight-test{position:fixed;inset:0;z-index:99997;pointer-events:none;overflow:visible}.cart-yarn-shadow-test{fill:none;stroke:rgba(28,50,43,.18);stroke-width:17;stroke-linecap:round;stroke-linejoin:round}.cart-yarn-path-test{fill:none;stroke:url(#cartYarnTestGradient);stroke-width:11;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 3px 3px rgba(0,0,0,.16))}.cart-yarn-shine-test{fill:none;stroke:rgba(255,255,255,.45);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.cart-fly-product-test{position:fixed!important;z-index:99999!important;width:68px!important;height:68px!important;border-radius:18px!important;object-fit:cover!important;border:4px solid #fff!important;box-shadow:0 12px 28px rgba(0,0,0,.28)!important;pointer-events:none!important;transition:none!important}@media(max-width:620px){.cart-yarn-path-test{stroke-width:10}.cart-yarn-shadow-test{stroke-width:15}.cart-fly-product-test{width:62px!important;height:62px!important}}';
document.head.appendChild(st);
window.animateProductToCart=function(button,product){
 try{
  const target=document.getElementById('cartBtn'),card=button&&button.closest('.card'),img=card&&card.querySelector('.photo img');
  if(!target||!img)return;
  const a=button.getBoundingClientRect(),b=target.getBoundingClientRect();
  const sx=a.left+a.width/2,sy=a.top+a.height/2,ex=b.left+b.width/2,ey=b.top+b.height/2;
  const dir=ex>=sx?1:-1,bend=Math.max(90,Math.min(180,Math.abs(ex-sx)*.42));
  const c1x=sx+dir*bend,c1y=sy-80,c2x=ex-dir*bend*.55,c2y=ey+55;
  const d='M '+sx+' '+sy+' C '+c1x+' '+c1y+', '+c2x+' '+c2y+', '+ex+' '+ey;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','cart-yarn-flight-test');svg.setAttribute('width',innerWidth);svg.setAttribute('height',innerHeight);svg.setAttribute('viewBox','0 0 '+innerWidth+' '+innerHeight);
  svg.innerHTML='<defs><linearGradient id="cartYarnTestGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d7b6a6"/><stop offset="25%" stop-color="#d8c5a3"/><stop offset="52%" stop-color="#a8bfd8"/><stop offset="76%" stop-color="#d7afb3"/><stop offset="100%" stop-color="#b4b0ad"/></linearGradient></defs><path class="cart-yarn-shadow-test" d="'+d+'"/><path class="cart-yarn-path-test" d="'+d+'"/><path class="cart-yarn-shine-test" d="'+d+'"/>';
  document.body.appendChild(svg);
  const path=svg.querySelector('.cart-yarn-path-test'),shadow=svg.querySelector('.cart-yarn-shadow-test'),shine=svg.querySelector('.cart-yarn-shine-test'),len=path.getTotalLength();
  [path,shadow,shine].forEach(el=>{el.style.strokeDasharray=len;el.style.strokeDashoffset=len});
  const fly=document.createElement('img');fly.className='cart-fly-product-test';fly.src=(product&&product.imgs&&product.imgs[0])||(img.currentSrc||img.src);fly.alt='';fly.style.left=sx+'px';fly.style.top=sy+'px';document.body.appendChild(fly);
  const dur=1450,t0=performance.now();
  function frame(now){
   const t=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-t,3),off=len*(1-e);
   path.style.strokeDashoffset=off;shadow.style.strokeDashoffset=off;shine.style.strokeDashoffset=off;
   const pt=path.getPointAtLength(len*e);fly.style.left=pt.x+'px';fly.style.top=pt.y+'px';fly.style.transform='translate(-50%,-50%) rotate('+(e*16-6)+'deg) scale('+(1-e*.48)+')';
   if(t<1)requestAnimationFrame(frame);else{
    target.classList.remove('cart-pop');void target.offsetWidth;target.classList.add('cart-pop');
    setTimeout(()=>{svg.style.transition='opacity .35s ease';fly.style.transition='opacity .3s ease,transform .3s ease';svg.style.opacity='0';fly.style.opacity='0';fly.style.transform='translate(-50%,-50%) scale(.08)'},150);
    setTimeout(()=>{svg.remove();fly.remove();target.classList.remove('cart-pop')},650);
   }
  } requestAnimationFrame(frame);
 }catch(e){}
};
})();