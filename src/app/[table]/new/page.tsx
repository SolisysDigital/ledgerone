import { supabase } from "@/lib/supabase";
import { tableConfigs } from "@/lib/tableConfigs";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui//button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
//import { Combobox } from "@/components/ui/combobox"; // Assume you have a Combobox component, or use shadcn's
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

// Server action
export async function createItem(table: string, data: any) {
  "use server";
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
  return redirect(`/${table}`);
}

// Note: This is a client component because of useForm
export default function CreatePage({ params }: { params: { table: string } }) {
  const table = params.table;
  const config = tableConfigs[table as keyof typeof tableConfigs];
  if (!config) return <div>Table not found</div>;

  const searchParams = useSearchParams();
  const prefill = {};
  const fk = searchParams.get("fk");
  const fkField = searchParams.get("fkField");
  if (fk && fkField) {
    prefill[fkField] = fk;
  }

  const formSchema = z.object(
    config.fields.reduce((acc, field) => {
      acc[field.name] = z.any(); // Simplify, add validations as needed
      return acc;
    }, {} as any)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: prefill,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) {
    await createItem(table, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create {config.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {config.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.name}</FormLabel>
                    <FormControl>
                      {field.type === "text" && <Input {...formField} />}
                      {field.type === "textarea" && <Textarea {...formField} />}
                      {field.type === "number" && <Input type="number" {...formField} />}
                      {field.type === "date" && <Input type="date" {...formField} />} {/* Use DatePicker for better UX */}
                      {field.type === "select" && (
                        <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type === "fk" && <FkCombobox field={field} formField={formField} />}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Example FkCombobox component (you need to implement or use shadcn combobox)
function FkCombobox({ field, formField }: { field: FieldConfig; formField: any }) {
  // Fetch options from supabase using useEffect or suspense, but since client, yes.
  // For brevity, assume implementation that fetches `id, displayField` from refTable
  // and uses Combobox with search.
  // Placeholder:
  return <Combobox {...formField} options={[]} />; // Implement fetching
}