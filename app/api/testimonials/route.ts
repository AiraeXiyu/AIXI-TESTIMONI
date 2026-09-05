import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER = process.env.GITHUB_OWNER || "AiraeXiyu";
const REPO = process.env.GITHUB_REPO || "AIXI-TESTIMONI";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FOLDER = process.env.GITHUB_TESTIMONIAL_FOLDER || "testimonials";

export async function GET() {
  const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}?ref=${BRANCH}`;
  const res = await fetch(api, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
  if (!res.ok) return NextResponse.json({ items: [] }, { status: 200 });
  const files = await res.json();
  const images = Array.isArray(files) ? files.filter((f: {type?:string;name?:string}) => f.type === "file" && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name || "")) : [];
  images.sort((a: {name:string}, b: {name:string}) => a.name.localeCompare(b.name, undefined, {numeric:true, sensitivity:"base"}));
  return NextResponse.json({ items: images.map((f: {name:string}) => ({ name:f.name, url:`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FOLDER}/${encodeURIComponent(f.name)}` })) });
}

export async function POST(req: Request) {
  const secret = process.env.TESTIMONIAL_UPLOAD_SECRET;
  const token = req.headers.get("x-testimonial-secret");
  const githubToken = process.env.GITHUB_TOKEN;
  if (!secret || token !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!githubToken) return NextResponse.json({ error: "GITHUB_TOKEN belum diset" }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Field file wajib diisi" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File maksimal 8MB" }, { status: 400 });
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return NextResponse.json({ error: "Format gambar tidak didukung" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const stamp = Date.now();
  const clean = (file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || `testimoni.${ext}`);
  const name = `${String(stamp)}-${clean}`;
  const content = Buffer.from(await file.arrayBuffer()).toString("base64");
  const path = `${FOLDER}/${name}`;
  const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(api, {
    method: "PUT",
    headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ message: `testimoni: ${name}`, content, branch: BRANCH })
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.message || "Gagal upload ke GitHub" }, { status: 500 });
  return NextResponse.json({ ok: true, name, url: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FOLDER}/${encodeURIComponent(name)}` });
}
