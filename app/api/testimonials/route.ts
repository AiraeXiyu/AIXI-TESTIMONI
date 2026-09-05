import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER = process.env.GITHUB_OWNER || "AiraeXiyu";
const REPO = process.env.GITHUB_REPO || "AIXI-TESTIMONI";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FOLDER =
  process.env.GITHUB_TESTIMONIAL_FOLDER || "public/testimonials";

export async function GET() {
  try {
    const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}?ref=${BRANCH}`;

    const res = await fetch(api, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ items: [] });
    }

    const files = await res.json();

    const images = Array.isArray(files)
      ? files.filter(
          (f: { type?: string; name?: string }) =>
            f.type === "file" &&
            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name || "")
        )
      : [];

    images.sort(
      (a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
    );

    return NextResponse.json({
      items: images.map((f: { name: string }) => ({
        name: f.name,
        url: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FOLDER}/${encodeURIComponent(
          f.name
        )}`,
      })),
    });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

/*
  POST tidak dipakai lagi.

  Upload testimonial dilakukan langsung oleh bot
  menggunakan GITHUB_TOKEN.

  Jadi:
  - TESTIMONIAL_UPLOAD_SECRET ❌ tidak diperlukan
  - Vercel POST upload ❌ tidak diperlukan
  - GITHUB_TOKEN hanya disimpan di ENV bot ✅
*/
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Upload dilakukan langsung oleh bot ke GitHub. Endpoint POST ini tidak digunakan.",
    },
    { status: 405 }
  );
}
