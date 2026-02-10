export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground" style={{ backgroundColor: 'rgb(0, 0, 102)' }}>
                <img 
                    src="/favicon.ico" 
                    alt="Logo" 
                    className="size-5"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm" style={{ color: 'rgb(0, 0, 102)' }}>
                <span className="mb-0.5 font-semibold leading-tight">
                    SIMRS Apotek PKU
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                    Muhammadiyah Gombong
                </span>
            </div>
        </>
    );
}
