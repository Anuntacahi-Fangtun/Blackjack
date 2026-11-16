const $=id=>document.getElementById(id);
const SU=['♠','♥','♦','♣'],RK=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck=[],P=[],D=[],hide=true,over=true;

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));window.scrollTo(0,0)}
function mk(){deck=[];SU.forEach(s=>RK.forEach(r=>deck.push({s,r})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}}
function val(h){let t=0,a=0;h.forEach(c=>{if(c.r==='A'){a++;t+=11}else t+=['J','Q','K'].includes(c.r)?10:+c.r});while(t>21&&a){t-=10;a--}return t}
function cardEl(c,back){const d=document.createElement('div');if(back){d.className='card back';d.textContent='?';return d}
d.className='card'+(c.s==='♥'||c.s==='♦'?' red':'');d.innerHTML='<span>'+c.r+'</span><span class="s">'+c.s+'</span><span class="r2">'+c.r+'</span>';return d}

let shownP=99,shownD=99;
function sync(box,cards,hideIdx){
 while(box.children.length>cards.length)box.lastChild.remove();
 cards.forEach((c,i)=>{
  const ch=box.children[i],isBack=hideIdx===i;
  if(!ch){
   const e=cardEl(c,isBack);
   e.classList.add('fade-in');
   box.appendChild(e);
  } else {
   const shouldBeBack = isBack;
   const isCurrentlyBack = ch.classList.contains('back');
   if(shouldBeBack !== isCurrentlyBack) {
    const e=cardEl(c,shouldBeBack);e.classList.add('flip');box.replaceChild(e,ch);
   } else if(!shouldBeBack && (ch.querySelector('span') && ch.querySelector('span').textContent !== c.r)) {
    const e=cardEl(c,false);box.replaceChild(e,ch);
   }
  }
 });
}

function draw(){
 const p=P.slice(0,shownP),d=D.slice(0,shownD);
 sync($('ph'),p,-1);sync($('dh'),d,hide?1:-1);
 $('ps').textContent=val(p);$('ds').textContent=hide?(d.length?'?':'0'):val(d);
}

function setBtn(on){$('hit').disabled=!on;$('stand').disabled=!on}

function deal(){
 mk();P=[deck.pop(),deck.pop()];D=[deck.pop(),deck.pop()];hide=true;over=true;shownP=0;shownD=0;
 $('ph').innerHTML='';$('dh').innerHTML='';$('status').textContent='กำลังแจกไพ่...';setBtn(false);show('game');draw();
 [['P',1],['D',1],['P',2],['D',2]].forEach((s,i)=>setTimeout(()=>{if(s[0]==='P')shownP=s[1];else shownD=s[1];draw();sfx.card()},450+i*600));
 setTimeout(()=>{over=false;$('status').textContent='ตาของคุณ: จั่วหรือหยุด?';setBtn(true);if(val(P)===21)stand()},450+4*600);
}

function finish(res,msg){
 over=true;hide=false;draw();setBtn(false);$('status').textContent=msg;
 setTimeout(()=>sfx[res](),200);
 setTimeout(()=>{
  if(res==='win'){$('winMsg').textContent=msg;show('win')}
  else if(res==='lose'){$('loseMsg').textContent=msg;show('lose')}
  else show('draw');
 },1600);
}

function hit(){if(over)return;shownP = Math.min(shownP + 1, P.length);P.push(deck.pop());shownP = P.length;draw();sfx.card();const v=val(P);
 if(v>21)finish('lose','แต้มของคุณ '+v+' เกิน 21 คุณแพ้!');else if(v===21)stand()}

function stand(){if(over)return;setBtn(false);over=true;hide=false;shownD = D.length;draw();$('status').textContent='บอทกำลังเล่น...';
 (function step(){
  if(val(D)<17){setTimeout(()=>{D.push(deck.pop());shownD = D.length;draw();sfx.card();step()},800);return}
  const p=val(P),d=val(D);
  if(d>21)finish('win','บอทแต้มเกิน 21 ('+d+') คุณชนะ!');
  else if(p>d)finish('win','คุณ '+p+' แต้ม ชนะบอท '+d+' แต้ม!');
  else if(p<d)finish('lose','คุณ '+p+' แต้ม แพ้บอท '+d+' แต้ม');
  else finish('draw','เสมอกัน '+p+' แต้ม');
 })()}

let curName='';

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const certName = urlParams.get('cert');
  if (certName) {
    showCertOnly(decodeURIComponent(certName));
  }
});

