import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ValidationError } from "@/types/import";
import { cn } from "@/lib/utils";

interface PreviewTableProps {
  data: any[];
  errors: ValidationError[];
}

export const PreviewTable = ({ data, errors }: PreviewTableProps) => {
  if (!data || data.length === 0) {
    return <p>No hay datos para previsualizar.</p>;
  }

  const headers = Object.keys(data[0]);
  const errorsByRowAndField = errors.reduce((acc, error) => {
    const key = `${error.row}-${error.field}`;
    acc[key] = error.message;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="relative w-full overflow-auto h-96">
      <Table>
        <TableHeader className="sticky top-0 bg-white dark:bg-gray-800">
          <TableRow>
            <TableHead>Fila</TableHead>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{rowIndex + 1}</TableCell>
              {headers.map((header) => {
                const errorKey = `${rowIndex + 1}-${header}`;
                const errorMessage = errorsByRowAndField[errorKey];
                const cellValue = row[header];

                return (
                  <TableCell key={header} className={cn(errorMessage ? "bg-red-100 dark:bg-red-900/50" : "")}>
                    {errorMessage ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help block w-full h-full">{cellValue}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{errorMessage}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      cellValue
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
