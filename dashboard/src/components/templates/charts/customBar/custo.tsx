import { cn } from "@/src/lib/utils";

export const HorizontalBarChart = ({ value, className, background }: { value: number, className?: string, background?: string }) => {
    // Garante que o valor esteja entre 0 e 100
    const percent = Math.max(0, Math.min(100, value));

    // Define gradiente dinâmico
    let gradient = "linear-gradient(270deg, rgb(255,0,0), rgba(0,255,63,1))"; // verde puro
    if (percent < 30) {
        gradient = "rgb(0,255,0)"; // verde -> laranja
    } else if (percent >= 30 && percent < 85) {
        gradient = "linear-gradient(70deg, rgb(0,255,0), rgba(255,200,63,1))"; // amarelo -> laranja
    } else {
        gradient = "linear-gradient(270deg, rgb(255,0,0), rgba(0,255,63,1))"
    }

    return (
        <div className={cn("mt-2 w-full h-5 relative", className)}>
            {/* Barra preenchida */}
            <div
                className="absolute top-0 left-0 h-5  transition-all duration-700"
                style={{
                    width: `${percent}%`,
                    background: background ? background : gradient,
                }}
            />

            {/* Grid de fundo (linhas brancas/cinza) */}
            <svg
                className="absolute top-[-20px] w-full h-[60px] z-10"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1="30"
                    x2="500"
                    y2="30"
                    stroke="var(--sidebar)"
                    strokeWidth="20"
                    strokeDasharray="1.5"
                    strokeDashoffset="1"
                    transform="scale(2,1)"
                />
            </svg>

            {/* Grid azul semi-transparente */}
            <svg
                className="absolute top-[-20px] w-full h-[60px] opacity-20 z-20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1="30"
                    x2="500"
                    y2="30"
                    stroke="#6298FF"
                    strokeWidth="20"
                    strokeDasharray="1.5"
                    strokeDashoffset="1"
                    transform="scale(2,1)"
                />
            </svg>
        </div>
    );
};
