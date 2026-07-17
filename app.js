const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const header=$("#header"), toggle=$(".menu-toggle"), nav=$(".nav"), topBtn=$(".back-top");
toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));toggle.setAttribute("aria-label",open?"Menü öffnen":"Menü schließen");nav.classList.toggle("open",!open)});
$$(".nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")}));
let scrollTick=false;
addEventListener("scroll",()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{header.classList.toggle("scrolled",scrollY>30);topBtn.classList.toggle("show",scrollY>700);const max=document.documentElement.scrollHeight-innerHeight;$("#scrollProgress").style.transform=`scaleX(${max?scrollY/max:0})`;scrollTick=false})},{passive:true});
topBtn.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

const slug=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const categoryBar=$("#categoryBar"), menuList=$("#menuList");
const sushiCategories=["Nigiri","Maki & Futo Maki","Inside-Out Rolls","Special Rolls & Sashimi"];
const vietnameseCategories=["Vorspeisen","Nudelgerichte","Hauptspeisen","Hanami Deluxe"];
const normalize=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function itemTags(group,item){
  const text=normalize(`${item[1]} ${item[2]}`);
  const tags=[];
  if(sushiCategories.includes(group.category))tags.push("sushi");
  if(vietnameseCategories.includes(group.category))tags.push("vietnamesisch");
  if((group.category==="Vegetarisch & Ramen"&&["040","041","042","043","044","048"].includes(item[0]))||/\bvegetarisch|\bveggie|\bvegan\b/.test(text))tags.push("vegetarisch");
  if(/\bvegan\b/.test(text)||["043","044"].includes(item[0]))tags.push("vegan");
  return tags.join(" ");
}
menuData.forEach((group,i)=>{
  const id=`menu-${slug(group.category)}`;
  categoryBar.insertAdjacentHTML("beforeend",`<button data-target="${id}" class="${i===0?"active":""}">${group.category}</button>`);
  const items=group.items.map((x,itemIndex)=>`<article class="menu-item" style="--item-index:${Math.min(itemIndex,7)}" data-search="${normalize(`${x[0]} ${x[1]} ${x[2]} ${group.category}`)}" data-tags="${itemTags(group,x)}"><span class="item-no">${x[0]}</span><div><h4>${x[1]}</h4><p>${x[2]}</p>${x[3]?`<small class="allergens">Allergene und Zusatzstoffe: ${x[3]}</small>`:""}</div><div class="item-order"><span class="price">${x[4]}</span><button class="add-cart" type="button" data-id="${x[0]}" data-name="${x[1].replace(/"/g,"&quot;")}" data-price="${x[4]}" aria-label="${x[1]} zum Warenkorb hinzufügen">Hinzufügen <span aria-hidden="true">+</span></button></div></article>`).join("");
  const more=group.items.length>6?`<button class="menu-more" type="button" aria-expanded="false"><span>Mehr anzeigen</span><b aria-hidden="true">↓</b></button>`:"";
  menuList.insertAdjacentHTML("beforeend",`<section class="menu-category ${i===0?"selected":""}" id="${id}"><div class="category-title"><h3>${group.category}</h3><small>${group.items.length} Gerichte</small></div><div><div class="items">${items}</div>${more}</div></section>`);
});
$$(".category-bar button").forEach(b=>b.addEventListener("click",()=>{
  $$(".category-bar button").forEach(item=>item.classList.toggle("active",item===b));
  $$(".menu-category").forEach(category=>category.classList.toggle("selected",category.id===b.dataset.target));
  filterMenu();
  document.getElementById(b.dataset.target).scrollIntoView({behavior:"smooth",block:"start"});
}));
$$(".menu-more").forEach(button=>button.addEventListener("click",()=>{
  const category=button.closest(".menu-category");
  const expanded=category.classList.toggle("expanded");
  button.setAttribute("aria-expanded",String(expanded));
  $("span",button).textContent=expanded?"Weniger anzeigen":"Mehr anzeigen";
  $("b",button).textContent=expanded?"↑":"↓";
}));

