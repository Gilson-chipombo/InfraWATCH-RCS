"use server";

export const GetServices = async () => {
    const url = process.env.NEXT_PUBLIC_MONITORING_URL as string;
    const req = await fetch(`${url}/api/services`)

    if(!req.ok)
        return {error: "error"}

    const data = req.json()

    return data;
}