export { }

declare global {
    interface Window {
        embeddedservice_bootstrap?: {
            settings: {
                language: string
            }
            init: (
                orgId: string,
                name: string,
                url: string,
                config: { scrt2URL: string }
            ) => void
        }
    }
}