const search=$("#menuSearch"), filters=$$("#filterBar button"), resultCount=$("#resultCount"), noResults=$("#noResults");
let activeFilter="all";
function filterMenu(){
  const query=normalize(search.value.trim());
  const isDiscovering=Boolean(query)||activeFilter!=="all";
  menuList.classList.toggle("discovering",isDiscovering);
  let visible=0;
  $$(".menu-category").forEach(category=>{
    let categoryVisible=0;
    $$(".menu-item",category).forEach(item=>{
      const matchesText=!query||item.dataset.search.includes(query);
      const matchesFilter=activeFilter==="all"||item.dataset.tags.split(" ").includes(activeFilter);
      const show=matchesText&&matchesFilter;
      item.hidden=!show;
      if(show){categoryVisible++;if(isDiscovering||category.classList.contains("selected"))visible++}
    });
    category.hidden=categoryVisible===0||(!isDiscovering&&!category.classList.contains("selected"));
    const categoryButton=$(`.category-bar button[data-target="${category.id}"]`);
    if(categoryButton)categoryButton.hidden=categoryVisible===0;
  });
  resultCount.textContent=`${visible} ${visible===1?"Gericht":"Gerichte"}`;
  noResults.hidden=visible!==0;
}
search.addEventListener("input",filterMenu);
filters.forEach(button=>button.addEventListener("click",()=>{
  activeFilter=button.dataset.filter;
  filters.forEach(item=>item.classList.toggle("active",item===button));
  filterMenu();
}));
filterMenu();

const observed=$$("main>section[id],.menu-category[id]");
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const mainId=e.target.closest("main>section[id]")?.id;$$(".nav a").forEach(a=>a.classList.toggle("active",a.hash===`#${mainId}`));if(e.target.classList.contains("menu-category"))$$(".category-bar button").forEach(b=>b.classList.toggle("active",b.dataset.target===e.target.id))}}),{rootMargin:"-25% 0px -60%"});
observed.forEach(s=>observer.observe(s));

const motionTargets=$$(".section-copy,.intro-body,.menu-heading,.menu-tools,.gallery-title,.gallery-grid,.pickup>div,.pickup>.button,.hours-art,.hours-content,.contact-card,.contact iframe,.footer-main>div");
motionTargets.forEach((element,index)=>{element.classList.add("motion-ready");element.style.setProperty("--motion-order",index%3)});
const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add("is-visible");motionObserver.unobserve(entry.target)}
}),{threshold:.12,rootMargin:"0px 0px -8%"});
motionTargets.forEach(element=>motionObserver.observe(element));

