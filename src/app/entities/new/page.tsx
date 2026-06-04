import CreatePage from "@/app/[table]/new/page";

interface PageProps {
  searchParams: Promise<{ fk?: string; fkField?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const wrappedParams = Promise.resolve({
    table: "entities"
  });
  return <CreatePage params={wrappedParams} searchParams={searchParams} />;
}
