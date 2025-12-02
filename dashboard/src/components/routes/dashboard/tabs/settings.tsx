"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  User,
} from "lucide-react";
import SSH_gen from "../../../../app/(front-end)/(private)/ssh/ssh_gen";

const menuItems = [
  { label: "Information", icon: User },
  { label: "SSH Key", icon: Key },
  { label: "Notifications", icon: Bell },
];

export default function Settings() {
  const [activeItem, setActiveItem] = useState("Information");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold tracking-wide text-foreground flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            SETTINGS
          </h2>
        </div>

        {/* Menu */}
        <ul className="flex-1 p-4 space-y-3 text-sm">
          {menuItems.map(({ label, icon: Icon }) => (
            <li
              key={label}
              onClick={() => setActiveItem(label)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition ${
                activeItem === label
                  ? "bg-muted text-foreground font-medium border-l-4 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {activeItem === "SSH Key" ? (
          <SSH_gen /> // 👉 ocupa todo o painel
        ) : (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-foreground">
              {activeItem} settings
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
