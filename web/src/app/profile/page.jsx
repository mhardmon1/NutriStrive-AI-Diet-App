import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client-integrations/shadcn-ui";
import { Button } from "@/client-integrations/shadcn-ui";
import { Input } from "@/client-integrations/shadcn-ui";
import { Label } from "@/client-integrations/shadcn-ui";
import { Textarea } from "@/client-integrations/shadcn-ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client-integrations/shadcn-ui";
import { Separator } from "@/client-integrations/shadcn-ui";
import { Badge } from "@/client-integrations/shadcn-ui";
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  Target, 
  Activity,
  Save,
  Edit3
} from "lucide-react";

function ProfilePage() {
  const { data: user, loading: userLoading, refetch } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    height_cm: '',
    weight_kg: '',
    sport: '',
    goals: '',
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fat: '',
    target_water_ml: '',
  });

  // Fetch detailed profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/users/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        height_cm: profileData.height_cm || '',
        weight_kg: profileData.weight_kg || '',
        sport: profileData.sport || '',
        goals: profileData.goals || '',
        target_calories: profileData.target_calories || '',
        target_protein: profileData.target_protein || '',
        target_carbs: profileData.target_carbs || '',
        target_fat: profileData.target_fat || '',
        target_water_ml: profileData.target_water_ml || '',
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          target_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
          target_protein: formData.target_protein ? parseInt(formData.target_protein) : null,
          target_carbs: formData.target_carbs ? parseInt(formData.target_carbs) : null,
          target_fat: formData.target_fat ? parseInt(formData.target_fat) : null,
          target_water_ml: formData.target_water_ml ? parseInt(formData.target_water_ml) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      refetch();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const kgToLbs = (kg) => Math.round(kg * 2.20462);
  const cmToFeetInches = (cm) => {
    const totalInches = cm * 0.393701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}''`;
  };

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = profileData || {};
  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account and nutrition settings
              </p>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <CardTitle>{profile.name || user.name || 'Athlete'}</CardTitle>
              <CardDescription>{profile.sport || 'Fitness Enthusiast'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  {age && (
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{age}</div>
                      <div className="text-xs text-gray-600">Years Old</div>
                    </div>
                  )}
                  {profile.weight_kg && (
                    <div>
                      <div className="text-2xl font-bold text-green-600">{kgToLbs(profile.weight_kg)}</div>
                      <div className="text-xs text-gray-600">lbs</div>
                    </div>
                  )}
                  {profile.height_cm && (
                    <div className="col-span-2">
                      <div className="text-2xl font-bold text-purple-600">{cmToFeetInches(profile.height_cm)}</div>
                      <div className="text-xs text-gray-600">Height</div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Goals */}
                {profile.goals && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Goals
                    </h4>
                    <p className="text-sm text-gray-600">{profile.goals}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details & Nutrition Targets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your personal details and physical stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sport">Sport</Label>
                    <Input
                      id="sport"
                      value={formData.sport}
                      onChange={(e) => setFormData({...formData, sport: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. Basketball, Soccer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 70"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="goals">Goals</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Describe your fitness and nutrition goals..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Nutrition Targets</CardTitle>
                <CardDescription>
                  Customize your daily nutrition goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Target Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.target_calories}
                      onChange={(e) => setFormData({...formData, target_calories: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Target Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={formData.target_protein}
                      onChange={(e) => setFormData({...formData, target_protein: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Target Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={formData.target_carbs}
                      onChange={(e) => setFormData({...formData, target_carbs: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Target Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={formData.target_fat}
                      onChange={(e) => setFormData({...formData, target_fat: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 83"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="water">Target Water Intake (ml)</Label>
                    <Input
                      id="water"
                      type="number"
                      value={formData.target_water_ml}
                      onChange={(e) => setFormData({...formData, target_water_ml: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g. 2500"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm">
                      <a href="/account/logout" className="flex items-center">
                        Sign Out
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;