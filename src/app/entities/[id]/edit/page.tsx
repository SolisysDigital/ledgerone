import EditPage from "@/app/[table]/[id]/edit/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const wrappedParams = Promise.resolve({
    table: "entities",
    id: resolvedParams.id
  });
  return <EditPage params={wrappedParams} />;
}
