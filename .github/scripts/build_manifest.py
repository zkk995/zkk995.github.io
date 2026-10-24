import json, re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
papers_dir = root / "papers"
out = []
for f in sorted(papers_dir.glob("*.html")):
    text = f.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r"<title>([^<]+)", text)
    title = m.group(1).strip() if m else f.stem
    a = (re.search(r"arxiv\.org/abs/([0-9.]+)", text, re.I)
         or re.search(r"arXiv:\s*([0-9.]+)", text))
    out.append({"file": f"papers/{f.name}", "title": title, "arxiv": a.group(1) if a else ""})

manifest = {"updated": __import__("datetime").date.today().isoformat(), "papers": out}
(root / "papers-manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(manifest, ensure_ascii=False))
