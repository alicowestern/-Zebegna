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
                        position="bottom-right"
                        toastOptions={{
                            duration: 1500,
                            style: {
                                background: '#ffffff',
                                color: '#1b2a3a',
                                border: '1px solid #d6e1ed',
                                borderRadius: '10px',
                                fontSize: '14px',
                                boxShadow: '0 8px 24px rgba(16, 40, 68, 0.14)',
                            },
                            success: { iconTheme: { primary: '#1f8f5f', secondary: '#ffffff' } },
                            error: { iconTheme: { primary: '#d84b4b', secondary: '#ffffff' } },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    )
}
