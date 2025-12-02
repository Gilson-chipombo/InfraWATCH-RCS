'use client'

import { ComputerInfo } from "@/src/types/computer"

export default function Network({ wsData }: { wsData: ComputerInfo }) {
    return (
        <div>
            {
                (wsData.network ? wsData.network : []).map((net, index) => (
                    <div key={index} className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Interface: {net.name}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {net.addresses.map((addr, addrIndex) => (
                                <div key={addrIndex} className="p-4 border rounded-md bg-secondary/50">
                                    <p><strong>Address:</strong> {addr.address}</p>
                                    <p><strong>Family:</strong> {addr.family}</p>
                                    <p><strong>MAC:</strong> {addr.mac}</p>
                                    <p><strong>Netmask:</strong> {addr.netmask}</p>
                                    <p><strong>CIDR:</strong> {addr.cidr}</p>
                                    <p><strong>Internal:</strong> {addr.internal ? "Yes" : "No"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
