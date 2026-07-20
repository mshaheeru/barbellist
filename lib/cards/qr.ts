"use client";

import QRCode from "qrcode";

export async function qrTokenToDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 200,
    color: {
      dark: "#123D28",
      light: "#FFFFFF",
    },
  });
}
