export const dynamic = 'force-dynamic'

import getUserFromToken from "@/lib/auth";

export default async function HomePage() {

    try {

        const user = await getUserFromToken();
        return (
            <>
                <h2>{user && user.name}</h2>
                <h2>{user && user.role}</h2>
            </>
        )
    } catch (e) {
        console.error("Error fetching user:", e);
        return <div>Error loading user data</div>;
    }

}

