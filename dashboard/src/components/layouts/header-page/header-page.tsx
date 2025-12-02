"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, KeyRound, Network, Terminal } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";

import { NavUser } from "./nav-page";
import { ModeToggle } from "../toggleTheme";
import { ModeLanguage } from "../language";
import { useAuth } from "@/src/hooks/useAuth";
import { listServices } from "@/src/actions/querys/listServices";
import { useIsMobile } from "@/src/hooks/use-mobile";
import Loading from "../Loading";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/providers/LanguageProvider";

interface MenuItem {
  label: string;
  href?: string;
}

interface PopoverItem {
  id: string;
  label: string;
  value: string;
  dbType?: string | null;
}

interface HeaderPageProps {
  className?: string;
  menuNav?: MenuItem[];
  popoverDefault?: PopoverItem | null;
}

function getServiceIcon(type: string, dbType?: string | null) {
  if (type === "database") {
    return dbType === "postgres" ? (
      <i className="bx bxl-postgresql text-xl mr-2" />
    ) : (
      <i className="bx bxs-data text-xl mr-2" />
    );
  }
  if (type === "web-service") return <i className="bx bx-server text-xl mr-2" />;
  if (type === "computer") return <i className="bx bx-desktop text-xl mr-2" />;
  if (type === "container") return <i className="bx bxl-docker text-xl mr-2" />;
  return <i className="bx bx-cube text-xl mr-2" />;
}

export default function HeaderPage({
  className,
  menuNav,
  popoverDefault,
}: HeaderPageProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { isPending, error, data: service } = useQuery<any>({
    queryKey: ["listServices"],
    queryFn: listServices,
  });

  const router = useRouter();
  const isMobile = useIsMobile();
  const {language: t} = useLanguage();

  if (isPending) return <Loading />;
  if (error) return <span>Erro ao buscar serviços: {error.message}</span>;

  return (
    <header className={cn("bg-card m-0 h-[70px]", className)}>
      <div className="flex justify-between items-center h-full px-4 sm:px-8">
        {/* LOGO + NAVEGAÇÃO */}
        <div className="flex items-center gap-6">
          {/* LOGO */}
          <div
            className="flex items-center gap-3 pr-5 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="logo"
              className="brightness-1 contrast-75 dark:brightness-[10]"
            />
            {!isMobile && <h1 className="font-semibold">InfraWatch</h1>}
          </div>

          {/* POPUP DE SERVIÇOS + BREADCRUMB */}
          {!isMobile && (
            <div className="flex items-center gap-6">
              {/* SELECT DE SERVIÇO */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex justify-between"
                  >
                    {popoverDefault
                      ? getServiceIcon(popoverDefault.value, popoverDefault.dbType)
                      : getServiceIcon("default")}
                    {popoverDefault ? popoverDefault.label : t.Dashboard.overview.text.services}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder={`${t.Dashboard.overview.text.services}...`} className="h-9" />
                    <CommandList>
                      <CommandEmpty>{t.Dashboard.overview.text.no_services}</CommandEmpty>
                      <CommandGroup heading="Meus Serviços" >
                        {service && service.length > 0 ? (
                          service.map((s: any) => (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => {
                                setOpen(false);
                                router.push(
                                  `/${s.type}/${s.id}?service=${s.name}${
                                    s.dbType ? `&dbType=${s.dbType}` : ""
                                  }`
                                );
                              }}
                            >
                              {s.name}
                              <span className="ml-auto">
                                {getServiceIcon(s.type, s.dbType)}
                              </span>
                            </CommandItem>
                          ))
                        ) : (
                          <p className="p-2 text-sm text-muted-foreground">
                            {t.Dashboard.overview.text.no_services}
                          </p>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* BREADCRUMB */}
              {menuNav && menuNav.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {menuNav.map((item, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {item.href ? (
                            <BreadcrumbLink
                              className="cursor-pointer"
                              onClick={() => router.push(item.href!)}
                            >
                              {item.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < menuNav.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
          )}
        </div>

        {/* AÇÕES DO HEADER */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ModeLanguage />
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/topology")}
          >
            <Network />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/terminal")}
            >
            <Terminal />
          </Button>

          {user && (
            <NavUser
              user={{
                name: user.name as string,
                avatar: user.image as string,
                email: user.email as string,
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
