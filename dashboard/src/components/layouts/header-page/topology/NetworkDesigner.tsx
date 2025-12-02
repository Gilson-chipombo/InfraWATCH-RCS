"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Download, Network, Play, Save, Spline, SplinePointer, SquareTerminal, Upload } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/src/components/ui/resizable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { ConnectionTerm } from "./terminal/connection";
import { isValidIPv4, uid } from "./helper/functions";
import {
  COLOR_CLASSES,
  ConnectionTypes,
  DEVICE_KINDS,
  OperatingSystems,
  ServerType,
  serviceOptions,
  SystemO,
} from "./helper/deviceConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import ReactSelect from "react-select";
import { getTopology, listTopologies, saveJSON } from "@/src/actions/motatios/Topologies";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";

type Device = {
  id: string;
  type: string;
  x: number;
  y: number;
  name: string;
  ip: string;
  connectionType?: string;
  os?: string;
  services?: any[];
};

type Link = {
  id: string;
  fromId: string;
  toId: string;
};

type Point = {
  x: number;
  y: number;
};

type HistoryState = {
  devices: Device[];
  links: Link[];
};

export default function NetworkDesigner() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [topology, setTopology] = useState<string>()
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [name, setName] = useState("")
  const [isDirty, setDirty] = useState(false);
  const { theme } = useTheme();

  const { isLoading, error, data: topologiesJONS } = useQuery({
    queryKey: ["topologies"],
    queryFn: listTopologies,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    draggingId: null as string | null,
    offsetX: 0,
    offsetY: 0,
  });

  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || null,
    [devices, selectedId]
  );

  const pushHistory = useCallback(() => {
    const current = { devices, links };
    if (
      history.length === 0 ||
      JSON.stringify(history[history.length - 1]) !== JSON.stringify(current)
    ) {
      setHistory((h) => [...h, current]);
      setFuture([]);
    }
  }, [devices, links, history]);

  const updateDevice = useCallback(
    (id: string, updates: Partial<Device>) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const undo = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setFuture((f) => [{ devices, links }, ...f]);
      setHistory((h) => h.slice(0, -1));
      setDevices(prev.devices);
      setLinks(prev.links);
      setSelectedId(null);
    }
  }, [history, devices, links]);

  const redo = useCallback(() => {
    if (future.length > 0) {
      const next = future[0];
      setFuture((f) => f.slice(1));
      setHistory((h) => [...h, { devices, links }]);
      setDevices(next.devices);
      setLinks(next.links);
      setSelectedId(null);
    }
  }, [future, devices, links]);

  const toCanvasCoords = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    return { x, y };
  }, [zoom]);

  const snap = useCallback((value: number, step = 16) =>
    snapToGrid ? Math.round(value / step) * step : value,
    [snapToGrid]
  );

  const onPaletteDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/x-device", JSON.stringify({ type }));
    e.dataTransfer.effectAllowed = "copy";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/x-device");
    if (!payload) return;

    const { type } = JSON.parse(payload);
    const { x, y } = toCanvasCoords(e.clientX, e.clientY);
    const id = uid("dev");
    const kind = DEVICE_KINDS[type];
    const name = `${kind.label} ${devices.filter((d) => d.type === type).length + 1}`;

    const newDev: Device = {
      id,
      type,
      x: snap(x - 40),
      y: snap(y - 24),
      name,
      ip: "",
    };

    pushHistory();
    setDevices((prev) => [...prev, newDev]);
    setSelectedId(id);
  }, [devices, pushHistory, snap, toCanvasCoords]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const startDrag = useCallback((e: React.MouseEvent, dev: Device) => {
    e.stopPropagation();
    const node = e.currentTarget as HTMLElement;
    const rect = node.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / zoom;
    const offsetY = (e.clientY - rect.top) / zoom;
    dragState.current = { draggingId: dev.id, offsetX, offsetY };
  }, [zoom]);

  const onDeviceClick = useCallback((dev: Device) => {
    if (!linkMode) {
      setSelectedId(dev.id);
      return;
    }

    if (!pendingFrom) {
      setPendingFrom(dev.id);
      return;
    }

    if (pendingFrom === dev.id) {
      setPendingFrom(null);
      return;
    }

    const alreadyExists = links.some(
      (l) =>
        (l.fromId === pendingFrom && l.toId === dev.id) ||
        (l.fromId === dev.id && l.toId === pendingFrom)
    );

    if (!alreadyExists) {
      pushHistory();
      setLinks((prev) => [
        ...prev,
        { id: uid("lnk"), fromId: pendingFrom, toId: dev.id },
      ]);
    }
    setPendingFrom(null);
  }, [linkMode, links, pendingFrom, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    pushHistory();
    setDevices((prev) => prev.filter((d) => d.id !== selected.id));
    setLinks((prev) =>
      prev.filter((l) => l.fromId !== selected.id && l.toId !== selected.id)
    );
    setSelectedId(null);
  }, [pushHistory, selected]);

  const deleteLink = useCallback((linkId: string) => {
    pushHistory();
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, [pushHistory]);

  const saveTopology = async () => {
    const data = {
      devices,
      links,
      meta: { v: 1, createdAt: new Date().toISOString() },
    };

    if (!name) return;

    const ok = await saveJSON(data, `${name}.json`);

    if (ok) {
      toast("Topologia salva com sucesso");
      revalidateTag("topologies")
    } else {
      toast("Erro ao salvar a topologia");
    }
  };

  const exportJSON = useCallback(() => {
    const data = {
      devices,
      links,
      meta: { v: 1, createdAt: new Date().toISOString() },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topology_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [devices, links]);

  const handleTopology = useCallback( async (topology: string) => {
    try {
      const data = await getTopology(topology)
      setTopology(topology);
      if (Array.isArray(data.devices) && Array.isArray(data.links)) {
        pushHistory();
        setDevices(data.devices);
        setLinks(data.links);
        setSelectedId(null);
      } else {
        alert("Invalid file format.");
      }
    } catch (e) {
      alert("Error reading JSON file.");
    }
  }, [])

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data.devices) && Array.isArray(data.links)) {
          pushHistory();
          setDevices(data.devices);
          setLinks(data.links);
          setSelectedId(null);
        } else {
          alert("Invalid file format.");
        }
      } catch (e) {
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
  }, [pushHistory]);


  const zoomIn = useCallback(() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2))), []);
  const resetView = useCallback(() => setZoom(1), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { draggingId, offsetX, offsetY } = dragState.current;
      if (!draggingId) return;

      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      setDevices((prev) =>
        prev.map((d) =>
          d.id === draggingId
            ? { ...d, x: snap(x - offsetX), y: snap(y - offsetY) }
            : d
        )
      );
    };

    const onUp = () => {
      if (dragState.current.draggingId) {
        pushHistory();
      }
      dragState.current.draggingId = null;
    };

    const onLeave = () => {
      if (dragState.current.draggingId) {
        pushHistory();
      }
      dragState.current.draggingId = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomAmount = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => Math.min(Math.max(prev + zoomAmount, 0.2), 3));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "=":
          case "+":
            e.preventDefault();
            setZoom((prev) => Math.min(prev + 0.1, 3));
            break;
          case "-":
            e.preventDefault();
            setZoom((prev) => Math.max(prev - 0.1, 0.2));
            break;
          case "0":
            e.preventDefault();
            setZoom(1);
            break;
          case "z":
            e.preventDefault();
            undo();
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [snapToGrid, zoom, devices, links, history, future, pushHistory, snap, toCanvasCoords, undo, redo]);

  const gridBg = snapToGrid
    ? {
      backgroundImage:
        "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
      backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
    }
    : {};

  // Handle input changes without losing focus
  const handleInputChange = useCallback((field: keyof Device, value: string) => {
    if (selected) {
      updateDevice(selected.id, { [field]: value });
    }
  }, [selected, updateDevice]);

  return (
    <div className="h-screen border-t-1">
      <div className="h-[50px] border-b bg-sidebar overflow-auto px-5 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(topologiesJONS && topologiesJONS?.length > 0) ? topologiesJONS.map((item, index) => (
            <Button key={index} variant="outline" className={`px-6 rounded-full ${topology == item && "border-2" }`} onClick={() => handleTopology(item)}>
              {item.replace(".json", "")}
            </Button>
          )) : (
            <span className="text-muted">
              Sem nenhuma topologia
            </span>
          )}

        </div>
        <div className="flex gap-3 items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Save className="mr-2" />
                Salvar topologia
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Salvar topologia</AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-3">
                  <Label htmlFor="topologyName">Nome da topologia</Label>
                  <Input
                    id="topologyName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: RedePrincipal"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={saveTopology}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="lg">
            <Play />
            <span>Validate</span>
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-[calc(100%-50px)] flex bg-sidebar"
      >
        {/* Sidebar */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={30} className="p-3 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Devices</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DEVICE_KINDS).map(([type, kind]: any) => {
                const colors = COLOR_CLASSES[kind.color];
                return (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        draggable
                        onDragStart={(e) => onPaletteDragStart(e, type)}
                        className={`${colors.border} border-2`}
                      >
                        <kind.icon className={`w-5 h-5 ${colors.text}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{kind.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Tools</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkMode((v) => !v);
                    setPendingFrom(null);
                  }}
                  size="icon"
                  className={`${linkMode ? "bg-chart-1" : "bg-chart-1"} rounded-sm`}
                  title="Link mode (click two devices)"
                >
                  {linkMode ? <Spline /> : <SplinePointer />}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportJSON} className="rounded-sm">
                    <Download />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="">
                  <p>Exportar</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-sm"
                    onClick={() => document.getElementById("upload")?.click()}
                  >
                    <Upload />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="">
                  <p>Importar</p>
                </TooltipContent>
              </Tooltip>
              <input
                type="file"
                id="upload"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files && importJSON(e.target.files[0])}
              />
            </div>

            <h3 className="text-sm font-medium">View</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={zoomOut} variant="outline" className="rounded-full" size="icon">
                -
              </Button>
              <Button onClick={resetView} variant="outline" className="rounded-full" size="default">
                100%
              </Button>
              <Button onClick={zoomIn} variant="outline" className="rounded-full" size="icon">
                +
              </Button>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
              />
              Snap to grid
            </label>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Topology</h3>
              <p className="text-xs">
                Devices: {devices.length} • Links: {links.length}
              </p>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Canvas */}
        <ResizablePanel defaultSize={60} minSize={50} className="flex-1 flex justify-center items-center relative overflow-auto">
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={() => setSelectedId(null)}
            className="w-full h-full relative overflow-auto"
            style={{
              transform: `scale(${zoom})`,
              ...gridBg,
            }}
          >
            {/* SVG layer for links */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((link) => {
                const fromDevice = devices.find((d) => d.id === link.fromId);
                const toDevice = devices.find((d) => d.id === link.toId);
                if (!fromDevice || !toDevice) return null;

                const ax = fromDevice.x + 48;
                const ay = fromDevice.y + 28;
                const bx = toDevice.x + 48;
                const by = toDevice.y + 28;
                const midx = (ax + bx) / 2;
                const midy = (ay + by) / 2;

                return (
                  <g key={link.id}>
                    <path
                      d={`M ${ax} ${ay} Q ${midx} ${midy} ${bx} ${by}`}
                      stroke={theme === "dark" ? "#ddd" : "#0f172a"}
                      strokeWidth="2"
                      fill="none"
                    />
                    <rect
                      x={midx - 10}
                      y={midy - 10}
                      width={20}
                      height={20}
                      className="cursor-pointer pointer-events-auto"
                      fill="transparent"
                      onClick={() => deleteLink(link.id)}
                    />
                    <circle
                      cx={midx}
                      cy={midy}
                      r={4}
                      fill="#64748b"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Devices */}
            {devices.map((device, index) => {
              const kind = DEVICE_KINDS[device.type];
              const colors = COLOR_CLASSES[kind.color];
              const isSelected = selectedId === device.id;

              return (
                <Tooltip key={`${device.id}-${index}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute select-none ${isSelected ? `ring-2 ${colors.ring}` : "ring-1 ring-border"
                        } rounded-md shadow bg-card `}
                      style={{ left: device.x, top: device.y }}
                      onMouseDown={(e) => startDrag(e, device)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeviceClick(device);
                      }}
                    >
                      <div className="flex items-center gap-2 p-2">
                        <div className={`${colors.bg} rounded-xl p-1.5`}>
                          <kind.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="leading-tight flex flex-col gap-1">
                          <div className="text-xs font-semibold truncate">
                            {device.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {device.ip || "—"}
                          </div>
                          {device.services && (
                            <div className="flex gap-1 absolute -top-7 left-0">
                              {device.services?.map((item, index) => (
                                <Badge key={index} variant="outline">
                                  {item.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="">
                    <div className="flex flex-col">
                      {device.type && <span>Type: <b>{device.type.toLocaleUpperCase()}</b></span>}
                      {device.connectionType && <span>Connection: <b>{device.connectionType}</b></span>}
                      {device.ip && <span>IP: <b>{device.ip}</b></span>}
                      {device.services && <span>Serviços: <b>{device.services?.map((item) => (` | ${item.value}`))}</b></span>}
                      {device.os && <span>os: <b>{device.os}</b></span>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Pending link indicator */}
            {linkMode && pendingFrom && (
              <div className="absolute bottom-2 left-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded-md shadow">
                Selected: {devices.find((d) => d.id === pendingFrom)?.name} —
                click another device
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Inspector - Now integrated directly */}
        <ResizablePanel defaultSize={15} minSize={15} maxSize={25} className="w-80 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Properties</h2>
            {selected && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SquareTerminal />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="contain-content bg-black w-auto sm:max-w-full">
                    <ConnectionTerm ip={selected.ip} />
                    <AlertDialogFooter className="z-30">
                      <AlertDialogCancel>Close Terminal</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Inspector Content */}
          {!selected ? (
            <p className="text-sm">Select a device to edit.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs">Type</label>
                <div className="text-sm font-medium">
                  {DEVICE_KINDS[selected.type].label}
                </div>
              </div>

              <div>
                <label className="text-xs">Name</label>
                <Input
                  value={selected.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={pushHistory}
                />
              </div>

              <div>
                <label className="text-xs">Connection Type</label>
                <Select
                  value={selected.connectionType}
                  onValueChange={(val) => updateDevice(selected.id, { connectionType: val })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Connection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Connection</SelectLabel>
                      {ConnectionTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs">IPv4</label>
                <Input
                  placeholder="e.g., 192.168.1.1"
                  value={selected.ip}
                  className={`w-full mt-1 px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 ${selected.ip && !isValidIPv4(selected.ip)
                    ? "border-red-400 focus:ring-red-300"
                    : "focus:ring-emerald-400"
                    }`}
                  onChange={(e) => handleInputChange('ip', e.target.value)}
                  onBlur={pushHistory}
                />
                {selected.ip && !isValidIPv4(selected.ip) && (
                  <p className="text-xs text-red-500 mt-1">
                    Invalid IPv4. Use format 0-255.0-255.0-255.0-255.
                  </p>
                )}
              </div>

              {SystemO.includes(DEVICE_KINDS[selected.type].label) && (
                <div>
                  <label className="text-xs">Operating System</label>
                  <Select
                    value={selected.os}
                    onValueChange={(val) => updateDevice(selected.id, { os: val })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Systems</SelectLabel>
                        {OperatingSystems.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {ServerType.includes(DEVICE_KINDS[selected.type].label) && (
                <div>
                  <label className="text-xs">Services</label>
                  <ReactSelect
                    isMulti
                    options={serviceOptions}
                    value={selected.services}
                    onChange={(val) => updateDevice(selected.id, { services: val || [] })}
                    placeholder="Select services..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={deleteSelected} variant="destructive">
                  Delete Device
                </Button>
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}