function showCertOnly(name) {
  curName = name;
  show('cert');
  // ซ่อนกล่องพรีวิว HTML ด้านบนออก ป้องกันการแสดงผลซ้ำซ้อน
  const certBoxEl = $('certBox');
  if(certBoxEl) certBoxEl.style.display = 'none';
  
  $('dlMsg').textContent = 'นี่คือเกียรติบัตรยืนยันความสำเร็จของคุณ กดปุ่มด้านล่างเพื่อบันทึกรูปภาพได้เลยครับ';
}

async function cert(name){
 curName=name;
 $('cn').textContent=name;
 const dateStr = 'วันที่ ' + new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
 $('cd').textContent = dateStr;
 show('cert');

 // ซ่อนกล่องพรีวิว HTML ด้านบน (แก้ปัญหาแสดงผลซ้ำซ้อน 2 อัน)
 const certBoxEl = $('certBox');
 if(certBoxEl) certBoxEl.style.display = 'none';

 try {
  const W=1400, H=990, c=document.createElement('canvas');
  c.width=W; c.height=H; 
  const x=c.getContext('2d');
  
  // พื้นหลังและกรอบหรูหรา
  x.fillStyle='#f8fbff'; x.fillRect(0,0,W,H);
  x.strokeStyle='#0b6a8a'; x.lineWidth=14; x.strokeRect(20,20,W-40,H-40);
  x.strokeStyle='#ff3df2'; x.lineWidth=3; x.strokeRect(50,50,W-100,H-100);
  
  // วาดโลโก้ตราสัญลักษณ์อวกาศด้านบนสุด
  x.save();
  x.translate(W/2, 110);
  x.fillStyle='#0b6a8a';
  x.beginPath();
  x.arc(0, 0, 32, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle='#ff3df2';
  x.lineWidth=4;
  x.stroke();
  // วาดดาวด้านในโลโก้
  x.fillStyle='#fff';
  x.font="32px sans-serif";
  x.textAlign='center';
  x.textBaseline='middle';
  x.fillText('★', 0, 0);
  x.restore();

  // ข้อความหัวเรื่อง
  x.textAlign='center';
  x.fillStyle='#2b3a66'; x.font="400 28px Prompt,sans-serif"; x.fillText('สถานีอวกาศแบล็กแจ็ก',W/2,175);
  x.fillStyle='#0b6a8a'; x.font="600 88px Prompt,sans-serif"; x.fillText('เกียรติบัตร',W/2,275);
  x.fillStyle='#2b3a66'; x.font="400 36px Prompt,sans-serif"; x.fillText('ขอมอบให้',W/2,370);
  
  // ชื่อผู้เล่น
  let fs=88; x.fillStyle='#0a1030'; x.font='600 '+fs+'px Prompt,sans-serif';
  while(x.measureText(curName).width>W-300 && fs>30){fs-=4; x.font='600 '+fs+'px Prompt,sans-serif';}
  x.fillText(curName,W/2,485);
  
  const nw=Math.min(x.measureText(curName).width+80, W-200);
  x.fillStyle='#0b6a8a'; x.fillRect(W/2-nw/2,510,nw,4);
  
  // รายละเอียดคำอธิบาย
  x.fillStyle='#2b3a66'; x.font="400 34px Prompt,sans-serif";
  x.fillText('เพื่อแสดงว่าเป็นผู้ชนะบอทดีลเลอร์ในเกมแบล็กแจ็ก',W/2,610);
  x.fillText('และได้รับยศนักบินอวกาศผู้เชี่ยวชาญแต้ม 21',W/2,665);
  
  // วันที่ออกเกียรติบัตร
  x.textAlign='left'; x.font="400 32px Prompt,sans-serif"; 
  x.fillText(dateStr, 120, H-110);

  // สร้างภาพ PNG จาก Canvas สำหรับแสดงผลและดาวน์โหลด
  const imageUrl = c.toDataURL('image/png');
  let im=$('certImg');
  if(!im){
    im=document.createElement('img'); im.id='certImg'; im.alt='เกียรติบัตร'; 
    im.style.cssText='width:100%;max-width:760px;border-radius:8px;margin-top:10px;box-shadow:0 0 30px #27f0ff44'; 
    $('dlMsg').after(im);
  }
  im.src = imageUrl;
  $('dlMsg').textContent = 'สร้างเกียรติบัตรสำเร็จ! กดปุ่มดาวน์โหลดด้านล่างเพื่อเก็บบันทึกรูปภาพได้ทันที';

  // ซ่อนช่อง QR Code เดิมทิ้งไปเลย
  const qrBox = $('qr');
  if(qrBox) qrBox.parentElement.style.display = 'none';

 } catch(e) {
  console.error(e);
}
}

/* ===== เสียง (Web Audio) ===== */
let ac,master,mus,fx,muted=false,nextT=0,bar=0,timer=null;
const hz=m=>440*Math.pow(2,(m-69)/12);
function initAudio(){
 if(ac){if(ac.state==='suspended')ac.resume();return}
 try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 master=ac.createGain();master.gain.value=muted?0:1;master.connect(ac.destination);
 mus=ac.createGain();mus.gain.value=.13;mus.connect(master);
 fx=ac.createGain();fx.gain.value=.5;fx.connect(master);
 nextT=ac.currentTime+.1;sched();timer=setInterval(sched,1000);
}
function note(f,t,d,type,vol,dest,lp){
 const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
 let out=o;if(lp){const b=ac.createBiquadFilter();b.type='lowpass';b.frequency.value=lp;o.connect(b);out=b}
 out.connect(g);g.connect(dest);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+Math.min(.04,d/3));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.start(t);o.stop(t+d+.05);
}
const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
function sched(){
 if(!ac)return;
 while(nextT<ac.currentTime+2.5){
  const c=CH[bar%4],BL=2.4;
  c.forEach(m=>{note(hz(m),nextT,BL,'sawtooth',.18,mus,500);note(hz(m)*1.004,nextT,BL,'triangle',.2,mus,700)});
  note(hz(c[0]-12),nextT,BL*.95,'sine',.5,mus);
  for(let i=0;i<8;i++){const m=c[i%3]+(i%4===3?24:12);note(hz(m),nextT+i*.3,.28,'triangle',.22,mus)}
  nextT+=BL;bar++;
 }
}
function tone(f,d,type,vol,to,delay){
 if(!ac)return;const t=ac.currentTime+(delay||0),o=ac.createOscillator(),g=ac.createGain();
 o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
 o.connect(g);g.connect(fx);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.05);
}
function swish(){
 if(!ac)return;const n=Math.floor(ac.sampleRate*.12),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
 s.buffer=b;f.type='bandpass';f.frequency.value=2500;g.gain.value=.5;s.connect(f);f.connect(g);g.connect(fx);s.start();
}
const sfx={
 click(){tone(880,.09,'square',.25,1500)},
 card(){swish();tone(260,.1,'triangle',.4,120)},
 win(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.35,'square',.22,0,i*.12))},
 lose(){[400,320,250,160].forEach((f,i)=>tone(f,.4,'sawtooth',.25,f*.8,i*.2))},
 draw(){tone(440,.25,'triangle',.4,0,0);tone(440,.25,'triangle',.4,0,.3)}
};