function updateStatus(){const parts=new Intl.DateTimeFormat("de-DE",{timeZone:"Europe/Berlin",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());const h=+parts.find(p=>p.type==="hour").value,m=+parts.find(p=>p.type==="minute").value,total=h*60+m,open=total>=660&&total<1320;const wrap=$(".open-status");wrap.classList.toggle("open",open);$("#statusText").textContent=open?(total>=1260?"Jetzt geöffnet · Schließt um 22:00 Uhr":"Jetzt geöffnet"):(total<660?"Geschlossen · Öffnet heute um 11:00 Uhr":"Geschlossen");}
updateStatus();setInterval(updateStatus,60000);

const cartDrawer=$("#cartDrawer"), cartBackdrop=$("#cartBackdrop"), cartItems=$("#cartItems"), cartEmpty=$("#cartEmpty"), cartContent=$("#cartContent"), toast=$("#toast");
let cart=JSON.parse(localStorage.getItem("hanami-cart")||"[]");
const parsePrice=value=>Number((value.match(/[\d]+[,.]\d{2}/)||["0"])[0].replace(",",".")), money=value=>value.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
function saveCart(){localStorage.setItem("hanami-cart",JSON.stringify(cart))}
function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400)}
function renderCart(){const count=cart.reduce((sum,item)=>sum+item.qty,0),total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);$$(".cart-count").forEach(el=>{el.textContent=count;el.setAttribute("aria-label",`${count} Artikel`)});cartEmpty.hidden=count>0;cartContent.hidden=count===0;$("#cartTotal").textContent=money(total);cartItems.innerHTML=cart.map(item=>`<article class="cart-item"><div><strong><span>${item.id}</span> ${item.name}</strong><small>${money(item.price)} pro Stück</small></div><div class="qty-control" aria-label="Menge für ${item.name}"><button type="button" data-cart-action="minus" data-id="${item.id}" aria-label="Menge reduzieren">−</button><span>${item.qty}</span><button type="button" data-cart-action="plus" data-id="${item.id}" aria-label="Menge erhöhen">+</button></div><strong>${money(item.price*item.qty)}</strong><button class="remove-item" type="button" data-cart-action="remove" data-id="${item.id}" aria-label="${item.name} entfernen">×</button></article>`).join("");saveCart()}
function openCart(){cartBackdrop.hidden=false;requestAnimationFrame(()=>{cartBackdrop.classList.add("show");cartDrawer.classList.add("open")});cartDrawer.setAttribute("aria-hidden","false");document.body.classList.add("cart-is-open");$(".cart-close").focus()}
function closeCart(){cartBackdrop.classList.remove("show");cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");document.body.classList.remove("cart-is-open");setTimeout(()=>cartBackdrop.hidden=true,280)}
$$(".cart-open").forEach(button=>button.addEventListener("click",openCart));$(".cart-close").addEventListener("click",closeCart);cartBackdrop.addEventListener("click",closeCart);$(".cart-continue").addEventListener("click",()=>{closeCart();$("#speisekarte").scrollIntoView({behavior:"smooth"})});
menuList.addEventListener("click",event=>{const button=event.target.closest(".add-cart");if(!button)return;const existing=cart.find(item=>item.id===button.dataset.id);if(existing)existing.qty++;else cart.push({id:button.dataset.id,name:button.dataset.name,price:parsePrice(button.dataset.price),qty:1});renderCart();button.classList.remove("added");requestAnimationFrame(()=>button.classList.add("added"));setTimeout(()=>button.classList.remove("added"),420);$$(".cart-count").forEach(count=>{count.classList.remove("bump");requestAnimationFrame(()=>count.classList.add("bump"))});showToast(`${button.dataset.name} wurde hinzugefügt`)});
cartItems.addEventListener("click",event=>{const button=event.target.closest("[data-cart-action]");if(!button)return;const item=cart.find(x=>x.id===button.dataset.id);if(!item)return;if(button.dataset.cartAction==="plus")item.qty++;if(button.dataset.cartAction==="minus")item.qty--;if(button.dataset.cartAction==="remove"||item.qty<1)cart=cart.filter(x=>x.id!==item.id);renderCart()});
addEventListener("keydown",event=>{if(event.key==="Escape"&&cartDrawer.classList.contains("open"))closeCart()});
const orderDialog=$("#orderDialog"),orderSummary=$("#orderSummary");
let pendingOrder=null;
$("#checkoutForm").addEventListener("submit",async event=>{event.preventDefault();const data=new FormData(event.currentTarget),total=cart.reduce((sum,item)=>sum+item.price*item.qty,0),lines=cart.map(item=>`${item.qty}× ${item.id} ${item.name} – ${money(item.price*item.qty)}`),summary=`BESTELLUNG HANAMI\nName: ${data.get("name")}\nTelefon: ${data.get("phone")}\nAbholung: ${data.get("pickup")} Uhr\n\n${lines.join("\n")}\n\nGESAMTSUMME: ${money(total)}\nHinweis: ${data.get("note")||"–"}\n\nEndpreis kann bei Varianten abweichen.`;orderSummary.value=summary;pendingOrder={name:data.get("name"),phone:data.get("phone"),pickup:data.get("pickup"),total:money(total),summary};$("#emailStatus").textContent="";try{await navigator.clipboard.writeText(summary);showToast("Bestellübersicht kopiert")}catch{showToast("Bestellübersicht wurde erstellt")}closeCart();orderDialog.showModal()});
$("#emailOrder").addEventListener("click",()=>{if(!pendingOrder)return;const status=$("#emailStatus"),to="hanami@hanami.online.com",subject=`Hanami Bestellung – ${pendingOrder.name} – ${pendingOrder.pickup} Uhr`,body=pendingOrder.summary,query=`to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,ua=navigator.userAgent,isAndroid=/Android/i.test(ua),isIOS=/iPhone|iPad|iPod/i.test(ua),fallback=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;status.className="email-status";if(isAndroid){status.textContent="Gmail wird auf Android geöffnet…";location.href=`intent://co?${query}#Intent;scheme=googlegmail;package=com.google.android.gm;S.browser_fallback_url=${encodeURIComponent(fallback)};end`;}else if(isIOS){status.textContent="Gmail wird auf dem iPhone/iPad geöffnet…";location.href=`googlegmail://co?${query}`;const fallbackTimer=setTimeout(()=>{if(document.visibilityState==="visible")location.href=fallback},1200);document.addEventListener("visibilitychange",()=>{if(document.hidden)clearTimeout(fallbackTimer)},{once:true});}else{status.textContent="Gmail wird in einem neuen Fenster geöffnet…";const gmail=window.open(`https://mail.google.com/mail/?view=cm&fs=1&${query}`,"hanami-gmail","popup,width=760,height=720");if(!gmail){status.classList.add("error");status.textContent="Popup wurde blockiert. Bitte Popups erlauben und erneut versuchen.";}}});
$("#copyOrder").addEventListener("click",async()=>{orderSummary.select();try{await navigator.clipboard.writeText(orderSummary.value);showToast("Bestellübersicht kopiert")}catch{document.execCommand("copy")}});$(".dialog-close").addEventListener("click",()=>orderDialog.close());orderDialog.addEventListener("click",event=>{if(event.target===orderDialog)orderDialog.close()});renderCart();
