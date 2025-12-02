'use client'

import { ComputerInfo } from "@/src/types/computer";

export default function Network({ serviceServer }: { serviceServer: ComputerInfo }) {
    return (
        <div>
            {serviceServer?.network?.length ? (
                serviceServer.network.map((net, index) => (
                    <div key={index} className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Interface: {net.name || "N/A"}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {net.addresses?.map((addr, addrIndex) => (
                                <div key={addrIndex} className="p-4 border rounded-md bg-secondary/50">
                                    <p><strong>Address:</strong> {addr.address || "N/A"}</p>
                                    <p><strong>Family:</strong> {addr.family || "N/A"}</p>
                                    <p><strong>MAC:</strong> {addr.mac || "N/A"}</p>
                                    <p><strong>Netmask:</strong> {addr.netmask || "N/A"}</p>
                                    <p><strong>CIDR:</strong> {addr.cidr || "N/A"}</p>
                                    <p><strong>Internal:</strong> {addr.internal ? "Yes" : "No"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>Nenhuma interface de rede encontrada</p>
            )}
        </div>
    );
}
