import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import ScrollToTop from '@/components/shared/ScrollToTop'
import './locales'

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <ScrollToTop />
                    <Layout>
                        <Views />
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
