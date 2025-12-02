export function PcIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect
                x="3"
                y="4"
                width="18"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
            />
            <rect x="8" y="18" width="8" height="2" rx="1" fill="currentColor" />
        </svg>
    );
}
export function FirewallIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M4 8h16M4 12h16M4 16h16" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v8M8 8v8M16 8v8" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
export function CloudIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path
                d="M7 17h9a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5A3.5 3.5 0 0 0 7 17Z"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
}

export function SwitchIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect
                x="4"
                y="6"
                width="16"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M6 10h12M6 14h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function RouterIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <rect
                x="3"
                y="8"
                width="18"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
            <circle cx="12" cy="13" r="1.5" fill="currentColor" />
            <circle cx="16" cy="13" r="1.5" fill="currentColor" />
            <path
                d="M7 6l2-2m3 2 2-2m3 2 2-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
