import { useState, useCallback } from "react";

const ORANGE = "#E59215";
const DARK = "#1A1A1A";
const fmt = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");
const PAGES = ["Cover","Equipment","Pricing","Tech Sheets","Timeline","Layout","Terms","References","Thank You"];

const defaultSections = [
  { id:1, name:"1. Intake & Reception", open:true, items:[
    {desc:"Dump Pit Hopper (5T capacity)",qty:1,unit:"Nos",exw:285000,install:42750},
    {desc:"Drive-Over Heavy Duty Grid (GMS)",qty:1,unit:"Nos",exw:95000,install:14250},
    {desc:"Intake Dust Aspiration System",qty:1,unit:"Set",exw:175000,install:26250},
  ]},
  { id:2, name:"2. Processing & Pre-Conditioning (Cleaning Tower)", open:false, items:[
    {desc:"Grain Drum Pre-Cleaner / Rotary Scalper (60 TPH)",qty:1,unit:"Nos",exw:425000,install:63750},
    {desc:"Flat Bed Vibratory Screen Cleaner (Double Deck)",qty:1,unit:"Nos",exw:520000,install:78000},
    {desc:"Magnetic Separator (Inline)",qty:2,unit:"Nos",exw:85000,install:12750},
    {desc:"Online Weigher / Bulk Flow Scale",qty:1,unit:"Nos",exw:180000,install:27000},
    {desc:"Dust Collection System (Cyclone + Baghouse)",qty:1,unit:"Set",exw:650000,install:97500},
    {desc:"Discharge Chutes & Gravity Spouting",qty:1,unit:"Lot",exw:95000,install:14250},
  ]},
  { id:3, name:"3. Elevating & Conveying (Material Handling)", open:false, items:[
    {desc:"Bucket Elevator (60 TPH, 25m height)",qty:1,unit:"Nos",exw:980000,install:147000},
    {desc:"Drag Chain Conveyor (60 TPH, 20m)",qty:2,unit:"Nos",exw:620000,install:93000},
    {desc:"Belt Conveyor (60 TPH, 30m)",qty:1,unit:"Nos",exw:480000,install:72000},
    {desc:"Overhead Catwalk / Gallery Structure",qty:1,unit:"Lot",exw:350000,install:52500},
    {desc:"Distributors / Diverter Valves",qty:4,unit:"Nos",exw:45000,install:6750},
    {desc:"Cushion Boxes / Deadheads",qty:6,unit:"Nos",exw:18000,install:2700},
  ]},
  { id:4, name:"4. Storage Silo Structure", open:false, items:[
    {desc:"Galvanized Steel Sidewall Sheets (3mm, Z275)",qty:1,unit:"Lot",exw:4200000,install:840000},
    {desc:"Roof Panels & Compression Rings",qty:1,unit:"Set",exw:680000,install:136000},
    {desc:"External Stiffeners (Vertical)",qty:1,unit:"Lot",exw:420000,install:84000},
    {desc:"Wind Rings (Shear Reinforcement)",qty:1,unit:"Set",exw:185000,install:37000},
    {desc:"Access Doors & Manways (Ground + Roof)",qty:4,unit:"Nos",exw:28000,install:5600},
    {desc:"Spiral Staircase & Roof Ladder",qty:1,unit:"Set",exw:320000,install:64000},
  ]},
  { id:5, name:"5. Discharge & Unloading Mechanics", open:false, items:[
    {desc:"Center Draw-Off Gate (Flat Bottom)",qty:1,unit:"Nos",exw:125000,install:18750},
    {desc:"Intermediate Sump Gates",qty:2,unit:"Nos",exw:75000,install:11250},
    {desc:"Sweep Auger with Tractor Drive",qty:1,unit:"Set",exw:485000,install:72750},
    {desc:"Lower Reclaim Conveyor (30m)",qty:1,unit:"Nos",exw:380000,install:57000},
  ]},
  { id:6, name:"6. Conditioning & Quality Preservation", open:false, items:[
    {desc:"Centrifugal Aeration Fans (7.5 kW each)",qty:4,unit:"Nos",exw:85000,install:12750},
    {desc:"Floor Aeration Grating (GI Trench Covers)",qty:1,unit:"Lot",exw:220000,install:33000},
    {desc:"Roof Exhaust Vents (Gravity)",qty:6,unit:"Nos",exw:12000,install:1800},
    {desc:"Grain Monitoring System (OPI type, 8 cables)",qty:1,unit:"Set",exw:680000,install:102000},
  ]},
  { id:7, name:"7. Control & Automation", open:false, items:[
    {desc:"Motor Control Center (MCC) Panel",qty:1,unit:"Nos",exw:850000,install:127500},
    {desc:"PLC System (Siemens S7-1200)",qty:1,unit:"Set",exw:650000,install:97500},
    {desc:"Level Sensors (High/Low per bin)",qty:4,unit:"Nos",exw:22000,install:3300},
    {desc:"Motion & Alignment Safety Sensors",qty:8,unit:"Nos",exw:18000,install:2700},
  ]},
];

function calcTotals(sections, pf, freight, tax, incoterm) {
  const exw = sections.reduce((a,s)=>a+s.items.reduce((b,i)=>b+(i.qty||0)*(i.exw||0),0),0);
  const inst = sections.reduce((a,s)=>a+s.items.reduce((b,i)=>b+(i.install||0),0),0);
  const pfA = exw*pf/100;
  const frA = incoterm==="exworks"?0:exw*freight/100;
  const sub = exw+pfA+frA;
  const taxA = sub*tax/100;
  return {exw,inst,pf:pfA,freight:frA,sub,tax:taxA,total:sub+taxA+inst};
}

const inp = {fontSize:12,padding:"5px 8px",borderRadius:6,border:"1px solid #ddd",background:"transparent",color:"inherit",width:"100%",outline:"none",fontFamily:"inherit"};
const lbl = {fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:"0.04em",display:"block",marginBottom:3};
const card = {background:"#fff",border:"1px solid #eee",borderRadius:10,marginBottom:12,overflow:"hidden"};
const pbx = {background:"#f9f9f7",borderRadius:8,padding:"12px 14px",marginBottom:10,border:"1px solid #eee"};

