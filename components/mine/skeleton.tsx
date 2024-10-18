import { useScreenSize } from '@/app/hooks/screen-size';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function TableSkeleton({
  columns,
  rows,
}: {
  rows: number;
  columns: number;
}) {
  const { isSm } = useScreenSize();

  if (isSm) {
    return (
      <Card className="my-4 overflow-hidden rounded-xl">
        <Table>
          <TableBody>
            {Array.from(Array(rows).keys()).map((i) => (
              <TableRow className="grid grid-cols-1 gap-1 p-6" key={i}>
                {Array.from(Array(columns).keys()).map((j) => (
                  <TableCell
                    className="grid gap-1 border-b px-0 last:border-none md:block md:border-none"
                    key={j}
                  >
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Card className="my-4 overflow-hidden rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="p-5">
            {Array.from(Array(columns).keys()).map((i) => (
              <TableHead key={i}>
                <Skeleton className="h-6 w-full rounded-lg" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(Array(rows).keys()).map((i) => (
            <TableRow className="p-5" key={i}>
              {Array.from(Array(columns).keys()).map((j) => (
                <TableCell key={j}>
                  <Skeleton className="h-6 w-full rounded-lg" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
