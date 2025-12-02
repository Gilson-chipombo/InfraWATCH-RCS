'use client'

import { EditService } from "./subTabs/setting/editService"
import { Service } from "@/src/types/interfaces"

export default function SettingPage({ service }: { service: Service }) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Informações do Serviço</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <EditService service={service} />
            </div>
        </div>
    )
}
