import { HttpWatch } from "@/src/types/interfaces";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { formatBytes, formatMs } from "@/config/uitl1";
import { Badge } from "@/src/components/ui/badge";
import { EyeIcon, MoveUpRightIcon, ScanEye } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function HttpMetricsTable({ evento }: { evento: any }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="h-[50px]">
          <TableRow className="font-bold hover:bg-transparent">
            <TableHead className="w-[160px] text-center">ip</TableHead>
            <TableHead className="w-[120px] text-center">sizeBytes</TableHead>
            <TableHead className="w-[120px] text-center">dnsMs</TableHead>
            <TableHead className="w-[120px] text-center">totalMs</TableHead>
            <TableHead className="w-[120px] text-center">httpStatus</TableHead>
            <TableHead className="w-[140px] text-center">status</TableHead>
            <TableHead className="w-[200px] text-center">ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {evento
            .slice()
            .reverse()
            .map(
              (item: any, index: any) =>
                item.data?.type === "HTTP" && (
                  <TableRow key={index}>
                    <TableCell className="text-center">{item.ip}</TableCell>
                    <TableCell className="text-center">
                      {formatBytes(parseFloat(item.sizeBytes))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.dnsMs))}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatMs(parseFloat(item.totalMs))}
                    </TableCell>
                    <TableCell
                      className={`text-center font-semibold ${
                        item.httpStatus >= 200 && item.httpStatus < 300
                          ? "text-green-600"
                          : item.httpStatus >= 400 && item.httpStatus < 500
                          ? "text-yellow-600"
                          : item.httpStatus >= 500 && item.httpStatus < 600
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {item.httpStatus}
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
                              <SheetTitle>Headers HTTP</SheetTitle>
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
                                {Object.entries(item.data || {}).map(([key, value], i) => (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell className="break-all">
                                      {String(value)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {Object.entries(item.data.headers || {}).map(([key, value], i) => (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell className="break-all">
                                      {String(value)}
                                    </TableCell>
                                  </TableRow>
                                ))}
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