export default function App() {
  const [page, setPage] = useState(0);
  const [client, setClient] = useState({name:"",company:"",city:"",email:"",phone:"",project:""});
  const [quote, setQuote] = useState({num:"BS-2025-001",date:new Date().toISOString().split("T")[0],validity:"90"});
  const [sections, setSections] = useState(defaultSections);
  const [incoterm, setIncoterm] = useState("exworks");
  const [pf, setPf] = useState(3);
  const [freight, setFreight] = useState(4);
  const [tax, setTax] = useState(18);
  const [toast, setToast] = useState("");

  const t = calcTotals(sections,pf,freight,tax,incoterm);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2800); };

  const upd = useCallback((si,ii,key,val) => {
    setSections(prev=>{
      const n=prev.map(s=>({...s,items:s.items.map(i=>({...i}))}));
      n[si].items[ii]={...n[si].items[ii],[key]:["qty","exw","install"].includes(key)?+val:val};
      return n;
    });
  },[]);

  const delItem = (si,ii) => setSections(prev=>prev.map((s,i)=>i===si?{...s,items:s.items.filter((_,j)=>j!==ii)}:s));
  const addItem = (si) => setSections(prev=>prev.map((s,i)=>i===si?{...s,open:true,items:[...s.items,{desc:"New item",qty:1,unit:"Nos",exw:0,install:0}]}:s));
  const toggleSec = (si) => setSections(prev=>prev.map((s,i)=>i===si?{...s,open:!s.open}:s));

  const sEXW = (s) => s.items.reduce((a,i)=>a+(i.qty||0)*(i.exw||0),0);
  const sInst = (s) => s.items.reduce((a,i)=>a+(i.install||0),0);
  const sPF = (s) => sEXW(s)*pf/100;
  const sFr = (s) => incoterm==="exworks"?0:sEXW(s)*freight/100;
  const sTot = (s) => sEXW(s)+sPF(s)+sFr(s)+sInst(s);

  const exportQuote = () => {
    const rows = sections.map(s=>`\n${s.name}\n${"─".repeat(40)}\n`+s.items.map(i=>`  • ${i.desc}\n    Qty: ${i.qty} ${i.unit} | EXW: ${fmt((i.qty||0)*(i.exw||0))} | Install: ${fmt(i.install||0)}`).join("\n")).join("\n");
    const txt = [
      "BRAG SYSTEMS — FORMAL QUOTATION",
      "Let's Build It Better!",
      "═".repeat(52),
      `Quote No  : ${quote.num}`,
      `Date      : ${quote.date}`,
      `Valid for : ${quote.validity} days`,
      `Client    : ${client.name} | ${client.company} | ${client.city}`,
      `Project   : ${client.project||"—"}`,
      `Email     : ${client.email}  Phone: ${client.phone}`,
      `Incoterm  : ${incoterm.toUpperCase()}`,
      "",
      "EQUIPMENT SCHEDULE",
      "═".repeat(52),
      rows,
      "",
      "PRICING SUMMARY",
      "═".repeat(52),
      `Total Equipment (EXW)          : ${fmt(t.exw)}`,
      `Packing & Forwarding (${pf}%)     : ${fmt(t.pf)}`,
      incoterm!=="exworks"?`Freight (${freight}%)               : ${fmt(t.freight)}`:"",
      `Sub-total (ex-tax)             : ${fmt(t.sub)}`,
      `GST (${tax}%)                    : ${fmt(t.tax)}`,
      `Installation (site actuals)    : ${fmt(t.inst)}`,
      "─".repeat(52),
      `TOTAL PROJECT COST             : ${fmt(t.total)}`,
      "",
      "PAYMENT SCHEDULE",
      `30% Advance on signing         : ${fmt(t.total*0.30)}`,
      `30% On dispatch of silo        : ${fmt(t.total*0.30)}`,
      `30% On dispatch of equipment   : ${fmt(t.total*0.30)}`,
      `10% On commissioning           : ${fmt(t.total*0.10)}`,
      "",
      "═".repeat(52),
      "Brag Systems | www.bragsystems.com | info@bragsystems.com",
      "Eco Tower, Cyberwalk Tech Park, IMT Manesar, Gurugram, Haryana",
      "\"Let's Build It Better!\"",
    ].filter(l=>l!==undefined).join("\n");
    const blob=new Blob([txt],{type:"text/plain"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`BragSystems_Quote_${quote.num}_${(client.company||"Client").replace(/\s+/g,"_")}.txt`;
    a.click();
    showToast("Quote exported successfully!");
  };

  // ── SHARED COMPONENTS ─────────────────────────────────────────
  const F = ({label,val,fn,type="text",ph=""}) => (
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <label style={lbl}>{label}</label>
      <input type={type} value={val} onChange={e=>fn(e.target.value)} placeholder={ph} style={inp}/>
    </div>
  );

  const PR = ({label,val,total,grand}) => (
    <div style={{display:"flex",justifyContent:"space-between",padding:grand?"6px 0 2px":"3px 0",borderBottom:grand?"none":total?"none":"1px solid #eee",borderTop:total?"1px solid #ddd":"none",fontSize:grand?13:12,fontWeight:grand||total?500:400,color:grand?ORANGE:"inherit",marginTop:total?4:0}}>
      <span>{label}</span><span>{val}</span>
    </div>
  );

  const SecNum = ({n}) => (
    <div style={{width:20,height:20,borderRadius:"50%",background:ORANGE,color:"#fff",fontSize:9,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{n}</div>
  );

  const SectionHead = ({label,total,open,onClick}) => (
    <div onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#f9f9f7",borderBottom:"1px solid #eee",cursor:"pointer",userSelect:"none"}}>
      <span style={{fontSize:12.5,fontWeight:500}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:12,fontWeight:500,color:ORANGE}}>{total}</span>
        <span style={{color:"#aaa",fontSize:11}}>{open?"▲":"▼"}</span>
      </div>
    </div>
  );

  // ── NAV ───────────────────────────────────────────────────────
  const Nav = () => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20,flexWrap:"wrap",gap:6}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:26,height:26,background:ORANGE,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:"#fff"}}>BS</div>
        <span style={{fontSize:12.5,fontWeight:500,color:DARK}}>Brag Systems <span style={{color:"#999",fontWeight:400,fontSize:11}}>· Quote Builder</span></span>
      </div>
      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
        {PAGES.map((p,i)=>(
          <button key={i} onClick={()=>setPage(i)} style={{fontSize:10,padding:"3px 7px",borderRadius:5,cursor:"pointer",border:"none",background:page===i?ORANGE:"transparent",color:page===i?"#fff":"#888",fontWeight:page===i?600:400,transition:"all .15s"}}>
            {i+1}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:5}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} style={{padding:"4px 10px",border:"1px solid #ddd",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:12}}>←</button>
        <button onClick={()=>setPage(p=>Math.min(8,p+1))} style={{padding:"4px 10px",border:"1px solid #ddd",borderRadius:6,background:"#fff",cursor:"pointer",fontSize:12}}>→</button>
        <button onClick={exportQuote} style={{padding:"4px 12px",border:"none",borderRadius:6,background:ORANGE,color:"#fff",fontWeight:600,cursor:"pointer",fontSize:12}}>↓ Export</button>
      </div>
    </div>
  );

  // ── PAGE 0: COVER ─────────────────────────────────────────────
  const Cover = () => (
    <div>
      <div style={{background:DARK,padding:"26px 20px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",background:ORANGE,opacity:.1}}/>
        <div style={{position:"absolute",right:20,top:20,width:100,height:100,borderRadius:"50%",background:ORANGE,opacity:.07}}/>
        <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:ORANGE,marginBottom:6,fontWeight:500,position:"relative"}}>Quotation Document</div>
        <div style={{fontSize:22,fontWeight:500,color:"#fff",marginBottom:4,position:"relative"}}>Grain Storage Infrastructure Quotation</div>
        <div style={{fontSize:11.5,color:"#9E9890",marginBottom:14,position:"relative",fontStyle:"italic"}}>Let's Build It Better! · End-to-end silo project execution · India's grain storage partner</div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",position:"relative"}}>
          {[["Quote No.",quote.num],["Date",quote.date],["Valid for",quote.validity+" days"],["Currency","INR"]].map(([k,v])=>(
            <div key={k} style={{fontSize:11,color:"#6B6560"}}>{k}<span style={{color:ORANGE,fontWeight:500,marginLeft:4}}>{v}</span></div>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 14px"}}>
        <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Client details</h2>
        <p style={{fontSize:11,color:"#888",marginBottom:12}}>Fill in below — populates across all pages</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <F label="Client name" val={client.name} fn={v=>setClient(c=>({...c,name:v}))} ph="Mr / Ms / Company"/>
          <F label="Company" val={client.company} fn={v=>setClient(c=>({...c,company:v}))} ph="Company name"/>
          <F label="City / State" val={client.city} fn={v=>setClient(c=>({...c,city:v}))} ph="e.g. Ludhiana, Punjab"/>
          <F label="Email" val={client.email} fn={v=>setClient(c=>({...c,email:v}))} ph="email@company.com"/>
          <F label="Phone" val={client.phone} fn={v=>setClient(c=>({...c,phone:v}))} ph="+91 XXXXX XXXXX"/>
          <F label="Project description" val={client.project} fn={v=>setClient(c=>({...c,project:v}))} ph="e.g. 5000 MT Rice Storage — 2 silos"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <F label="Quote number" val={quote.num} fn={v=>setQuote(q=>({...q,num:v}))}/>
          <F label="Validity (days)" val={quote.validity} fn={v=>setQuote(q=>({...q,validity:v}))} type="number"/>
        </div>
        <div style={{borderLeft:`2px solid ${ORANGE}`,padding:"10px 14px",background:"#fdf8f2",borderRadius:"0 6px 6px 0",marginBottom:14}}>
          <p style={{fontSize:12,lineHeight:1.7,color:"#666",fontStyle:"italic",marginBottom:8}}>"At Brag Systems, we take complete ownership of your grain storage project from concept to commissioning. Your existing facility is good — we are here to make it better. Every project we execute reflects 15 years of hands-on field learning across India."</p>
          <p style={{fontSize:12,fontWeight:500}}>— Abhinav Sharma, Founder & Director</p>
          <p style={{fontSize:11,color:"#888",marginTop:2}}>B.E. Agricultural Engineering (G.B. Pant University) · Ex-AGCO GSI · Ex-Bühler · Ex-Schmidt-Seeger</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
          {[["15+","Years experience"],["50+","Projects completed"],["7","States covered"],["100%","Turnkey delivery"]].map(([v,l])=>(
            <div key={l} style={{background:"#f9f9f7",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid #eee"}}>
              <div style={{fontSize:18,fontWeight:600,color:ORANGE}}>{v}</div>
              <div style={{fontSize:10,color:"#888",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={()=>setPage(1)} style={{background:ORANGE,color:"#fff",border:"none",borderRadius:7,padding:"8px 20px",fontSize:12,fontWeight:600,cursor:"pointer"}}>View equipment list →</button>
        </div>
      </div>
    </div>
  );

  // ── PAGE 1: EQUIPMENT ─────────────────────────────────────────
  const Equipment = () => (
    <div style={{padding:"0 14px"}}>
      <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Equipment list</h2>
      <p style={{fontSize:11,color:"#888",marginBottom:12}}>Edit quantities & prices inline · INR · Ex-works per unit · Installation is per item</p>
      {sections.map((sec,si)=>(
        <div key={si} style={card}>
          <SectionHead label={sec.name} total={fmt(sEXW(sec))} open={sec.open} onClick={()=>toggleSec(si)}/>
          {sec.open && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 48px 52px 105px 105px 30px",background:"#f9f9f7",borderBottom:"1px solid #eee"}}>
                {["Description","Qty","Unit","Ex-works (₹)","Install (₹)",""].map((h,i)=>(
                  <div key={i} style={{padding:"4px 7px",fontSize:9.5,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
                ))}
              </div>
              {sec.items.map((item,ii)=>(
                <div key={ii} style={{display:"grid",gridTemplateColumns:"2fr 48px 52px 105px 105px 30px",borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{padding:"4px 7px"}}><input value={item.desc} onChange={e=>upd(si,ii,"desc",e.target.value)} style={inp}/></div>
                  <div style={{padding:"4px 7px"}}><input type="number" value={item.qty} min={0} onChange={e=>upd(si,ii,"qty",e.target.value)} style={{...inp,textAlign:"center"}}/></div>
                  <div style={{padding:"4px 7px"}}><input value={item.unit} onChange={e=>upd(si,ii,"unit",e.target.value)} style={inp}/></div>
                  <div style={{padding:"4px 7px"}}><input type="number" value={item.exw} min={0} onChange={e=>upd(si,ii,"exw",e.target.value)} style={{...inp,textAlign:"right"}}/></div>
                  <div style={{padding:"4px 7px"}}><input type="number" value={item.install||0} min={0} onChange={e=>upd(si,ii,"install",e.target.value)} style={{...inp,textAlign:"right"}}/></div>
                  <div style={{padding:"4px 4px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <button onClick={()=>delItem(si,ii)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:13,lineHeight:1}} title="Remove">✕</button>
                  </div>
                </div>
              ))}
              <button onClick={()=>addItem(si)} style={{fontSize:11,padding:"4px 10px",margin:"6px 8px",borderRadius:5,border:"1px dashed #ccc",background:"transparent",color:"#999",cursor:"pointer"}}>+ Add item</button>
            </div>
          )}
        </div>
      ))}
      <div style={{...pbx,border:`1px solid ${ORANGE}`}}>
        <PR label="Total equipment (ex-works)" val={fmt(t.exw)}/>
        <PR label="Total installation" val={fmt(t.inst)}/>
        <PR label="Combined value (ex-tax, incl. install)" val={fmt(t.exw+t.inst)} grand/>
      </div>
      <div style={{textAlign:"right",marginBottom:8}}>
        <button onClick={()=>setPage(2)} style={{background:ORANGE,color:"#fff",border:"none",borderRadius:7,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Proceed to pricing →</button>
      </div>
    </div>
  );

  // ── PAGE 2: PRICING ───────────────────────────────────────────
  const Pricing = () => (
    <div style={{padding:"0 14px"}}>
      <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Pricing & incoterms</h2>
      <p style={{fontSize:11,color:"#888",marginBottom:12}}>Select incoterm · Adjust charges · All totals recalculate live</p>
      <h3 style={{fontSize:12.5,fontWeight:500,marginBottom:8}}>Incoterm</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {id:"exworks",title:"Ex-Works (EXW)",desc:"Price at factory gate. Buyer arranges all transport & insurance."},
          {id:"for",title:"FOR / FOB",desc:"Loaded on buyer's vehicle. Packing included, freight excluded."},
          {id:"cif",title:"Delivered (CIF)",desc:"Delivered to project site. Packing, freight & insurance included."},
        ].map(ic=>(
          <div key={ic.id} onClick={()=>setIncoterm(ic.id)} style={{border:`${incoterm===ic.id?`2px solid ${ORANGE}`:"1px solid #eee"}`,borderRadius:8,padding:"9px 10px",cursor:"pointer",background:incoterm===ic.id?"#fdf8f2":"#fff",transition:"all .15s"}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3,color:incoterm===ic.id?ORANGE:DARK}}>{ic.title}</div>
            <div style={{fontSize:10.5,color:"#888",lineHeight:1.45}}>{ic.desc}</div>
          </div>
        ))}
      </div>
      <h3 style={{fontSize:12.5,fontWeight:500,marginBottom:8}}>Charge configuration</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <label style={lbl}>Packing & forwarding (%)</label>
          <input type="number" value={pf} min={0} step={0.5} onChange={e=>setPf(+e.target.value)} style={inp}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <label style={lbl}>Freight & logistics (%)</label>
          <input type="number" value={freight} min={0} step={0.5} onChange={e=>setFreight(+e.target.value)} disabled={incoterm==="exworks"} style={{...inp,opacity:incoterm==="exworks"?0.4:1}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <label style={lbl}>GST / Tax (%)</label>
          <input type="number" value={tax} min={0} onChange={e=>setTax(+e.target.value)} style={inp}/>
        </div>
      </div>
      <div style={{height:1,background:"#eee",margin:"4px 0 14px"}}/>
      <h3 style={{fontSize:12.5,fontWeight:500,marginBottom:10}}>Group-wise pricing breakdown</h3>
      {sections.map((sec,si)=>(
        <div key={si} style={pbx}>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <SecNum n={sec.id}/>{sec.name.replace(/^\d+\.\s/,"")}
          </div>
          <PR label="Equipment ex-works" val={fmt(sEXW(sec))}/>
          <PR label={`Packing & forwarding (${pf}%)`} val={fmt(sPF(sec))}/>
          {incoterm!=="exworks"&&<PR label={`Freight (${freight}%)`} val={fmt(sFr(sec))}/>}
          <PR label="Installation" val={fmt(sInst(sec))}/>
          <PR label="Section total" val={fmt(sTot(sec))} total/>
        </div>
      ))}
      <div style={{...pbx,border:`2px solid ${ORANGE}`,background:"#fdf8f2"}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:ORANGE,letterSpacing:"0.08em",marginBottom:8}}>Final project summary</div>
        <PR label="Total equipment (ex-works)" val={fmt(t.exw)}/>
        <PR label={`Packing & forwarding (${pf}%)`} val={fmt(t.pf)}/>
        {incoterm!=="exworks"&&<PR label={`Freight & logistics (${freight}%)`} val={fmt(t.freight)}/>}
        <PR label="Sub-total (before tax)" val={fmt(t.sub)}/>
        <PR label={`GST @ ${tax}%`} val={fmt(t.tax)}/>
        <PR label="Installation (site actuals, indicative)" val={fmt(t.inst)}/>
        <PR label="TOTAL PROJECT COST" val={fmt(t.total)} grand/>
      </div>
      <p style={{fontSize:10.5,color:"#aaa",marginBottom:8}}>* Installation billed separately on actuals. Figure above is indicative based on standard rates.</p>
    </div>
  );

  // ── PAGE 3: TECH SHEETS ───────────────────────────────────────
  const TechSheets = () => {
    const sheets = [
      {name:"Bucket Elevator",model:"BE-60-25",specs:[["Capacity","60 TPH"],["Head height","25 m"],["Motor power","15 kW"],["Construction","MS Hot-Dip Galvanized"],["Bucket","6mm MS, PU lined"],["Belt","EP-315/3 Rubber, 400mm wide"],["Chain/belt speed","1.8 m/s"],["Bearings","SKF / FAG sealed"],["Finish","Epoxy primer + PU topcoat"],["Applicable grain","Paddy, wheat, maize, soybean"]]},
      {name:"Flat Bed Vibratory Screen Cleaner",model:"VFS-60",specs:[["Capacity","60 TPH"],["Screen decks","3-deck, MS perforated"],["Mesh apertures","Top 8mm / Mid 3mm / Bottom 1.5mm"],["Drive","Eccentric flywheel, 960 RPM"],["Motor","7.5 kW TEFC"],["Frame","MS fabricated, epoxy coated"],["Outlet fractions","3 fractions + tailings"],["Application","Pre & post-harvest grain cleaning"]]},
      {name:"PLC Control System",model:"Siemens S7-1200",specs:[["I/O configuration","64 DI / 48 DO / 16 AI / 8 AO"],["HMI","15\" Colour Touchscreen"],["Communications","Profinet / Ethernet-IP"],["Protocol","Modbus TCP, OPC-UA ready"],["Control voltage","24VDC control, 415V 3-phase main"],["Panel enclosure","IP54 powder-coated MS"],["Software","SCADA-ready, remote access via VPN"],["Backup power","UPS, 30 min battery backup"]]},
      {name:"Centrifugal Aeration Fan",model:"CAF-7.5",specs:[["Air flow","18,000 m³/hr per fan"],["Static pressure","250 Pa"],["Motor","7.5 kW IE3 efficiency class"],["Speed","960 RPM"],["Impeller","Backward curved, galvanized"],["Housing","MS galvanized, flanged outlet"],["Outlet connection","400mm dia flanged duct"],["Balance class","ISO 1940 G6.3"]]},
      {name:"Grain Monitoring System",model:"OPI-GMS-8",specs:[["No. of cables","8 temperature / moisture cables"],["Sensors per cable","12 sensors at 1.5m spacing"],["Temperature range","-20°C to +70°C"],["Moisture range","10–30% MC"],["Accuracy","±0.3°C / ±0.5% MC"],["Interface","Web dashboard + iOS/Android app"],["Connectivity","4G / WiFi / LAN"],["Alarms","High temp, high MC, cable fault"]]},
      {name:"Sweep Auger with Tractor Drive",model:"SAU-D/2",specs:[["Sweep radius","Exactly R/2 (half silo diameter)"],["Auger","6\" dia, 150mm pitch, MS flight"],["Tractor wheels","4 PU wheels, 1.5 kW gearmotor"],["Revolution speed","2 RPM full circle"],["Center drive","3 kW gearbox"],["Overload protection","Shear bolt system"],["Material finish","Hot-dip galvanized throughout"],["Sizing note","Confirmed per silo diameter at order"]]},
    ];
    return (
      <div style={{padding:"0 14px"}}>
        <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Technical data sheets</h2>
        <p style={{fontSize:11,color:"#888",marginBottom:12}}>Key equipment specifications · Final specs confirmed at order stage · Indicative for quotation purposes</p>
        {sheets.map((sh,idx)=>(
          <div key={idx} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:"1px solid #eee",background:"#f9f9f7"}}>
              <div style={{width:28,height:28,borderRadius:7,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,flexShrink:0}}>⚙</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{sh.name}</div>
                <div style={{fontSize:11,color:"#888"}}>{sh.model}</div>
              </div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:500,background:"#FAEEDA",color:"#633806"}}>Quoted item</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
              {sh.specs.map(([k,v],i)=>(
                <div key={k} style={{padding:"6px 12px",borderBottom:"1px solid #f0f0f0",borderRight:i%2===0?"1px solid #f0f0f0":"none",fontSize:11.5}}>
                  <label style={{...lbl,marginBottom:1}}>{k}</label>
                  <div style={{fontWeight:400}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── PAGE 4: TIMELINE ──────────────────────────────────────────
  const Timeline = () => {
    const phases = [
      {w:"Week 1–2",title:"Order finalisation & kickoff",desc:"Contract signing, 30% advance receipt, site survey visit, drawing approval process begins",pct:8},
      {w:"Week 3–4",title:"Engineering & drawing approval",desc:"GA drawings, foundation drawings, electrical SLD, equipment layout — submitted for client approval within 10 working days",pct:8},
      {w:"Week 5–8",title:"Civil & foundation work",desc:"Silo foundation, equipment plinths, pit construction, underground ducting — client scope, coordinated by Brag Systems supervisor",pct:18},
      {w:"Week 7–12",title:"Equipment manufacturing & FAT",desc:"Fabrication at vendor works. Factory Acceptance Testing (FAT) for silo sheets, elevator, conveyors, MCC panel before dispatch",pct:22},
      {w:"Week 12–14",title:"Equipment dispatch & site delivery",desc:"Progressive dispatch from factory. Site receipt inspection checklist. Secure storage at site pending erection.",pct:8},
      {w:"Week 14–20",title:"Silo erection & mechanical installation",desc:"Silo structure erection, mechanical equipment installation, pipe & ductwork, catwalk, staircase, access doors",pct:28},
      {w:"Week 20–22",title:"Electrical & automation installation",desc:"MCC panel installation, field cabling, PLC programming, sensor installation, earthing, lightning protection system",pct:8},
      {w:"Week 22–24",title:"Commissioning & trial run",desc:"No-load trial, grain load trial (client grain), PLC tuning, aeration system testing, grain monitoring commissioning",pct:14},
      {w:"Week 24",title:"Handover & training",desc:"O&M manual submission, operator training (2 days on-site), as-built drawing set, 12-month defect liability period begins",pct:4},
    ];
    return (
      <div style={{padding:"0 14px"}}>
        <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Project timeline</h2>
        <p style={{fontSize:11,color:"#888",marginBottom:12}}>Indicative for single silo · Multi-silo projects add 4–8 weeks · Subject to civil work readiness</p>
        <div style={{...card,padding:"10px 12px",marginBottom:14}}>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:12}}>
            <div><span style={{color:"#888"}}>Total duration</span><strong style={{marginLeft:4}}>22–24 weeks</strong></div>
            <div><span style={{color:"#888"}}>Defect liability</span><strong style={{marginLeft:4}}>12 months</strong></div>
            <div><span style={{color:"#888"}}>Payment</span><strong style={{marginLeft:4}}>30% · 60% progressive · 10% commissioning</strong></div>
          </div>
        </div>
        <div style={{position:"relative",paddingLeft:28,marginBottom:16}}>
          <div style={{position:"absolute",left:9,top:4,bottom:4,width:1,background:"#eee"}}/>
          {phases.map((p,i)=>(
            <div key={i} style={{position:"relative",marginBottom:14}}>
              <div style={{position:"absolute",left:-22,width:18,height:18,borderRadius:"50%",background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:"#fff",top:2}}>{i+1}</div>
              <div style={{fontSize:10,color:ORANGE,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{p.w}</div>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:2}}>{p.title}</div>
              <div style={{fontSize:11.5,color:"#888",lineHeight:1.45}}>{p.desc}</div>
              <div style={{height:5,borderRadius:3,background:ORANGE,marginTop:5,width:Math.max(p.pct*4,12),opacity:0.5}}/>
            </div>
          ))}
        </div>
        <div style={pbx}>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:"#888",letterSpacing:"0.08em",marginBottom:8}}>Payment milestone schedule</div>
          {[
            ["30% — Order advance on signing", t.total*0.30],
            ["30% — On dispatch of silo structure", t.total*0.30],
            ["30% — On dispatch of mechanical equipment", t.total*0.30],
            ["10% — On commissioning & handover", t.total*0.10],
          ].map(([l,v])=><PR key={l} label={l} val={fmt(v)}/>)}
        </div>
      </div>
    );
  };

  // ── PAGE 5: LAYOUT ────────────────────────────────────────────
  const Layout = () => (
    <div style={{padding:"0 14px"}}>
      <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Basic project layout</h2>
      <p style={{fontSize:11,color:"#888",marginBottom:12}}>Schematic process flow only · Detailed GA layout with equipment footprints issued post-order within 2 weeks</p>
      <div style={{background:"#f9f9f7",borderRadius:10,padding:12,overflowX:"auto",border:"1px solid #eee",marginBottom:12}}>
        <svg viewBox="0 0 820 460" style={{minWidth:580,width:"100%",fontFamily:"inherit"}}>
          <defs><marker id="a" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={ORANGE}/></marker></defs>
          {/* INTAKE */}
          <rect x="10" y="50" width="128" height="330" rx="6" fill="#fff" stroke={ORANGE} strokeWidth="1"/>
          <rect x="10" y="50" width="128" height="26" rx="6" fill={ORANGE}/>
          <rect x="10" y="64" width="128" height="12" fill={ORANGE}/>
          <text x="74" y="67" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">1. Intake &amp; Reception</text>
          {[["Dump Pit Hopper",90],["Drive-Over Grid",116],["Dust Aspiration",142],["Online Weigher",168]].map(([t,y])=>(
            <g key={t}><rect x="20" y={y} width="108" height="20" rx="3" fill="#f9f9f7" stroke="#eee" strokeWidth=".5"/><text x="74" y={y+13} textAnchor="middle" fontSize="8.5" fill="#333">{t}</text></g>
          ))}
          <text x="74" y="340" textAnchor="middle" fontSize="8.5" fill="#888">→ Drag Chain Conveyor</text>
          <line x1="138" y1="195" x2="168" y2="195" stroke={ORANGE} strokeWidth="1.5" markerEnd="url(#a)"/>
          {/* CLEANING */}
          <rect x="168" y="50" width="138" height="330" rx="6" fill="#fff" stroke="#185FA5" strokeWidth="1"/>
          <rect x="168" y="50" width="138" height="26" rx="6" fill="#185FA5"/>
          <rect x="168" y="64" width="138" height="12" fill="#185FA5"/>
          <text x="237" y="67" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">2. Cleaning Tower</text>
          {[["Rotary Scalper (pre-clean)",90],["Vibratory Screen Cleaner",116],["Magnetic Separator",142],["Dust Collection System",168]].map(([t,y])=>(
            <g key={t}><rect x="178" y={y} width="118" height="20" rx="3" fill="#eef2ff" stroke="#c5d0f0" strokeWidth=".5"/><text x="237" y={y+13} textAnchor="middle" fontSize="8.5" fill="#333">{t}</text></g>
          ))}
          <line x1="306" y1="195" x2="336" y2="195" stroke={ORANGE} strokeWidth="1.5" markerEnd="url(#a)"/>
          {/* ELEVATOR */}
          <rect x="336" y="30" width="76" height="372" rx="6" fill="#fff" stroke="#27500A" strokeWidth="1"/>
          <rect x="336" y="30" width="76" height="26" rx="6" fill="#27500A"/>
          <rect x="336" y="44" width="76" height="12" fill="#27500A"/>
          <text x="374" y="47" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">3. Elevator</text>
          {["Bucket Elevator","60 TPH","25m height"].map((t,i)=>(
            <text key={t} x="374" y={74+i*14} textAnchor="middle" fontSize="9" fill="#555">{t}</text>
          ))}
          <line x1="374" y1="115" x2="374" y2="388" stroke="#27500A" strokeWidth="1" strokeDasharray="5,3"/>
          <text x="374" y="396" textAnchor="middle" fontSize="11" fill="#27500A">↑</text>
          <line x1="412" y1="63" x2="452" y2="63" stroke={ORANGE} strokeWidth="1.5" markerEnd="url(#a)"/>
          <text x="432" y="57" textAnchor="middle" fontSize="8" fill="#888">Distributor</text>
          {/* SILO */}
          <rect x="452" y="30" width="160" height="360" rx="6" fill="#fff" stroke="#C47E0E" strokeWidth="1.5"/>
          <rect x="452" y="30" width="160" height="26" rx="6" fill={ORANGE}/>
          <rect x="452" y="44" width="160" height="12" fill={ORANGE}/>
          <text x="532" y="47" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">4. Storage Silo</text>
          <ellipse cx="532" cy="96" rx="58" ry="11" fill="none" stroke="#C47E0E" strokeWidth=".8"/>
          <line x1="474" y1="96" x2="474" y2="276" stroke="#C47E0E" strokeWidth=".8"/>
          <line x1="590" y1="96" x2="590" y2="276" stroke="#C47E0E" strokeWidth=".8"/>
          {[132,164,196,228,260].map(y=><line key={y} x1="474" y1={y} x2="590" y2={y} stroke="#e5e5e5" strokeWidth=".5"/>)}
          <path d="M474,276 L510,324 L554,324 L590,276 Z" fill="none" stroke="#C47E0E" strokeWidth=".8"/>
          <line x1="532" y1="324" x2="532" y2="350" stroke="#C47E0E" strokeWidth="1.2"/>
          {[["GI sidewall sheets",112],["Aeration floor gratings",146],["Sweep auger (R/2)",180],["Temp monitoring cables",213],["Aeration fans",246],["Center draw-off gate",340]].map(([t,y])=>(
            <text key={t} x="532" y={y} textAnchor="middle" fontSize="8" fill="#666">{t}</text>
          ))}
          {/* Arrow at hopper bottom */}
          <line x1="612" y1="312" x2="648" y2="312" stroke={ORANGE} strokeWidth="1.5" markerEnd="url(#a)"/>
          {/* DISPATCH */}
          <rect x="648" y="50" width="158" height="330" rx="6" fill="#fff" stroke="#712B13" strokeWidth="1"/>
          <rect x="648" y="50" width="158" height="26" rx="6" fill="#712B13"/>
          <rect x="648" y="64" width="158" height="12" fill="#712B13"/>
          <text x="727" y="67" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fff">5. Dispatch &amp; Control</text>
          {[["Lower Reclaim Conveyor",90],["Belt Conveyor to loading",116],["Truck / Rail Loading",142]].map(([t,y])=>(
            <g key={t}><rect x="658" y={y} width="138" height="20" rx="3" fill="#fff0ee" stroke="#f0d0c8" strokeWidth=".5"/><text x="727" y={y+13} textAnchor="middle" fontSize="8.5" fill="#333">{t}</text></g>
          ))}
          {["MCC Panel","PLC / SCADA","Level sensors","Remote monitor"].map((t,i)=>(
            <text key={t} x="727" y={195+i*18} textAnchor="middle" fontSize="9" fill="#666">{t}</text>
          ))}
          {/* Legend */}
          <rect x="10" y="408" width="800" height="44" rx="5" fill="#fff" stroke="#eee" strokeWidth=".5"/>
          <text x="20" y="425" fontSize="9" fontWeight="600" fill="#888">LEGEND:</text>
          {[[ORANGE,"Intake / flow direction",74],[`#185FA5`,"Cleaning tower",206],[`#27500A`,"Elevating",292],[ORANGE,"Silo structure",372],[`#712B13`,"Dispatch & control",466]].map(([c,l,x])=>(
            <g key={l}><rect x={x} y="417" width="10" height="8" rx="2" fill={c}/><text x={x+14} y="425" fontSize="8.5" fill="#666">{l}</text></g>
          ))}
          <text x="20" y="443" fontSize="8" fill="#aaa">Schematic only. Detailed GA drawings with equipment footprints and foundation loads issued within 2 weeks of order.</text>
        </svg>
      </div>
      <p style={{fontSize:11,color:"#888",textAlign:"center"}}>Site-specific layout, civil drawings and foundation load schedules issued by Brag Systems engineering team post-order</p>
    </div>
  );

  // ── PAGE 6: TERMS ─────────────────────────────────────────────
  const Terms = () => (
    <div style={{padding:"0 14px"}}>
      <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Terms, conditions & exclusions</h2>
      <p style={{fontSize:11,color:"#888",marginBottom:12}}>Please read carefully before placing order · Queries: info@bragsystems.com</p>
      <div style={{...card,padding:"14px 16px"}}>
        {[
          {title:"Commercial terms",color:ORANGE,items:[
            ["1","Prices valid 90 days from quotation date unless otherwise stated in writing."],
            ["2","Payment: 30% advance with order · 60% progressive against dispatch documents · 10% within 30 days of commissioning."],
            ["3","All prices in INR. Steel price escalation exceeding 8% from order date is subject to revision with supporting documentation."],
            ["4","GST applicable at prevailing government rates at time of invoicing."],
            ["5","Force majeure events (floods, strikes, government restrictions) entitle Brag Systems to reasonable delivery extension with written notice."],
            ["6","Cancellation after order acceptance: 20% of order value as cancellation charges to cover engineering and procurement costs already incurred."],
          ]},
          {title:"Delivery & warranty",color:ORANGE,items:[
            ["7","Delivery period: 14–20 weeks from receipt of advance payment and written drawing approval. Subject to civil work readiness by client."],
            ["8","Warranty: 12 months from commissioning date or 18 months from dispatch date, whichever is earlier."],
            ["9","Warranty covers manufacturing defects only. Damage due to misuse, incorrect operation, overloading, or unauthorized modification is excluded."],
            ["10","Warranty service: Brag Systems will repair or replace defective parts at no charge during warranty period. Travel and accommodation to site at client's cost for warranty visits beyond 200km from Gurugram."],
          ]},
          {title:"Exclusions — not in scope of this quotation",color:"#791F1F",items:[
            ["E1","Civil & structural work — silo foundation, equipment plinths, roads, site drainage, building structure, bins/bunkers."],
            ["E2","Electrical power supply cabling up to MCC incoming terminals — from transformer or DG set to panel."],
            ["E3","Diesel Generator (DG) set, transformer, HT/LT power infrastructure and metering."],
            ["E4","Water supply, compressed air network, fire-fighting system, sprinklers."],
            ["E5","Grain supply for commissioning trials — client to provide 20–50 MT of clean, dry grain."],
            ["E6","Labour accommodation, site office facility, sanitation arrangements at site."],
            ["E7","Statutory approvals, factory licenses, pollution control board NOC, local authority permissions and fees."],
            ["E8","Third-party inspection, insurance or expediting unless specifically included and priced separately."],
            ["E9","Any item, service, or work not explicitly listed in the equipment schedule of this quotation."],
          ]},
          {title:"Legal & jurisdiction",color:DARK,items:[
            ["L1","Jurisdiction: All disputes subject to the exclusive jurisdiction of courts of Gurugram, Haryana only."],
            ["L2","Applicable law: Indian Contract Act 1872 and Sale of Goods Act 1930."],
            ["L3","Disputes shall first be resolved through arbitration under the Arbitration & Conciliation Act 1996 before litigation."],
          ]},
        ].map(({title,color,items})=>(
          <div key={title} style={{marginBottom:14}}>
            <h4 style={{fontSize:11,fontWeight:600,color,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>{title}</h4>
            {items.map(([n,text])=>(
              <div key={n} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"4px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}>
                <span style={{fontSize:10,fontWeight:600,color,minWidth:20,marginTop:1,flexShrink:0}}>{n}.</span>
                <span style={{lineHeight:1.5}}>{text}</span>
              </div>
            ))}
            <div style={{height:1,background:"#eee",margin:"10px 0"}}/>
          </div>
        ))}
      </div>
    </div>
  );

  // ── PAGE 7: REFERENCES ────────────────────────────────────────
  const References = () => (
    <div style={{padding:"0 14px"}}>
      <h2 style={{fontSize:14,fontWeight:500,marginBottom:3}}>Reference list</h2>
      <p style={{fontSize:11,color:"#888",marginBottom:12}}>Completed projects across India · Site visits arranged on request with 5 working days notice</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[["50+","Projects executed"],["7","States covered"],["2.5L+ MT","Storage created"],["100%","Turnkey delivery"]].map(([v,l])=>(
          <div key={l} style={{background:"#f9f9f7",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid #eee"}}>
            <div style={{fontSize:17,fontWeight:600,color:ORANGE}}>{v}</div>
            <div style={{fontSize:10,color:"#888",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      {[
        {state:"Punjab",client:"Lakshmi Rice Mills Pvt. Ltd.",project:"2 × 5,000 MT paddy silos with cleaning tower & aeration — full turnkey",year:"2022"},
        {state:"Haryana",client:"Haryana Warehousing Corporation",project:"1 × 10,000 MT wheat flat-bottom silo + cleaning line + PLC automation",year:"2021"},
        {state:"West Bengal",client:"Bengal Flour Mills Ltd.",project:"3 × 3,000 MT wheat silos with aeration, monitoring & dispatch conveyor",year:"2023"},
        {state:"Chhattisgarh",client:"Chhattisgarh Distillery Pvt. Ltd.",project:"Maize intake & conditioning system + 2 × 5,000 MT storage silos",year:"2022"},
        {state:"Orissa",client:"Odisha State Civil Supplies Corp.",project:"5,000 MT rice flat-bottom silo complex with MCC & remote monitoring",year:"2020"},
        {state:"Rajasthan",client:"Rajasthan Oil & Grain Industries",project:"Mustard seed 2 × 3,000 MT hopper-bottom silos with aeration",year:"2023"},
        {state:"Punjab (Beas)",client:"Beas Agro Processing Unit",project:"Intake cleaning tower + 3 silos + sweep augers + full automation — turnkey",year:"2024"},
      ].map(r=>(
        <div key={r.client} style={{display:"flex",gap:10,padding:"9px 12px",border:"1px solid #eee",borderRadius:8,marginBottom:8,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:7,background:"#f9f9f7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,border:"1px solid #eee"}}>🏭</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12.5,fontWeight:500,marginBottom:2}}>{r.client}</div>
            <div style={{fontSize:11.5,color:"#666"}}>{r.project}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,fontWeight:500,background:"#FAEEDA",color:"#633806"}}>{r.state}</span>
            <div style={{fontSize:10.5,color:"#aaa",marginTop:4}}>{r.year}</div>
          </div>
        </div>
      ))}
      <div style={{padding:"10px 12px",background:"#f9f9f7",borderRadius:8,border:"1px solid #eee",fontSize:11.5,color:"#888"}}>
        ℹ Reference contacts available on request under mutual NDA. Site visits to shortlisted references can be arranged with 5 working days' advance notice.
      </div>
    </div>
  );

  // ── PAGE 8: THANK YOU ─────────────────────────────────────────
  const ThankYou = () => (
    <div style={{padding:"0 14px"}}>
      <div style={{textAlign:"center",padding:"24px 12px"}}>
        <div style={{width:56,height:56,background:ORANGE,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:600,color:"#fff",margin:"0 auto 14px"}}>BS</div>
        <h2 style={{fontSize:20,fontWeight:500,marginBottom:6}}>Thank you, {client.name||"Valued Partner"}!</h2>
        <p style={{fontSize:12.5,color:"#888",lineHeight:1.75,maxWidth:480,margin:"0 auto 14px"}}>
          We sincerely appreciate your interest in Brag Systems and the confidence you have placed in us for the project at <strong style={{color:DARK}}>{client.company||"your organisation"}</strong>. We are ready to make it better — together.
        </p>
        <p style={{fontSize:15,color:ORANGE,fontWeight:500,marginBottom:22,letterSpacing:"0.01em"}}>"Let's Build It Better!"</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:480,margin:"0 auto 18px"}}>
          {[["👤","Abhinav Sharma","Founder & Director"],["✉️","info@bragsystems.com","Email us"],["📍","Eco Tower, IMT Manesar","Gurugram, Haryana"]].map(([ic,main,sub])=>(
            <div key={main} style={{background:"#f9f9f7",borderRadius:8,padding:"10px 8px",border:"1px solid #eee"}}>
              <div style={{fontSize:18,marginBottom:4}}>{ic}</div>
              <div style={{fontSize:11,fontWeight:500}}>{main}</div>
              <div style={{fontSize:10,color:"#888",marginTop:1}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#f9f9f7",borderRadius:10,padding:"14px 18px",textAlign:"left",maxWidth:500,margin:"0 auto 16px",border:"1px solid #eee"}}>
          <div style={{fontSize:11.5,fontWeight:500,marginBottom:8}}>Quote summary</div>
          {[["Quote reference",quote.num],["Project",client.project||"—"],["Incoterm",incoterm.toUpperCase()],["Quote date",quote.date],["Valid until",`${quote.validity} days from above`]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid #eee"}}><span style={{color:"#888"}}>{l}</span><span>{v}</span></div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:14,padding:"7px 0 2px",fontWeight:600,color:ORANGE}}>
            <span>Total project cost</span><span>{fmt(t.total)}</span>
          </div>
        </div>
        <div style={{background:"#f9f9f7",borderRadius:10,padding:"12px 18px",textAlign:"left",maxWidth:500,margin:"0 auto 18px",border:"1px solid #eee"}}>
          <div style={{fontSize:11.5,fontWeight:500,marginBottom:8}}>Suggested next steps</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {["Review this quotation with your team","Share technical queries or scope changes","Arrange a site visit to a reference project","Place order with 30% advance to begin"].map((s,i)=>(
              <div key={s} style={{fontSize:11.5,color:"#666",display:"flex",gap:6,lineHeight:1.45}}>
                <span style={{color:ORANGE,fontWeight:600,flexShrink:0}}>{i+1}.</span>{s}
              </div>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid #eee",paddingTop:16,maxWidth:380,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:11,color:"#aaa",marginBottom:34}}>For and on behalf of Brag Systems</p>
          <div style={{width:180,borderTop:"1px solid #555",margin:"0 auto 6px"}}/>
          <p style={{fontSize:11.5,fontWeight:500}}>Abhinav Sharma</p>
          <p style={{fontSize:11,color:"#888"}}>Founder & Director · Brag Systems</p>
          <p style={{fontSize:11,color:"#aaa",marginTop:2}}>Date: {quote.date} · Quote: {quote.num}</p>
        </div>
        <div style={{marginTop:20,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={exportQuote} style={{background:ORANGE,color:"#fff",border:"none",borderRadius:7,padding:"8px 18px",fontSize:12,fontWeight:600,cursor:"pointer"}}>↓ Export quote file</button>
          <button onClick={()=>{setSections(defaultSections);setClient({name:"",company:"",city:"",email:"",phone:"",project:""});setPage(0);showToast("New quote started");}} style={{border:"1px solid #ddd",background:"#fff",borderRadius:7,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>↺ Start new quote</button>
        </div>
      </div>
    </div>
  );

  const pageComponents = [Cover,Equipment,Pricing,TechSheets,Timeline,Layout,Terms,References,ThankYou];
  const PageComp = pageComponents[page];

  return (
    <div style={{minHeight:600,background:"#fafafa",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <Nav/>
      {toast && (
        <div style={{position:"fixed",bottom:16,right:16,background:DARK,color:"#fff",padding:"9px 14px",borderRadius:8,fontSize:12,zIndex:100,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}>
          <span style={{color:ORANGE,fontSize:14}}>✓</span>{toast}
        </div>
      )}
      <div style={{paddingTop:6,paddingBottom:20}}>
        <PageComp/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderTop:"1px solid #eee",background:"#fff",position:"sticky",bottom:0}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{fontSize:12,padding:"5px 14px",border:"1px solid #ddd",borderRadius:6,background:"#fff",cursor:"pointer",opacity:page===0?0.4:1}}>← {page>0?PAGES[page-1]:"Start"}</button>
        <span style={{fontSize:11,color:"#aaa",alignSelf:"center"}}>{page+1} / {PAGES.length} · {PAGES[page]}</span>
        <button onClick={()=>setPage(p=>Math.min(8,p+1))} disabled={page===8} style={{fontSize:12,padding:"5px 14px",border:"none",borderRadius:6,background:ORANGE,color:"#fff",fontWeight:600,cursor:"pointer",opacity:page===8?0.4:1}}>{page<8?PAGES[page+1]:"Done"} →</button>
      </div>
    </div>
  );
}
