import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

/*
  ColdChainX – Clickable prototype (React component build)
  - New interactive pages added:
    • Distributor: Build Load
    • Retailer: Gate-in QC, Fast-track
  - Lightweight images added via Unsplash (small, lazy-loaded)
  - Mirrors the single-file index.html behaviour
*/

const roles = ["FPO", "Distributor", "Retailer"] as const;
type Role = typeof roles[number];

type Lot = { id: string; crop: string; variety: string; weight: number; score: number; days: number };

type RouteName =
  | "home"
  | "fpo.pre-cool"
  | "fpo.find-reefer"
  | "dist.build-load"
  | "dist.nudge"
  | "dist.reroute"
  | "dist.dispute"
  | "ret.gatein"
  | "ret.fasttrack";

type Route = { name: RouteName; params?: Record<string, any> };

const cropImg: Record<string, string> = {
  Grapes: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=240&q=40",
  Tomato: "https://images.unsplash.com/photo-1506801310323-534be5e7ed6a?auto=format&fit=crop&w=240&q=40",
  Pomegranate: "https://images.unsplash.com/photo-1604908554027-3f3d53d58e52?auto=format&fit=crop&w=240&q=40",
};

const seedLots: Lot[] = [
  { id: "LOT-NSK-001", crop: "Grapes", variety: "Thompson", weight: 800, score: 92, days: 9 },
  { id: "LOT-NSK-002", crop: "Tomato", variety: "Arka", weight: 1200, score: 81, days: 4 },
  { id: "LOT-NSK-003", crop: "Pomegranate", variety: "Bhagwa", weight: 600, score: 87, days: 6 },
];

const nextLotId = (countSoFar: number, prefix = "LOT-NSK-") => {
  const n = countSoFar + 1;
  return `${prefix}${String(n).padStart(3, "0")}`;
};

