import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { UIProvider } from './context/UIContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <UIProvider>
            <DataProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </DataProvider>
        </UIProvider>
    </BrowserRouter>
)
