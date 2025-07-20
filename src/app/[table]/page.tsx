import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ListPage({ params }: { params: { table: string } }) {
  const table = params.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return <div>Table not found</div>;

  let select = "*";
  config.fields.forEach((field) => {
    if (field.type === "fk") {
      select += `, ${field.refTable}!${field.name}(${field.displayField} as ${field.name}_display)`;
    }
  });

  const { data, error } = await supabase.from(table).select(select);

  if (error) return <div>Error: {error.message}</div>;

  const columns = [{ name: "id", label: "ID" }, ...config.fields];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>{config.label}</h1>
        <Button asChild>
          <Link href={`/${table}/new`}>Create New</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => <TableHead key={col.name}>{col.label || col.name}</TableHead>)}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.name}>
                  {col.type === "fk" ? row[`${col.name}_display`] : row[col.name as keyof typeof row]}
                </TableCell>
              ))}
              <TableCell>
                <Button variant="outline" asChild>
                  <Link href={`/${table}/${row.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}