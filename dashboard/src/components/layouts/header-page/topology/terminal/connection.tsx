'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

interface ConnectionTermProp {
    ip?: string
}
const DeviceXterm = dynamic(() => import("./deviceTerm"), {
  ssr: false,
});

export const ConnectionTerm = ({ ip }: ConnectionTermProp) => {
    const [host, setHost] = useState(ip);
    const [port, setPort] = useState(9090);
    const [startTerminal, setStartTerminal] = useState(false);

    const handleStart = () => {
        if (!host || !port) {
            alert('Informe o host e a porta');
            return;
        }
        setStartTerminal(true);
    };

    return (
        <div className={`w-full ${startTerminal ? "bg-black" : "bg-card"}  rounded-md`}>
            {!startTerminal ? (
                <div className="space-y-4 w-[400px] p-10">
                    <h2 className="text-xl font-bold">Conectar ao Terminal</h2>
                    <div>
                        <label className="block mb-1">Host:</label>
                        <Input
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            className="w-full p-2  rounded"
                            placeholder="ex: localhost"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Porta:</label>
                        <Input
                            type="number"
                            value={port || 9090}
                            onChange={(e: any) => setPort(e.target.value)}
                            className="w-full p-2 rounded"
                            placeholder="ex: 3000"
                        />
                    </div>
                    <Button
                        onClick={handleStart}
                        variant={'outline'}
                        className='w-full rounded-d'
                    >
                        Iniciar Terminal
                    </Button>
                </div>
            ) : (
                <DeviceXterm host={host || ""} port={port as any} />
            )}
        </div>
    );
};
