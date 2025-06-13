export const dynamic = 'force-dynamic'
import getUserFromToken from "@/lib/auth";

export default async function HomePage() {

    try {

        const user = await getUserFromToken();

        return (
            <>
                {/*@ts-ignore*/}
                <h2> {user && 'Welcome '+ user.name}</h2>
                {/*@ts-ignore*/}
                <h2> {user && 'You are a ' + user.role}</h2>
            </>
        )
    } catch (e) {
        console.error("Error fetching user:", e);
        return <div>Error loading user data</div>;
    }

}

