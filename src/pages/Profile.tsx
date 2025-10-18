// src/pages/Profile.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore'; // Corrected path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'; // Corrected path
import { Button } from '../components/ui/button'; // Corrected path
import { Separator } from '../components/ui/separator'; // Corrected path
import { User, LogOut, ShoppingBag, Heart, MapPin, CreditCard, Edit } from 'lucide-react';
import { useToast } from '../hooks/use-toast'; // Corrected path

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useUserStore(); //
    const { toast } = useToast(); //

    const handleLogout = () => {
        logout(); //
        toast({ title: "Logged Out", description: "You have been successfully logged out." }); //
        navigate('/'); // Redirect to home after logout
    };

    // If user is not logged in, redirect to login page
    React.useEffect(() => {
        if (!isAuthenticated) { //
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Render loading or null if user data isn't ready or not authenticated yet
    if (!isAuthenticated || !user) { //
        // You could show a loading spinner here
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Profile Info */}
                <div className="md:col-span-1">
                    <Card> {/* */}
                        <CardHeader className="items-center text-center"> {/* */}
                            {/* Basic Avatar Placeholder */}
                            <img
                                src={user.image || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} //
                                alt={`${user.firstName} ${user.lastName}`} //
                                className="h-24 w-24 rounded-full border mb-4 object-cover"
                            />
                            <CardTitle>{user.firstName} {user.lastName}</CardTitle> {/* */}
                            <CardDescription>{user.email}</CardDescription> {/* */}
                        </CardHeader>
                        <CardContent className="space-y-4"> {/* */}
                            <Button variant="outline" className="w-full"> {/* */}
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Separator /> {/* */}
                            <Button variant="destructive" className="w-full" onClick={handleLogout}> {/* */}
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Dashboard Links */}
                <div className="md:col-span-2 space-y-6">
                    <Card> {/* */}
                        <CardHeader> {/* */}
                            <CardTitle>My Dashboard</CardTitle> {/* */}
                            <CardDescription>Manage your orders, wishlist, and settings.</CardDescription> {/* */}
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* */}
                            <Link to="/orders">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full"> {/* */}
                                    <CardContent className="p-4 flex flex-col items-center text-center"> {/* */}
                                        <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                                        <h3 className="font-semibold">My Orders</h3>
                                        <p className="text-xs text-muted-foreground">View order history & track shipments</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link to="/wishlist">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full"> {/* */}
                                    <CardContent className="p-4 flex flex-col items-center text-center"> {/* */}
                                        <Heart className="h-8 w-8 text-red-500 mb-2" />
                                        <h3 className="font-semibold">My Wishlist</h3>
                                        <p className="text-xs text-muted-foreground">See your saved items</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            {/* Placeholder Links/Cards */}
                            <Card className="opacity-50 cursor-not-allowed h-full"> {/* */}
                                <CardContent className="p-4 flex flex-col items-center text-center"> {/* */}
                                    <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                                    <h3 className="font-semibold">Manage Addresses</h3>
                                    <p className="text-xs text-muted-foreground">Edit shipping & billing addresses</p>
                                </CardContent>
                            </Card>
                             <Card className="opacity-50 cursor-not-allowed h-full"> {/* */}
                                <CardContent className="p-4 flex flex-col items-center text-center"> {/* */}
                                    <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                                    <h3 className="font-semibold">Payment Methods</h3>
                                    <p className="text-xs text-muted-foreground">Manage saved cards & UPI</p>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;