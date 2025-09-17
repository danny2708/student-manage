"use client";

import { Providers } from "../src/contexts/Providers";

export default function App({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