document.addEventListener('click',e=>{initAudio();if(e.target.closest('.btn'))sfx.click()});
$('snd').onclick=()=>{
 muted=!muted;if(master)master.gain.value=muted?0:1;
 $('snd').textContent=muted?'🔇 เสียง: ปิด':'🔊 เสียง: เปิด';
};

$('startBtn').onclick=deal;
$('hit').onclick=hit;
$('stand').onclick=stand;
$('again1').onclick=$('again2').onclick=$('again3').onclick=deal;
$('quit').onclick=()=>show('bye');
$('home').onclick=()=>{history.replaceState(null,'',location.pathname+location.search);show('start')};
$('pr').onclick=()=>{try{window.print()}catch(e){}};

// ฟังก์ชันดาวน์โหลดภาพเกียรติบัตรที่ปรับแต่งให้สะอาดและคมชัด
$('dl').onclick=async()=>{
 const m=$('dlMsg');
 try{
  try{await document.fonts.load('600 40px Prompt','ก')}catch(e){}
  const W=1400,H=990,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  
  x.fillStyle='#f8fbff';x.fillRect(0,0,W,H);
  x.strokeStyle='#0b6a8a';x.lineWidth=14;x.strokeRect(20,20,W-40,H-40);
  x.strokeStyle='#ff3df2';x.lineWidth=3;x.strokeRect(50,50,W-100,H-100);
  
  // โลโก้ตราสัญลักษณ์บน Canvas ดาวน์โหลด
  x.save();
  x.translate(W/2, 110);
  x.fillStyle='#0b6a8a';
  x.beginPath(); x.arc(0, 0, 32, 0, Math.PI * 2); x.fill();
  x.strokeStyle='#ff3df2'; x.lineWidth=4; x.stroke();
  x.fillStyle='#fff'; x.font="32px sans-serif"; x.textAlign='center'; x.textBaseline='middle';
  x.fillText('★', 0, 0);
  x.restore();

  x.textAlign='center';
  x.fillStyle='#2b3a66';x.font="400 28px Prompt,sans-serif";x.fillText('สถานีอวกาศแบล็กแจ็ก',W/2,175);
  x.fillStyle='#0b6a8a';x.font="600 88px Prompt,sans-serif";x.fillText('เกียรติบัตร',W/2,275);
  x.fillStyle='#2b3a66';x.font="400 36px Prompt,sans-serif";x.fillText('ขอมอบให้',W/2,370);
  
  let fs=88;x.fillStyle='#0a1030';x.font='600 '+fs+'px Prompt,sans-serif';
  while(x.measureText(curName).width>W-300&&fs>30){fs-=4;x.font='600 '+fs+'px Prompt,sans-serif'}
  x.fillText(curName,W/2,485);
  
  const nw=Math.min(x.measureText(curName).width+80,W-200);
  x.fillStyle='#0b6a8a';x.fillRect(W/2-nw/2,510,nw,4);
  
  x.fillStyle='#2b3a66';x.font="400 34px Prompt,sans-serif";
  x.fillText('เพื่อแสดงว่าเป็นผู้ชนะบอทดีลเลอร์ในเกมแบล็กแจ็ก',W/2,610);
  x.fillText('และได้รับยศนักบินอวกาศผู้เชี่ยวชาญแต้ม 21',W/2,665);
  
  x.textAlign='left';x.font="400 32px Prompt,sans-serif";x.fillText($('cd').textContent,120,H-110);
  
  const dataUrl=c.toDataURL('image/png');
  const link=document.createElement('a');
  link.download=`Blackjack-Certificate-${curName.replace(/\s+/g,'_')}.png`;
  link.href=dataUrl;
  link.click();
  
  m.textContent='ดาวน์โหลดรูปภาพเกียรติบัตรสำเร็จ!';
 }catch(e){
  m.textContent='ไม่สามารถดาวน์โหลดอัตโนมัติได้ ลองใช้วิธีกดค้างที่รูปภาพเพื่อบันทึกแทนได้ครับ';
 }
};

$('mk').onclick=()=>{
 const f=$('fn').value.trim(),l=$('ln').value.trim();
 if(!f||!l){$('err').textContent='กรุณากรอกทั้งชื่อและนามสกุล';return}
 $('err').textContent='';cert(f+' '+l);
};