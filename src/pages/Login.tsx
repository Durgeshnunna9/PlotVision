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
  const [role, setRole] = useState<'agent'>('agent'); // Only agents can signup
  // const [imageUrl, setImageUrl] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { login } = useAuth();

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (user) {
      if (!user.role) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
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
  

  // const uploadProfileImage = async (file: File, userId: string) => {
  //   try {
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${userId}-${Date.now()}.${fileExt}`;
  //     const filePath = `profiles/${fileName}`;
  
  //     // Upload file
  //     const { error: uploadError } = await supabase.storage
  //       .from('profile-images') // 👈 bucket name
  //       .upload(filePath, file, { upsert: true });
  
  //     if (uploadError) throw uploadError;
  
  //     // Get public URL
  //     const { data } = supabase.storage
  //       .from('profile-images')
  //       .getPublicUrl(filePath);
  
  //     return data.publicUrl;
  //   } catch (err) {
  //     console.error('Error uploading image:', err);
  //     throw err;
  //   }
  // };
  // Handle Login / Signup

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
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;

      // 1. Signup with redirect URL
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: name, 
            phone, 
            role: 'agent' // Force all new signups to be agents initially
          },
          emailRedirectTo: redirectUrl
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('This email is already registered. Please try logging in instead.');
          setIsLogin(true);
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (signUpData.user) {
        // Profile will be created automatically by the database trigger
        // Navigate to onboarding for role selection
        navigate("/onboarding");
      }
    } catch (err: any) {
      console.error("Error in handleSignUp:", err.message);
      setError(err.message || 'An error occurred during signup');
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
  // const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError('');
    
  //   const formData = new FormData(e.currentTarget);
  //   const email = formData.get("email") as string;
  //   const password = formData.get("password") as string;

  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) {
  //       setError(error.message);
  //     } else {
  //       // Check if user needs onboarding (no role set)
  //       const { data: profile } = await supabase
  //         .from('profiles')
  //         .select('role')
  //         .eq('id', data.user?.id)
  //         .single();
          
  //       if (!profile?.role) {
  //         navigate('/onboarding');
  //       } else {
  //         navigate('/dashboard');
  //       }
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'An error occurred during login');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
                    <div className="space-y-2">
                      <Label htmlFor="role">Select Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'agent')}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="agent">Real Estate Agent</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor='name'>Name</Label>
                      <div className='relative'>
                        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor='mobile_number'>Mobile Number</label>
                      <div className='relative'>
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                          type="tel"
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
                  </>
                )}

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

                {!isLogin && (
                  <>
                    {/* <div className="flex flex-col">
                      <Label className="block font-large mb-2">
                        Upload your Image
                      </Label>
                      
                      <input type='file'/>
                    </div> */}
                    

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

                <Button
                  type="submit"
                  className="w-full btn-gradient"
                  disabled={isLoading}
                >
                  {isLoading  ? 'Processing...': isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
                <Button onClick={handleGoogleSignIn} className='flex items-center bg-transparent text-black border-2 ml-10 hover:bg-gray-200'>
                  <img src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/w_1604,h_802,c_limit/google-logo.jpg" className="h-6"/> {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </Button>
              </form>

              {/* <div className="mt-2 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 text-md font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div> */}
              <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Sample Login</h2>

                <div className="space-y-4">
                  {/* Admin */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Admin</h3>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Username:</span> green@gmail.com</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Password:</span> green12345</p>
                  </div>

                  {/* Manager */}
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Manager</h3>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Username:</span> blue@gmail.com</p>
                    <p className="text-gray-600 text-sm"><span className="font-medium">Password:</span> blue12345</p>
                  </div>

                  {/* Agent */}
                  <div className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                    <h3 className="font-medium text-gray-700">Agent</h3>
                    <p>Google Sign in </p>
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
