import EntityPage from "@/app/[table]/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const wrappedParams = Promise.resolve({
    table: "entities",
    id: resolvedParams.id
  });
  return <EntityPage params={wrappedParams} />;
}
