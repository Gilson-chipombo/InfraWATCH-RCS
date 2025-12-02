import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/src/components/ui/table";
import { formatMs, formatPercent } from "@/config/uitl1";
import { Badge } from "@/src/components/ui/badge";
import { EyeIcon, MoveUpRightIcon, ScanEye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

export default function PingMetricsTable({ evento }: { evento: any }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[160px]">target</TableHead>
            <TableHead className="text-center w-[140px]">packets transmitted</TableHead>
            <TableHead className="text-center w-[140px]">packets received</TableHead>
            <TableHead className="text-center w-[120px]">packet loss (%)</TableHead>
            <TableHead className="text-center w-[140px]">maximum response</TableHead>
            <TableHead className="text-center w-[140px]">minimum response</TableHead>
            <TableHead className="text-center w-[140px]">average response</TableHead>
            <TableHead className="text-center w-[160px]">standard deviation</TableHead>
            <TableHead className="text-center w-[140px]">status</TableHead>
            <TableHead className="text-center w-[200px]">ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {evento
            .slice()
            .reverse()
            .map(
              (item: any, index: number) =>
                item.data?.type === "PING" && (
                  <TableRow key={index}>
                    <TableCell className="text-center">{item.data.target}</TableCell>
                    <TableCell className="text-center">{item.packets_transmitted}</TableCell>
                    <TableCell className="text-center">{item.packets_received}</TableCell>
                    <TableCell className="text-center">
                      {formatPercent(parseFloat(item.percent_packet_loss))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.maximum_response_ms))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.minimum_response_ms))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.average_response_ms))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.standard_deviation_ms))}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center w-[140px]">
                      <Badge
                        variant="outline"
                        className={`rounded-full py-1 px-5 text-white inline-flex items-center gap-2 ${
                          item.status === "UP"
                            ? "bg-green-600"
                            : item.status === "DOWN"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        <MoveUpRightIcon size={16} />
                        {item.status}
                      </Badge>
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-center w-[200px]">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon">
                          <EyeIcon />
                        </Button>

                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                              <ScanEye size={16} />
                              Ver Headers
                            </Button>
                          </SheetTrigger>

                          <SheetContent className="overflow-y-auto max-w-lg">
                            <SheetHeader>
                              <SheetTitle>Headers ICMP</SheetTitle>
                              <SheetDescription>
                                Informações detalhadas dos headers recebidos.
                              </SheetDescription>
                            </SheetHeader>

                            <Table className="mt-4">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Header</TableHead>
                                  <TableHead>Valor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(item.data || {}).map(
                                  ([key, value], i) => (
                                    <TableRow key={i} className="odd:bg-muted/50">
                                      <TableCell className="font-medium">
                                        {key}
                                      </TableCell>
                                      <TableCell className="break-all">
                                        {String(value)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </TableCell>
                  </TableRow>
                )
            )}
        </TableBody>
      </Table>
    </div>
  );
}
