const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const menuToggle = $("#menuToggle"), navLinks = $("#navLinks");
menuToggle.addEventListener("click", () => menuToggle.setAttribute("aria-expanded", String(navLinks.classList.toggle("open"))));
$$("#navLinks a").forEach(a => a.addEventListener("click", () => { navLinks.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }));
$("#year").textContent = new Date().getFullYear();
const progress = $("#progress");
addEventListener("scroll", () => { const s = document.documentElement.scrollHeight - innerHeight; progress.style.width = (s > 0 ? scrollY / s * 100 : 0) + "%"; }, { passive: true });

// Theme (saved locally)
const tBtn = $("#themeToggle"), KEY = "tanishqa-portfolio-theme";
try { if (localStorage.getItem(KEY) === "dark") document.body.dataset.theme = "dark"; } catch (e) {}
function syncTheme() { const d = document.body.dataset.theme === "dark"; $(".theme-icon").textContent = d ? "☀" : "☾"; $(".theme-label").textContent = d ? "Light" : "Dark"; tBtn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); }
syncTheme();
tBtn.addEventListener("click", () => { const dark = document.body.dataset.theme !== "dark"; if (dark) document.body.dataset.theme = "dark"; else delete document.body.dataset.theme; try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch (e) {} syncTheme(); });

// DNA lab
const AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG", ORD = "TCAG";
const NAMES = { F:"Phe",L:"Leu",S:"Ser",Y:"Tyr","*":"Stop",C:"Cys",W:"Trp",P:"Pro",H:"His",Q:"Gln",R:"Arg",I:"Ile",M:"Met",T:"Thr",N:"Asn",K:"Lys",V:"Val",A:"Ala",D:"Asp",E:"Glu",G:"Gly" };
const COMP = { A:"T", T:"A", G:"C", C:"G" }, dna = $("#dna");
let prev = [];
const clean = s => s.toUpperCase().replace(/[^ATGC]/g, "");
const chips = seq => seq.split("").map(b => `<span class="b-${b}">${b}</span>`).join("");
function translate(seq) { const out = []; for (let i = 0; i + 3 <= seq.length; i += 3) { const c = [...seq.slice(i, i + 3)].map(b => ORD.indexOf(b)); out.push(AA[c[0] * 16 + c[1] * 4 + c[2]]); } return out; }
function renderDNA(changed = -1, note) {
  const seq = clean(dna.value); if (dna.value !== seq) dna.value = seq;
  $("#strandTop").innerHTML = chips(seq); $("#strandComp").innerHTML = chips(seq.split("").map(b => COMP[b]).join(""));
  const aa = translate(seq), stopAt = aa.indexOf("*"), shown = stopAt < 0 ? aa : aa.slice(0, stopAt + 1);
  $("#protein").innerHTML = shown.length ? shown.map((a, i) => `<span class="aa${a === "*" ? " stop" : ""}${i === changed ? " changed" : ""}">${NAMES[a]}</span>`).join("") : '<span class="fine">Add at least 3 bases.</span>';
  const gc = seq ? Math.round(seq.split("").filter(b => b === "G" || b === "C").length / seq.length * 100) : 0;
  $("#statLen").textContent = seq.length; $("#statGC").textContent = gc + "%"; $("#statAA").textContent = shown.filter(a => a !== "*").length;
  $("#labNote").textContent = note || (stopAt >= 0 ? "A stop codon ends the protein early." : "Each three bases make one codon, and each codon picks an amino acid.");
  prev = aa;
}
dna.addEventListener("input", () => renderDNA());
$("#randomBtn").addEventListener("click", () => { dna.value = "ATG" + Array.from({ length: 18 }, () => "ATGC"[Math.random() * 4 | 0]).join(""); renderDNA(); });
$("#mutateBtn").addEventListener("click", () => {
  const seq = clean(dna.value); if (seq.length < 3) return;
  const i = Math.random() * seq.length | 0, old = seq[i], nb = [..."ATGC"].filter(b => b !== old)[Math.random() * 3 | 0];
  dna.value = seq.slice(0, i) + nb + seq.slice(i + 1);
  const before = prev.slice(), ci = i / 3 | 0; renderDNA(ci);
  const a = before[ci], b = prev[ci];
  $("#labNote").textContent = !a ? "That base sits outside a full codon, so the protein is unchanged." : a === b ? `Base ${i + 1} changed from ${old} to ${nb}, but the amino acid stayed the same (a silent mutation).` : `Base ${i + 1} changed from ${old} to ${nb}, turning ${NAMES[a]} into ${NAMES[b]}.`;
});
renderDNA();

// Punnett square
const p1 = $("#p1"), p2 = $("#p2");
function renderCross() {
  const g1 = [...p1.value], g2 = [...p2.value], cells = [];
  g1.forEach(a => g2.forEach(b => cells.push([a, b].sort().join(""))));
  $("#square").innerHTML = cells.map(c => `<div class="cell" role="cell">${c.split("").sort((x, y) => x < y ? -1 : 1).join("") === "Aa" ? "Aa" : c}</div>`).join("");
  const n = g => cells.filter(c => c === g).length * 25, dom = n("AA") + n("Aa");
  $("#bars").innerHTML = [["AA", n("AA")], ["Aa", n("Aa")], ["aa", n("aa")]].map(([g, v]) => `<div class="bar"><span>${g}</span><div><i style="width:${v}%"></i></div><span>${v}%</span></div>`).join("");
  $("#pNote").textContent = `Each child has a ${dom}% chance of showing the dominant trait and ${100 - dom}% the recessive one.`;
}
[p1, p2].forEach(s => s.addEventListener("change", renderCross)); renderCross();

// Credential filters
$$(".filters button").forEach(btn => btn.addEventListener("click", () => {
  $$(".filters button").forEach(b => b.classList.toggle("on", b === btn));
  $$("#creds li").forEach(li => li.hidden = btn.dataset.f !== "all" && li.dataset.t !== btn.dataset.f);
}));

// Interest tabs
const INTERESTS = [
  ["Computational genetics", "Exploring how computational methods can help analyse genetic information and biological patterns."],
  ["Bioinformatics", "Developing an understanding of biological data analysis, sequence-based workflows and reproducible research."],
  ["AI in healthcare and biotechnology", "Learning where machine learning and intelligent tools can support research, interpretation and decision-making."],
  ["Research and collaboration", "Looking forward to learning from faculty, researchers and interdisciplinary teams through future projects and opportunities."]];
function showInterest(i) { $$(".tabs button").forEach((b, j) => { b.classList.toggle("on", i === j); b.setAttribute("aria-selected", String(i === j)); }); const [h, p] = INTERESTS[i]; $("#panel").innerHTML = `<h3>${h}</h3><p>${p}</p>`; }
$$(".tabs button").forEach(b => b.addEventListener("click", () => showInterest(+b.dataset.i))); showInterest(0);