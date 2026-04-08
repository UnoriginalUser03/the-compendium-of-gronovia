import React from "react";
import { LightboxProvider } from "../components/Handout/LightboxProvider";

export default function Root({ children }: { children: React.ReactNode }) {
  return <LightboxProvider>{children}</LightboxProvider>;
}
