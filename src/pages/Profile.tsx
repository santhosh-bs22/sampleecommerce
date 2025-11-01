// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { 
    LogOut, 
    ShoppingBag, 
    Heart, 
    MapPin, 
    Edit, 
    Save, 
    XCircle, 
    Settings, 
    Shield,
    Bell,
    Loader2 // Import loader for button
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
// Dialog components are no longer needed for image upload

// Reusable navigation link component for the sidebar
interface ProfileNavLinkProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ProfileNavLink: React.FC<ProfileNavLinkProps> = ({ icon: Icon, label, href, isActive, onClick }) => (
  <Button
    asChild={!onClick}
    variant={isActive ? "secondary" : "ghost"}
    className="w-full justify-start gap-3 px-3"
    onClick={onClick}
  >
    {onClick ? (
      <>
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </>
    ) : (
      <Link to={href}>
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </Link>
    )}
  </Button>
);


const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, updateUser } = useUserStore();
    const { toast } = useToast();

    // --- State for Personal Info ---
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');

    // --- NEW: State for Password Form ---
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Update local state if user data changes in the store
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
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
        setIsEditing(false);
    };

    // Handle saving personal info changes
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault(); 
        if (!firstName.trim() || !lastName.trim()) {
             toast({ title: "Error", description: "First and last names cannot be empty.", variant: "destructive" });
             return;
        }

        console.log("Simulating profile update:", { firstName, lastName });
        if (user) {
             updateUser({ firstName, lastName }); // Update store
        }

        setIsEditing(false); // Exit editing mode
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
    };

    // --- NEW: Handle Password Form Input Change ---
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [id]: value }));
    };

    // --- NEW: Handle Password Update Submission ---
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPassword(true);

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        // 1. Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({ title: "Missing Fields", description: "Please fill in all password fields.", variant: "destructive" });
            setIsUpdatingPassword(false);
            return;
        }

        if (newPassword.length < 8) {
             toast({ title: "Password Too Short", description: "New password must be at least 8 characters.", variant: "destructive" });
             setIsUpdatingPassword(false);
             return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords Don't Match", description: "Your new password and confirmation password do not match.", variant: "destructive" });
            setIsUpdatingPassword(false);
            return;
        }
        
        // 2. Simulation (In a real app, you'd send this to your backend)
        // We'll pretend "password123" is the only valid *current* password for the demo.
        if (currentPassword !== "password123") {
             // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({ title: "Incorrect Password", description: "Your current password is incorrect.", variant: "destructive" });
            setIsUpdatingPassword(false);
            return;
        }

        // 3. Success
        console.log("Simulating password update...");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        toast({ title: "Password Updated!", description: "Your password has been changed successfully." });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear fields
        setIsUpdatingPassword(false);
    };


    if (!isAuthenticated || !user) {
        return (
          <div className="container mx-auto px-4 py-16 text-center">
            <p>Loading profile or redirecting...</p>
          </div>
        );
    }

    // --- MODIFIED: Always use ui-avatars for the name icon ---
    const userImage = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&bold=true`;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* --- Sidebar --- */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Mobile Profile Header */}
                    <Card className="lg:hidden">
                       <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                         <div className="relative group">
                            <img 
                                src={userImage} 
                                alt={`${firstName} ${lastName}`} 
                                className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover" 
                            />
                            {/* Removed Camera button */}
                         </div>
                         <div>
                           <CardTitle className="text-lg">{firstName} {lastName}</CardTitle>
                           <CardDescription className="truncate text-sm">{email}</CardDescription>
                         </div>
                       </CardHeader>
                    </Card>

                    {/* Desktop Profile Header & Navigation */}
                    <Card className="sticky top-20">
                        {/* Desktop Header */}
                        <CardHeader className="hidden lg:flex flex-col items-center text-center p-6">
                            <div className="relative group mb-4">
                                <img
                                    src={userImage}
                                    alt={`${firstName} ${lastName}`}
                                    className="h-24 w-24 rounded-full border-4 border-primary/20 object-cover"
                                />
                                {/* Removed Camera button */}
                            </div>
                            <CardTitle>{firstName} {lastName}</CardTitle>
                            <CardDescription className="truncate">{email}</CardDescription>
                        </CardHeader>
                        
                        {/* Navigation */}
                        <CardContent className="p-2 lg:p-4">
                            <nav className="flex flex-col space-y-1">
                                <ProfileNavLink icon={Settings} label="Account Details" href="/profile" isActive={true} />
                                <ProfileNavLink icon={ShoppingBag} label="My Orders" href="/orders" />
                                <ProfileNavLink icon={Heart} label="My Wishlist" href="/wishlist" />
                                <ProfileNavLink icon={MapPin} label="My Addresses" href="#" />
                                <ProfileNavLink icon={Shield} label="Security" href="#" />
                                <ProfileNavLink icon={Bell} label="Notifications" href="#" />
                                <Separator className="my-2" />
                                <ProfileNavLink icon={LogOut} label="Logout" href="#" onClick={handleLogout} />
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* --- Main Content --- */}
                <main className="lg:col-span-3 space-y-6">
                    {/* --- Personal Info Card --- */}
                    <Card>
                        <form onSubmit={handleSaveInfo}>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {isEditing ? "Edit Personal Information" : "Personal Information"}
                                        </CardTitle>
                                        <CardDescription>
                                            {isEditing ? "Update your personal information below." : "View and manage your personal information."}
                                        </CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button variant="outline" onClick={handleEdit} className="mt-4 sm:mt-0">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            readOnly={!isEditing}
                                            disabled={!isEditing}
                                            className={cn(!isEditing && "border-none px-0 shadow-none text-base font-medium text-foreground read-only:bg-transparent")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            readOnly={!isEditing}
                                            disabled={!isEditing}
                                            className={cn(!isEditing && "border-none px-0 shadow-none text-base font-medium text-foreground read-only:bg-transparent")}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label htmlFor="emailDisplay">Email</Label>
                                    <Input
                                        id="emailDisplay"
                                        value={email}
                                        readOnly
                                        disabled
                                        className={cn(!isEditing && "border-none px-0 shadow-none text-base font-medium", "read-only:bg-transparent text-muted-foreground")}
                                    />
                                    {!isEditing && (
                                        <CardDescription className="text-xs">Email address cannot be changed.</CardDescription>
                                    )}
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder={!isEditing ? "Not set" : "Add your phone number"}
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        className={cn(!isEditing && "border-none px-0 shadow-none text-base font-medium text-muted-foreground read-only:bg-transparent")}
                                    />
                                </div>
                            </CardContent>

                            {isEditing && (
                                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                                    <Button variant="outline" type="button" onClick={handleCancel}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            )}
                        </form>
                    </Card>

                    {/* --- MODIFIED: Security Card --- */}
                    <Card>
                        <form onSubmit={handlePasswordUpdate}>
                            <CardHeader>
                                <CardTitle className="text-2xl">Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password. (Demo: Use "password123" as current password to succeed)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                            
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input 
                                        id="currentPassword" 
                                        type="password" 
                                        placeholder="Enter your current password" 
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordInputChange}
                                        disabled={isUpdatingPassword}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input 
                                            id="newPassword" 
                                            type="password" 
                                            placeholder="Minimum 8 characters" 
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordInputChange}
                                            disabled={isUpdatingPassword}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input 
                                            id="confirmPassword" 
                                            type="password" 
                                            placeholder="Confirm new password" 
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordInputChange}
                                            disabled={isUpdatingPassword}
                                        />
                                    </div>
                                </div>
                            
                            </CardContent>
                            <CardFooter className="border-t pt-6">
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default Profile;