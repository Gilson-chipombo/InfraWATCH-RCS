"use server";

export const ConnectToComputer = async ({ adbToken, token }: { adbToken: string; token: string }) => {
  console.log("Conectando ao computador...", { adbToken, token });
  try {
    const url = process.env.NEXT_PUBLIC_LINKER_URL as string
    const response = await fetch(`${url}/newConnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: adbToken,
        device: navigator.userAgent,
        tokenGenerated: token,
      }),
    });
    console.log("Resposta do servidor:", response);

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, error: response.statusText };
    }
  } catch (error: any) {
    console.error("Erro ao enviar pedido:", error);
    return { success: false, error: error.message || "Erro inesperado" };
  }
};
