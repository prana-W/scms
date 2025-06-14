import { Suspense } from 'react'
import UnauthorizedPage from './UnauthorizedPage'

export default function Page() {
    return (
        <Suspense fallback={<div>Loading unauthorized message...</div>}>
            <UnauthorizedPage />
        </Suspense>
    )
}
