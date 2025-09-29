import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Mail, Lock, UserRound, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth,  } from '@/contexts/AuthContext';
import heroImage from '@/assets/real-estate-hero.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);  
  const [role, setRole] = useState<'agent'>('agent'); // Only agents can signup
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { login } = useAuth();

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const TermsModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <h2 className="text-xl font-bold mb-2">Terms & Conditions</h2>
            <div className="h-48 overflow-y-auto text-sm text-gray-700 mb-4">
              <p>
                By using this platform, you agree to the following terms...
              </p>
              <p className="mt-2">
                1. Provide accurate details. <br />
                2. Do not misuse the service. <br />
                3. Admin may suspend accounts for violations.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };


  const uploadImage = async (): Promise<string | null> => {
    if (!profileImage) return null;

    const fileName = `${Date.now()}_${profileImage.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, profileImage);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      // Supabase handles redirect, user will be logged in after callback
    } catch (err: any) {
      console.error("Google login error:", err.message);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
  
    try {
      const formData = new FormData(e.currentTarget);
  
      // ✅ Extract form values safely
      const email = (formData.get("email") as string)?.trim();
      const password = (formData.get("password") as string)?.trim();
      const full_name = (formData.get("full_name") as string)?.trim();
      const phone = (formData.get("phone") as string)?.trim();
      const avatarFile = formData.get("avatar") as File | null;
  
      // ✅ Validate required fields
      if (!email || !password || !full_name || !phone) {
        setMessage("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
  
      // 1️⃣ Signup user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone }, // store metadata safely
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
  
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Signup failed, no user returned");
  
      const userId = signUpData.user.id;
      let avatar_url: string | null = null;
  
      // 2️⃣ Upload avatar if provided
      if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `  ${fileName}`;
  
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });
  
        if (uploadError) throw uploadError;
  
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
  
        avatar_url = publicUrlData.publicUrl;
      }
  
      // 3️⃣ Insert profile row
      const { error: profileError } = await supabase
        .from("profiles") // or 'user_profiles'
        .upsert([
          {
            id: userId,
            full_name,
            phone,
            role: "agent", // default role
            avatar_url,
          },
        ]);
  
      if (profileError) throw profileError;
  
      setMessage("Signup successful! Check your email for confirmation.");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
   
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  try{
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
  
    const { success, error } = await login(email, password);
    console.log("Login result:", { success, error });
  
    if (!success) {
      setError(error || "Login failed");
      setIsLoading(false); // ✅ keep user on same page
      return;
    }
  
    // ✅ login successful, now check profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single();
  
    if (!profile?.role) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  
    setIsLoading(false);
  }
    catch(err){
      err
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 relative xl:flex xl:flex-0">
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
        <img
          src={heroImage}
          alt="Real Estate Office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Home className="h-12 w-12" />
              <h1 className="text-4xl font-bold">RealtyPro</h1>
            </div>
            <p className="text-xl opacity-90 max-w-md">
              Professional Real Estate Management Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 xl:max-w-lg">
        <div className="w-full max-w-sm">
          <Card className="card-premium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Sign in to your account to continue'
                  : 'Fill in your details to create an account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!isLogin && (
                  <>
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                          type="text"
                          id="full_name"
                          name="full_name"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Mobile Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          pattern="[0-9]{10}"
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col">
                      <Label htmlFor="avatar">Upload your Image</Label>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {profileImage && (
                        <img
                          src={URL.createObjectURL(profileImage)}
                          alt="Preview"
                          className="mt-2 w-32 h-32 object-cover rounded-md"
                        />
                      )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                      />
                      <label htmlFor="terms">
                        I agree to the{' '}
                        <span
                          className="text-blue-600 underline cursor-pointer"
                          onClick={() => setShowTerms(true)}
                        >
                          Terms & Conditions
                        </span>
                      </label>
                    </div>
                    {showTerms && (
                      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
                    )}
                  </>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Button>

                {/* Google Sign-in */}
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className='flex items-center bg-transparent text-black border-2 ml-10 hover:bg-gray-200'
                >
                  <img
                    src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/w_1604,h_802,c_limit/google-logo.jpg"
                    className="h-6 mr-2"
                  />
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </Button>
              </form>


              <div className="mt-2 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 text-md font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
              <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Sample Login</h2>

                <div className="space-y-4">
                  {/* Admin */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Admin</h3>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Username:</span> admin@test.com</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Password:</span> admin12345</p>
                  </div>

                  {/* Manager */}
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Manager</h3>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Username:</span> manager@test.com</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Password:</span> manager12345</p>
                  </div>

                  {/* Agent */}
                  <div className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Agent</h3>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Username:</span> agent@test.com</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Password:</span> agent12345</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
