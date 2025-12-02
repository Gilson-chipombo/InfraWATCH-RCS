"use server";

export const GetServicesByID = async ({ id, service }: { id: string; service: string }) => {
    const url = process.env.NEXT_PUBLIC_MONITORING_URL as string;
    const endpoint = `${url}/api/services/${id}/metrics/${service}`;

    const req = await fetch(endpoint);
    if (!req.ok) {
        return { error: "error" };
    }
    const data = await req.json();
    console.log(data)
    return data;
};
