// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input'; // Import Input
import { Label } from '../components/ui/label'; // Import Label
import { Separator } from '../components/ui/separator';
import { User, LogOut, ShoppingBag, Heart, MapPin, CreditCard, Edit, Save, XCircle } from 'lucide-react'; // Added Save, XCircle
import { useToast } from '../hooks/use-toast';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    // Destructure updateUser from the store
    const { user, isAuthenticated, logout, updateUser } = useUserStore();
    const { toast } = useToast();

    // State for editing mode and form inputs
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || ''); // Added email state (read-only for now)

    // Update local state if user data changes in the store (e.g., after login)
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
    }, [user]);


    const handleLogout = () => {
        logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        navigate('/');
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Handle entering edit mode
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Handle cancelling edit mode
    const handleCancel = () => {
        // Reset form fields to original user data
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
        setIsEditing(false);
    };

    // Handle saving changes
    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
             toast({ title: "Error", description: "First and last names cannot be empty.", variant: "destructive" });
             return;
        }

        // --- REAL API CALL NEEDED HERE ---
        // In a real application, you would make an API call here
        // to update the user's details on the backend.
        /*
        try {
            const response = await fetch(`/api/user/${user?.id}`, { // Your backend update endpoint
                method: 'PUT', // Or PATCH
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${your_auth_token}` },
                body: JSON.stringify({ firstName, lastName }), // Only send fields that can be updated
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            const updatedUser = await response.json();
            updateUser(updatedUser); // Update store with response from backend

        } catch (error) {
            console.error("Profile update error:", error);
            toast({ title: "Update Failed", description: "Could not save profile changes.", variant: "destructive" });
            return; // Exit if API call fails
        }
        */

        // --- Mock Update (REMOVE FOR REAL IMPLEMENTATION) ---
        console.log("Simulating profile update:", { firstName, lastName });
        if (user) {
             updateUser({ firstName, lastName }); // Update store directly
        }
        // --- End Mock Update ---


        setIsEditing(false); // Exit editing mode
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
    };


    if (!isAuthenticated || !user) {
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <p>Loading profile or redirecting...</p>
          </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Profile Info & Edit Form */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <img
                                src={user.image || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`} // Use state for name in avatar
                                alt={`${firstName} ${lastName}`}
                                className="h-24 w-24 rounded-full border mb-4 object-cover"
                            />
                            {/* Conditionally render Title/Inputs */}
                            {!isEditing ? (
                                <>
                                    <CardTitle>{firstName} {lastName}</CardTitle>
                                    <CardDescription>{email}</CardDescription>
                                </>
                            ) : (
                                <div className="w-full space-y-2 mt-2">
                                     <div>
                                        <Label htmlFor="firstName" className="text-left w-full block mb-1 text-xs text-muted-foreground">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First Name"
                                            className="text-center text-lg font-semibold" // Adjust styling as needed
                                        />
                                     </div>
                                      <div>
                                        <Label htmlFor="lastName" className="text-left w-full block mb-1 text-xs text-muted-foreground">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last Name"
                                            className="text-center text-lg font-semibold" // Adjust styling as needed
                                        />
                                      </div>
                                       <div>
                                         <Label htmlFor="emailDisplay" className="text-left w-full block mb-1 text-xs text-muted-foreground">Email (cannot change)</Label>
                                         <Input
                                             id="emailDisplay"
                                             value={email}
                                             readOnly
                                             disabled
                                             className="text-center text-sm text-muted-foreground bg-muted/50" // Read-only styling
                                         />
                                       </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Conditional Buttons */}
                            {!isEditing ? (
                                <Button variant="outline" className="w-full" onClick={handleEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button className="flex-1" onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                            <Separator />
                            <Button variant="destructive" className="w-full" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Dashboard Links (No changes needed here) */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Dashboard</CardTitle>
                            <CardDescription>Manage your orders, wishlist, and settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/orders">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                                        <h3 className="font-semibold">My Orders</h3>
                                        <p className="text-xs text-muted-foreground">View order history & track shipments</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link to="/wishlist">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <Heart className="h-8 w-8 text-red-500 mb-2" />
                                        <h3 className="font-semibold">My Wishlist</h3>
                                        <p className="text-xs text-muted-foreground">See your saved items</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            {/* Placeholder Links/Cards */}
                            <Card className="opacity-50 cursor-not-allowed h-full">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                                    <h3 className="font-semibold">Manage Addresses</h3>
                                    <p className="text-xs text-muted-foreground">Edit shipping & billing addresses</p>
                                </CardContent>
                            </Card>
                             <Card className="opacity-50 cursor-not-allowed h-full">
                                <CardContent className="p-4 flex flex-col items-center text-center">
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