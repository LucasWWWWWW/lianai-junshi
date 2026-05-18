import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
          color: "white",
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "system-ui",
          letterSpacing: "-0.05em",
        }}
      >
        恋
      </div>
    ),
    size,
  );
}
