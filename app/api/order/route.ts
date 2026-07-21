import { NextResponse } from "next/server";


const RECIPIENT =
  process.env.ORDER_RECIPIENT_EMAIL ?? "mshaheeruddin19757@gmail.com";

type OrderPayload = {
  name?: string;
  email?: string;
  phone?: string;
  gymName?: string;
  city?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: OrderPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 },
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const gymName = body.gymName?.trim() || "Not provided";
  const city = body.city?.trim() || "Not provided";
  const message = body.message?.trim() || "Not provided";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        gym_name: gymName,
        city,
        message,
        _subject: "New Barbellist order request",
        _template: "table",
        _captcha: "false",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not send your request. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send your request. Please try again." },
      { status: 500 },
    );
  }
}
