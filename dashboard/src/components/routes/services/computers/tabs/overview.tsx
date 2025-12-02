'use client'

import { ComputerInfo } from "@/src/types/computer"

export default function Overview({ wsData }: { wsData: ComputerInfo }) {
    return (
        <div>
            {wsData && (
                <>
                    <div>
                        <h1>
                            <b>Sistema</b>
                        </h1>
                        <h1>{wsData.system?.hostname}</h1>
                        <div className="flex flex-col">
                            <span>{wsData.system?.userInfo.username}</span>
                            <span>{wsData.system?.userInfo.shell}</span>
                            <span>{wsData.system?.userInfo.homedir}</span>
                        </div>
                        <div className="flex flex-col">
                            <span>
                                {wsData.system?.platform}
                                {wsData.system?.arch}
                            </span>
                            <span>{wsData.system?.release}</span>
                            <span>{wsData.system?.uptime}</span>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <h1>
                            <b>CPU</b>
                        </h1>
                        <div className="flex flex-col">
                            <h1>{wsData.cpu?.cores}</h1>
                            <span>{wsData.cpu?.model}</span>
                            <span>{wsData.cpu?.speed}</span>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <h1>
                            <b>Memory</b>
                        </h1>
                        <div className="flex flex-col">
                            <span>{wsData.memory?.total}</span>
                            <span>{wsData.memory?.free}</span>
                            <span>{wsData.memory?.used}</span>
                            <span>{wsData.memory?.usagePercent}</span>
                        </div>
                    </div>
                    <hr />
                </>
            )}
        </div>
    )
}
