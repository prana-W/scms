// components/ui/Header.tsx
import HeaderClient from './HeaderClient';
import getUserFromToken from '@/lib/auth'; // Adjust the import path as needed

const Header = async () => {
    const user = await getUserFromToken();
    console.log(user)
    // @ts-ignore
    return <HeaderClient user={user} />;
};

export default Header;