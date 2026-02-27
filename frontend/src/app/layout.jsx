import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'

import './globals.css'

export const metadata = {
    title: 'Zebegna - Gate Console',
    description: 'Digital Ethiopia begins with simple, smart systems.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: {
                                background: '#1e2535',
                                color: '#e2e8f0',
                                border: '1px solid #2d3748',
                                borderRadius: '10px',
                                fontSize: '14px',
                            },
                            success: { iconTheme: { primary: '#48bb78', secondary: '#1e2535' } },
                            error: { iconTheme: { primary: '#fc8181', secondary: '#1e2535' } },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    )
}
