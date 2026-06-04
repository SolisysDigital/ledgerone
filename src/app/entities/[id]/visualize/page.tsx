import VisualizePage from "@/app/[table]/[id]/visualize/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <VisualizePage table="entities" id={resolvedParams.id} />;
}
