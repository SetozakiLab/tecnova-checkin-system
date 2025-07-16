import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date-utils";
import { CheckinRecord } from "@/types/api";

interface HistoryTableProps {
  records: CheckinRecord[];
}

export function HistoryTable({ records }: HistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">データがありません</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ゲスト名</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>チェックイン</TableHead>
          <TableHead>チェックアウト</TableHead>
          <TableHead>滞在時間</TableHead>
          <TableHead>状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">{record.guestName}</TableCell>
            <TableCell>{record.guestDisplayId}</TableCell>
            <TableCell>{formatDateTime(record.checkinAt)}</TableCell>
            <TableCell>
              {record.checkoutAt ? formatDateTime(record.checkoutAt) : "-"}
            </TableCell>
            <TableCell>
              {record.duration ? `${record.duration}分` : "-"}
            </TableCell>
            <TableCell>
              <StatusBadge isActive={!!record.isActive} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
