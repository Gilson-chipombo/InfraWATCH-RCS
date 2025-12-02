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
import { ScanEye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { SnmpWatch } from "@/src/types/interfaces";

export default function SnmpMetricsTable({ evento }: { evento: SnmpWatch[] }) {
  return (
    <Table className="h-full">
      <TableHeader className="h-[50px]">
        <TableRow className="font-bold hover:bg-transparent">
          <TableHead className="pl-7">sysName</TableHead>
          <TableHead className="pl-7">Vendor</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>sysDescr</TableHead>
          <TableHead>sysUpTime</TableHead>
          <TableHead>CPU (5min)</TableHead>
          <TableHead>Mem Free</TableHead>
          <TableHead>Mem Total</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="overflow-auto">
        {evento
          .slice() // cria uma cópia
          .reverse() // inverte para ordem decrescente
          .map((item, index) => item.data.type === "SNMP" ? (
            <TableRow key={index}>
              <TableCell className="pl-7">{item.data.sysName}</TableCell>
              <TableCell className="pl-7">{item.data.vendor}</TableCell>
              <TableCell>{item.data.timestamp}</TableCell>
              <TableCell>{item.data.ip}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.data.metrics.sysDescr}
              </TableCell>
              <TableCell>{item.data.metrics.sysUpTime}</TableCell>
              <TableCell>{item.data.metrics.cpuLoad5min}</TableCell>
              <TableCell>{item.data.metrics.memFree}</TableCell>
              <TableCell>{item.data.metrics.memTotal}</TableCell>

              <TableCell>
                <Sheet>
                  <SheetTrigger>
                    <Button variant="outline" className="flex gap-2 items-center">
                      <ScanEye className="w-4 h-4" />
                      Ver interfaces
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Interfaces SNMP</SheetTitle>
                      <SheetDescription>
                        Lista de interfaces coletadas via SNMP.
                      </SheetDescription>
                    </SheetHeader>

                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Oper</TableHead>
                          <TableHead>MAC</TableHead>
                          <TableHead>Speed</TableHead>
                          <TableHead>In</TableHead>
                          <TableHead>Out</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.data.interfaces.map((iface, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{iface.name}</TableCell>
                            <TableCell>{iface.type}</TableCell>
                            <TableCell>{iface.adminStatus}</TableCell>
                            <TableCell>{iface.operStatus}</TableCell>
                            <TableCell>{iface.mac}</TableCell>
                            <TableCell>{iface.speed}</TableCell>
                            <TableCell>{iface.inOctets}</TableCell>
                            <TableCell>{iface.outOctets}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ) : null
          )}
      </TableBody>
    </Table>
  );
}