function Header({ role, setRole, navigate }: { role: Role; setRole: (r: Role) => void; navigate: (r: Route) => void }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-2xl font-bold">ColdChainX</div>
      <div className="flex items-center gap-3">
        {roles.map((r) => (
          <button key={r} onClick={() => { setRole(r); navigate({ name: "home" }); }}
            className={`px-3 py-1 rounded-full border ${role === r ? "bg-gray-900 text-white" : "bg-white"}`}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="px-3 py-1 rounded-xl border">← Back</button>
      <div className="text-lg font-semibold">{title}</div>
    </div>
  );
}

function KPI({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      <div className="text-gray-500 text-sm" title={hint}>{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-100 text-green-800" : score >= 75 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  return <span className={`px-2 py-1 rounded-full text-xs ${color}`}>{score}</span>;
}

/* -------------------- FPO -------------------- */
function FPOView({ navigate }: { navigate: (r: Route) => void }) {
  const [lots, setLots] = useState<Lot[]>(seedLots);
  const [form, setForm] = useState({ crop: "", variety: "", weight: "" });

  const addLot = () => {
    if (!form.crop || !form.variety || !form.weight) return;
    const id = nextLotId(lots.length);
    const weight = parseFloat(form.weight);
    setLots([{ id, crop: form.crop, variety: form.variety, weight, score: 88, days: 7 }, ...lots]);
    setForm({ crop: "", variety: "", weight: "" });
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="Accepted-weight %" value="82%" hint="Accepted weight / total delivered in last 30 days" />
        <KPI label="Active lots" value={`${lots.length}`} />
        <KPI label="Next payout" value="T+2 days" />
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="font-semibold">Create Lot</div>
        <div className="grid grid-cols-3 gap-3">
          <input className="border p-2 rounded-xl" placeholder="Crop" value={form.crop} onChange={(e)=>setForm({...form, crop:e.target.value})}/>
          <input className="border p-2 rounded-xl" placeholder="Variety" value={form.variety} onChange={(e)=>setForm({...form, variety:e.target.value})}/>
          <input className="border p-2 rounded-xl" placeholder="Est. weight (kg)" value={form.weight} onChange={(e)=>setForm({...form, weight:e.target.value})}/>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={addLot}>Save Lot</button>
          <button className="px-4 py-2 rounded-xl border" onClick={() => navigate({ name: "fpo.pre-cool" })}>Find Pre-cool Slot</button>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="font-semibold">My Lots</div>
        <div className="grid md:grid-cols-3 gap-3">
          {lots.map((l) => (
            <div key={l.id} className="rounded-2xl border p-4 grid gap-2 bg-white">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{l.id}</div>
                <ScoreChip score={l.score} />
              </div>
              <div className="flex items-center gap-3">
                <img loading="lazy" alt="" src={cropImg[l.crop]||cropImg.Grapes} width="60" height="44" className="rounded-lg"/>
                <div className="text-sm text-gray-600">{l.crop} • {l.variety} • {l.weight} kg</div>
              </div>
              <div className="text-xs">Shelf-life left: {l.days} days</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "fpo.pre-cool", params: { lotId: l.id } })}>Book Pre-cool</button>
                <button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "fpo.find-reefer", params: { lotId: l.id } })}>Find Reefer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreCoolBookingPage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [store, setStore] = useState("Nashik Packhouse A");
  const [slot, setSlot] = useState("Today 6–8 PM");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <SubHeader title="Book Pre-cool" onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="text-sm text-gray-600">Lot</div>
          <input className="border p-2 rounded-xl" value={lotId || "Select from My Lots"} readOnly />
          <div className="text-sm text-gray-600">Packhouse</div>
          <select className="border p-2 rounded-xl" value={store} onChange={(e)=>setStore(e.target.value)}>
            <option>Nashik Packhouse A</option>
            <option>Nashik Packhouse B</option>
            <option>Pune Packhouse North</option>
          </select>
          <div className="text-sm text-gray-600">Slot</div>
          <select className="border p-2 rounded-xl" value={slot} onChange={(e)=>setSlot(e.target.value)}>
            <option>Today 6–8 PM</option>
            <option>Today 8–10 PM</option>
            <option>Tomorrow 6–8 AM</option>
          </select>
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={()=>setConfirmed(true)}>Confirm Booking</button>
          {confirmed && <div className="text-green-700 text-sm">Booked! Gate pass & QR sent to your app.</div>}
        </div>
        <div className="rounded-2xl border p-4 text-sm bg-white">
          <div className="font-semibold mb-2">Slot Utilization</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Pre-cool SOP: 3.2°C, 90% RH, 45 min dwell</li>
            <li>Live queue: 2 trucks ahead at {store}</li>
            <li>Penalty-free cancel window: 60 min before slot</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FindReeferPage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [origin, setOrigin] = useState("Nashik");
  const [dest, setDest] = useState("Mumbai DC");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [coLoad, setCoLoad] = useState(true);
  const estimate = useMemo(() => {
    const base = 9000; const co = coLoad ? -1200 : 0; const dist = dest.includes("Pune") ? -300 : 0;
    return base + co + dist;
  }, [coLoad, dest]);
  return (
    <div>
      <SubHeader title="Find Reefer" onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <label className="text-sm text-gray-600">Lot</label>
          <input className="border p-2 rounded-xl" value={lotId || "Select from My Lots"} readOnly />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-600">Origin</div>
              <input className="border p-2 rounded-xl" value={origin} onChange={(e)=>setOrigin(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Destination</div>
              <select className="border p-2 rounded-xl" value={dest} onChange={(e)=>setDest(e.target.value)}>
                <option>Mumbai DC</option>
                <option>Pune DC</option>
                <option>Nhava Sheva (Port)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-600">Pickup date</div>
              <input type="date" className="border p-2 rounded-xl" value={date} onChange={(e)=>setDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <input id="cl" type="checkbox" className="w-4 h-4" checked={coLoad} onChange={(e)=>setCoLoad(e.target.checked)} />
              <label htmlFor="cl" className="text-sm">Allow co-load to reduce cost</label>
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-sm">
            <div>Suggested lane: {origin} → {dest}</div>
            <div>Est. freight: ₹{estimate.toLocaleString()}</div>
            <div>ETA: 6h 30m • SOP: 3°C / 90% RH</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white">Book Reefer</button>
        </div>
        <div className="rounded-2xl border p-4 text-sm bg-white">
          <div className="font-semibold mb-2">Carrier Options</div>
          <ul className="space-y-2">
            <li className="flex justify-between"><span>Vendor A • sealed doors • live telemetry</span><span>₹9,200</span></li>
            <li className="flex justify-between"><span>Vendor B • reusable crates</span><span>₹8,800</span></li>
            <li className="flex justify-between"><span>Vendor C • Pharma-grade reefer</span><span>₹10,400</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* -------------------- DISTRIBUTOR -------------------- */
function DistributorView({ navigate }: { navigate: (r: Route) => void }) {
  const lanes = [
    { name: "Nashik → Mumbai DC", km: 175, co: "High", risk: "Low" },
    { name: "Nashik → Pune DC", km: 210, co: "Med", risk: "Med" },
    { name: "Nashik → Nhava Sheva (Port)", km: 180, co: "Low", risk: "High" },
  ];
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="Active trips" value="8" />
        <KPI label="On-time %" value="93%" />
        <KPI label="Dispute TAT" value="&lt; 48h" />
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="font-semibold">Lane Planner</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b"><th className="py-2">Lane</th><th>km</th><th>Co-load</th><th>Risk</th><th></th></tr>
          </thead>
          <tbody>
            {lanes.map(ln => (
              <tr key={ln.name} className="border-b">
                <td className="py-2">{ln.name}</td><td>{ln.km}</td><td>{ln.co}</td><td>{ln.risk}</td>
                <td><button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "dist.build-load", params: { lane: ln.name } })}>Build Load</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="font-semibold">Trip Monitor</div>
        <div className="grid md:grid-cols-3 gap-3">
          {seedLots.map((l) => (
            <div key={l.id} className="rounded-2xl border p-4 grid gap-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{l.id}</div>
                <ScoreChip score={l.score} />
              </div>
              <div className="text-sm text-gray-600">Temp: 3.1°C • Humidity: 90% • ETA: 01:12</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "dist.nudge", params: { lotId: l.id } })}>Nudge SOP</button>
                <button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "dist.reroute", params: { lotId: l.id } })}>Reroute</button>
                <button className="px-3 py-1 rounded-xl border" onClick={() => navigate({ name: "dist.dispute", params: { lotId: l.id } })}>Raise Dispute</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuildLoadPage({ onBack, lane }: { onBack: () => void; lane?: string }) {
  const [selected, setSelected] = useState<{ lot: Lot; qty: number }[]>([]);
  const [setpoint, setSetpoint] = useState(3);
  const [coLoad, setCoLoad] = useState(true);
  const capacity = useMemo(() => selected.reduce((s, i) => s + i.qty, 0), [selected]);

  const add = (lot: Lot) => setSelected((prev) => {
    const i = prev.findIndex((p) => p.lot.id === lot.id);
    if (i >= 0) { const c = [...prev]; c[i].qty += 100; return c; }
    return [...prev, { lot, qty: 100 }];
  });
  const dec = (idx: number) => setSelected((prev) => {
    const c = [...prev]; c[idx].qty = Math.max(0, c[idx].qty - 100); return c.filter(x => x.qty > 0);
  });

  return (
    <div>
      <SubHeader title={`Build Load – ${lane || "Select lane"}`} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="font-semibold">Pick Lots</div>
          <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-auto">
            {seedLots.map((l) => (
              <div key={l.id} className="flex items-center justify-between border rounded-xl p-2">
                <div className="flex items-center gap-3">
                  <img loading="lazy" alt="" src={cropImg[l.crop]||cropImg.Grapes} width="48" height="36" className="rounded-lg"/>
                  <div className="text-sm">{l.crop} • {l.variety} <span className="text-xs text-gray-500">({l.id})</span></div>
                </div>
                <button className="px-2 py-1 rounded-lg border" onClick={() => add(l)}>+100kg</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="font-semibold">Load Summary</div>
          <div className="text-sm">Target lane: <span className="font-medium">{lane}</span></div>
          <div className="text-sm">Setpoint <input type="number" className="border rounded-lg px-2 py-1 w-20 ml-2" value={setpoint} onChange={(e)=>setSetpoint(parseFloat(e.target.value)||0)} /> °C</div>
          <div className="flex items-center gap-2 text-sm">
            <input id="cl2" type="checkbox" className="w-4 h-4" checked={coLoad} onChange={(e)=>setCoLoad(e.target.checked)} />
            <label htmlFor="cl2">Allow co-load (mix compatible SKUs)</label>
          </div>
          <div className="text-xs text-gray-600">Capacity used</div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: Math.min(100, capacity/2000*100) + "%" }} /></div>
          <div className="text-sm">{capacity} / 2000 kg</div>
          <div className="grid gap-2">
            {selected.length === 0 ? <div className="text-sm text-gray-500">No items yet.</div> : selected.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>{it.lot.crop} • {it.lot.variety} <span className="text-xs text-gray-500">({it.lot.id})</span></div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-lg border" onClick={() => dec(idx)}>-100kg</button>
                  <div className="w-20 text-right">{it.qty} kg</div>
                  <button className="px-2 py-1 rounded-lg border" onClick={() => add(it.lot)}>+100kg</button>
                </div>
              </div>
            ))}
          </div>
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white w-max">Create Manifest (mock)</button>
          <div className="text-xs text-gray-500">Auto-checks: SOP 3°C/90% RH • Door events • ETA & lane tolls • Penalty risk</div>
        </div>
      </div>
    </div>
  );
}

function NudgeSOPPage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [nudge, setNudge] = useState("Close doors / reduce openings");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div>
      <SubHeader title={`Nudge SOP – ${lotId || "Select lot"}`} onBack={onBack} />
      <div className="rounded-2xl border p-4 grid gap-3 max-w-2xl bg-white">
        <div className="text-sm text-gray-600">Action</div>
        <select className="border p-2 rounded-xl" value={nudge} onChange={(e)=>setNudge(e.target.value)}>
          <option>Close doors / reduce openings</option>
          <option>Increase airflow (fan speed +10%)</option>
          <option>Temp reset to 3°C</option>
          <option>Hold at nearest cold room</option>
        </select>
        <div className="text-sm text-gray-600">Optional note</div>
        <textarea className="border p-2 rounded-xl" rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Add context for the driver / hub"/>
        <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={() => setSent(true)}>Send Nudge</button>
        {sent && <div className="text-green-700 text-sm">Nudge sent to driver + hub. Auto-logged to shipment timeline.</div>}
      </div>
    </div>
  );
}

function ReroutePage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [dest, setDest] = useState("Mumbai DC");
  const [reason, setReason] = useState("Avoid congestion / meet cut-off");
  const [delta] = useState<{ eta: string; cost: number }>({ eta: "+38 min", cost: 900 });
  return (
    <div>
      <SubHeader title={`Reroute – ${lotId || "Select lot"}`} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="text-sm text-gray-600">New destination</div>
          <select className="border p-2 rounded-xl" value={dest} onChange={(e)=>setDest(e.target.value)}>
            <option>Mumbai DC</option>
            <option>Pune DC</option>
            <option>Nhava Sheva (Port)</option>
          </select>
          <div className="text-sm text-gray-600">Reason</div>
          <select className="border p-2 rounded-xl" value={reason} onChange={(e)=>setReason(e.target.value)}>
            <option>Avoid congestion / meet cut-off</option>
            <option>Temp breach risk – need cold room</option>
            <option>Buyer request – gate slot change</option>
          </select>
          <div className="rounded-xl bg-gray-50 p-3 text-sm">
            <div>ETA delta: {delta.eta}</div>
            <div>Estimated cost delta: ₹{delta.cost}</div>
            <div>Compliance: SOP unchanged (3°C/90% RH)</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white">Confirm Reroute</button>
        </div>
        <div className="rounded-2xl border p-4 text-sm bg-white">
          <div className="font-semibold mb-2">What we consider</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Current telematics (ΔT, door events, dwell)</li>
            <li>Buyer gate-in windows / cut-offs</li>
            <li>Traffic + road works + toll queues</li>
            <li>Cost-to-serve vs. penalty risk</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DisputePage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [type, setType] = useState("Temp breach claim");
  const [desc, setDesc] = useState("");
  const [raised, setRaised] = useState(false);
  return (
    <div>
      <SubHeader title={`Raise Dispute – ${lotId || "Select lot"}`} onBack={onBack} />
      <div className="rounded-2xl border p-4 grid gap-3 max-w-2xl bg-white">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-600">Dispute type</div>
            <select className="border p-2 rounded-xl" value={type} onChange={(e)=>setType(e.target.value)}>
              <option>Temp breach claim</option>
              <option>Short delivery / weight diff</option>
              <option>Quality grade mismatch</option>
            </select>
          </div>
          <div>
            <div className="text-sm text-gray-600">Attach evidence (mock)</div>
            <input type="file" className="border p-2 rounded-xl w-full" />
          </div>
        </div>
        <div className="text-sm text-gray-600">Details</div>
        <textarea className="border p-2 rounded-xl" rows={4} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Describe issue, location, timestamp…"/>
        <div className="rounded-xl bg-gray-50 p-3 text-sm">Auto-attach: telemetry snippet, location, Freshness Score timeline.</div>
        <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={()=>setRaised(true)}>Submit Dispute</button>
        {raised && <div className="text-green-700 text-sm">Dispute submitted. SLA: &lt; 48h. Tracking ID mailed.</div>}
      </div>
    </div>
  );
}

/* -------------------- RETAILER -------------------- */
function RetailerView({ navigate }: { navigate: (r: Route) => void }) {
  const [sortKey, setSortKey] = useState<"score" | "days" | "weight">("score");
  const sorted = useMemo(() => {
    const arr = [...seedLots];
    arr.sort((a,b)=> sortKey === "score" ? b.score - a.score : sortKey === "days" ? b.days - a.days : b.weight - a.weight);
    return arr;
  }, [sortKey]);

  const [cart, setCart] = useState<{ lot: Lot; qty: number }[]>([]);
  const onBuy = (lot: Lot) => setCart((prev)=>{
    const idx = prev.findIndex((p)=>p.lot.id === lot.id);
    if(idx>=0){ const copy=[...prev]; copy[idx].qty += 100; return copy; }
    return [...prev, { lot, qty: 100 }];
  });

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="Shrink (pilot SKUs)" value="-32%" />
        <KPI label="On-shelf avail." value="+2.8 pp" />
        <KPI label="Dispute TAT" value="&lt; 48h" />
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="font-semibold">Inbound Queue</div>
        <div className="grid md:grid-cols-3 gap-3">
          {seedLots.map((l) => (
            <div key={l.id} className="rounded-2xl border p-4 grid gap-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{l.crop} • {l.variety}</div>
                <ScoreChip score={l.score} />
              </div>
              <div className="flex items-center gap-3">
                <img loading="lazy" alt="" src={cropImg[l.crop]||cropImg.Grapes} width="60" height="44" className="rounded-lg"/>
                <div className="text-sm text-gray-600">{l.id} • {l.weight} kg • {l.days} days left</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-xl border" onClick={()=>navigate({ name: "ret.gatein", params: { lotId: l.id } })}>Gate-in QC</button>
                <button className="px-3 py-1 rounded-xl border" onClick={()=>navigate({ name: "ret.fasttrack", params: { lotId: l.id } })}>Fast-track</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Marketplace (Verified Lots)</div>
          <div className="text-sm flex items-center gap-2">
            <span>Sort by</span>
            <select className="border p-1 rounded-lg" value={sortKey} onChange={(e)=>setSortKey(e.target.value as any)}>
              <option value="score">Freshness Score</option>
              <option value="days">Shelf-life left</option>
              <option value="weight">Weight</option>
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {sorted.map((l) => (
            <div key={l.id} className="rounded-2xl border p-4 grid gap-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{l.crop} • {l.variety}</div>
                <ScoreChip score={l.score} />
              </div>
              <img loading="lazy" alt="" src={cropImg[l.crop]||cropImg.Grapes} width="240" height="160" className="rounded-lg"/>
              <div className="text-sm text-gray-600">{l.weight} kg • {l.days} days left</div>
              <button className="px-3 py-1 rounded-xl bg-gray-900 text-white" onClick={() => onBuy(l)}>Buy</button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-4 grid gap-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Cart</div>
          <div className="text-xs text-gray-500">Click Buy to add 100kg per click</div>
        </div>
        {cart.length === 0 ? (
          <div className="text-sm text-gray-600">Your cart is empty.</div>
        ) : (
          <div className="grid gap-3">
            {cart.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="text-sm">{it.lot.crop} • {it.lot.variety} ({it.lot.id})</div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-lg border" onClick={()=>{
                    const copy=[...cart]; copy[idx].qty=Math.max(0,copy[idx].qty-100); setCart(copy.filter(x=>x.qty>0));
                  }}>-100kg</button>
                  <div className="w-24 text-right">{it.qty} kg</div>
                  <button className="px-2 py-1 rounded-lg border" onClick={()=>{
                    const copy=[...cart]; copy[idx].qty=copy[idx].qty+100; setCart(copy);
                  }}>+100kg</button>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t mt-2 text-sm">
              <div>Total</div>
              <div>{cart.reduce((s,i)=> s + i.qty, 0)} kg</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gray-900 text-white w-max">Checkout (mock)</button>
          </div>
        )}
      </div>
    </div>
  );
}

function GateInQCPage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [tempOk, setTempOk] = useState(true);
  const [mold, setMold] = useState(false);
  const [bruising, setBruising] = useState<"None"|"Mild"|"High">("None");
  const [weightDiff, setWeightDiff] = useState(0);
  const [decision, setDecision] = useState("");
  const score = useMemo(() => {
    let s = 100; if (!tempOk) s -= 25; if (mold) s -= 30;
    if (bruising === "Mild") s -= 10; if (bruising === "High") s -= 25;
    s -= Math.max(0, Math.min(20, weightDiff/10)); return Math.max(0, Math.round(s));
  }, [tempOk, mold, bruising, weightDiff]);

  return (
    <div>
      <SubHeader title={`Gate-in QC – ${lotId || "Lot"}`} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="text-sm text-gray-600">Surface temperature within 0.5°C of SOP (3°C)?</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tempOk} onChange={(e)=>setTempOk(e.target.checked)} /> Yes</label>
          <div className="text-sm text-gray-600">Any visible mold?</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mold} onChange={(e)=>setMold(e.target.checked)} /> Yes</label>
          <div className="text-sm text-gray-600">Bruising</div>
          <select className="border p-2 rounded-xl" value={bruising} onChange={(e)=>setBruising(e.target.value as any)}>
            <option>None</option><option>Mild</option><option>High</option>
          </select>
          <div className="text-sm text-gray-600">Weight difference (kg)</div>
          <input type="number" className="border p-2 rounded-xl" value={weightDiff} onChange={(e)=>setWeightDiff(parseFloat(e.target.value)||0)}/>
          <div className="text-sm bg-gray-50 p-3 rounded-xl">QC Score: <span className="font-semibold">{score}</span> / 100</div>
          <div className="text-xs text-gray-500">Attach photos</div>
          <input type="file" multiple className="border p-2 rounded-xl"/>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={()=>setDecision("Accepted")}>Accept</button>
            <button className="px-3 py-2 rounded-xl border" onClick={()=>setDecision("Reject / Regrade")}>Reject / Regrade</button>
          </div>
          {decision && <div className="text-sm text-emerald-700">Decision recorded: {decision} (mock)</div>}
        </div>
        <div className="rounded-2xl border p-4 text-sm bg-white">
          <div className="font-semibold mb-2">Rules we check</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>SOP match for temp/humidity (3°C / 90% RH)</li>
            <li>Door-open events in last 2h</li>
            <li>Telemetry variance (ΔT spike)</li>
            <li>Visual inspection: mold, bruising, pests</li>
            <li>Weight difference vs manifest</li>
          </ul>
          <div className="mt-3 text-xs text-gray-500">If QC Score ≥ 85 and shelf-life ≥ 6 days, system flags as Fast‑track candidate.</div>
        </div>
      </div>
    </div>
  );
}

function FastTrackPage({ onBack, lotId }: { onBack: () => void; lotId?: string }) {
  const [slot, setSlot] = useState("Now (next 30m)");
  const [notify, setNotify] = useState(true);
  const [reducedQC, setReducedQC] = useState(true);
  return (
    <div>
      <SubHeader title={`Fast-track – ${lotId || "Lot"}`} onBack={onBack} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 grid gap-3 bg-white">
          <div className="text-sm text-gray-600">Priority slot</div>
          <select className="border p-2 rounded-xl" value={slot} onChange={(e)=>setSlot(e.target.value)}>
            <option>Now (next 30m)</option><option>1h window</option><option>2h window</option>
          </select>
          <div className="flex items-center gap-2 text-sm">
            <input id="nfy" type="checkbox" className="w-4 h-4" checked={notify} onChange={(e)=>setNotify(e.target.checked)}/>
            <label htmlFor="nfy">Notify shelf team & allocate bay</label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="rq" type="checkbox" className="w-4 h-4" checked={reducedQC} onChange={(e)=>setReducedQC(e.target.checked)}/>
            <label htmlFor="rq">Reduced QC (only temp & visual)</label>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white w-max">Fast-track Now (mock)</button>
        </div>
        <div className="rounded-2xl border p-4 text-sm bg-white">
          <div className="font-semibold mb-2">What fast-track does</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Creates priority token for gate & bay</li>
            <li>Reserves shelf space; pushes OOS SKUs first</li>
            <li>Sends nudges to inbound + shelf teams</li>
            <li>Records SLA & risk acknowledgement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* -------------------- APP -------------------- */
export default function App() {
  const [role, setRole] = useState<Role>("FPO");
  const [route, setRoute] = useState<Route>({ name: "home" });
  const navigate = (r: Route) => setRoute(r);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header role={role} setRole={setRole} navigate={navigate} />
      <motion.div key={`${role}-${route.name}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        {route.name === "home" && role === "FPO" && <FPOView navigate={navigate} />}
        {route.name === "home" && role === "Distributor" && <DistributorView navigate={navigate} />}
        {route.name === "home" && role === "Retailer" && <RetailerView navigate={navigate} />}

        {route.name === "fpo.pre-cool" && <PreCoolBookingPage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}
        {route.name === "fpo.find-reefer" && <FindReeferPage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}

        {route.name === "dist.build-load" && <BuildLoadPage onBack={() => navigate({ name: "home" })} lane={route.params?.lane} />}
        {route.name === "dist.nudge" && <NudgeSOPPage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}
        {route.name === "dist.reroute" && <ReroutePage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}
        {route.name === "dist.dispute" && <DisputePage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}

        {route.name === "ret.gatein" && <GateInQCPage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}
        {route.name === "ret.fasttrack" && <FastTrackPage onBack={() => navigate({ name: "home" })} lotId={route.params?.lotId} />}
      </motion.div>
    </div>
  );
}
