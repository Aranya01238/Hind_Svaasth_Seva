import crypto from "node:crypto";

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

const readBody = async (req) => {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const cleanEnv = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^['\"]|['\"]$/g, "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const keyId = cleanEnv(
    process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
  );
  const keySecret = cleanEnv(
    process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET,
  );

  if (!keyId || !keySecret) {
    return json(res, 500, {
      error:
        "Razorpay backend env is missing (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).",
    });
  }

  const body = await readBody(req);
  const amountPaise = Number(body.amountPaise || 100);
  const patientName = String(body.patientName || "Patient").trim();
  const hospitalName = String(body.hospitalName || body.hospitalId || "Hospital").trim();
  const doctor = String(body.doctor || "").trim();
  const date = String(body.date || "").trim();

  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return json(res, 400, { error: "Invalid amount" });
  }

  const receipt = `APT-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

  const orderPayload = {
    amount: Math.round(amountPaise),
    currency: "INR",
    receipt,
    payment_capture: 1,
    notes: {
      patient_name: patientName,
      hospital_name: hospitalName,
      doctor,
      appointment_date: date,
    },
  };

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(orderPayload),
  });

  const responseText = await response.text();
  let responseJson = {};

  if (responseText) {
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = {};
    }
  }

  if (!response.ok) {
    const apiError =
      responseJson &&
      typeof responseJson === "object" &&
      responseJson.error &&
      typeof responseJson.error === "object" &&
      responseJson.error.description
        ? String(responseJson.error.description)
        : `Razorpay order creation failed (${response.status})`;

    const authHint =
      apiError.toLowerCase() === "authentication failed"
        ? " Check runtime env: use matching TEST key id + TEST key secret in server env (no extra spaces or quotes)."
        : "";

    return json(res, response.status, { error: `${apiError}${authHint}` });
  }

  return json(res, 200, {
    ok: true,
    keyId,
    order: responseJson,
  });
}
