import LegalShell from "@/components/legal/LegalShell";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LegalShell>{children}</LegalShell>;
}