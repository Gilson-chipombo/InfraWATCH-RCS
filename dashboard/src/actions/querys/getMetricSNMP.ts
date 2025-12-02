"use server"

export const getMetricByid = async (id: string) => {
    const url = process.env.NEXT_PUBLIC_MONITORING_URL;
    const response = await fetch(`${url}/api/services/${id}/metrics/snmp`);

    if (!response.ok) {
        throw new Error("Erro ao buscar métricas SNMP");
    }

    const result = await response.json(); // 🔥 transforma em JSON
    console.log("Métricas SNMP recebidas:", result);
    return result;
}