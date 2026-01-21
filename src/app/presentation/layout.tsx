export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Presentation mode uses full screen, no sidebar
  return <>{children}</>;
}
