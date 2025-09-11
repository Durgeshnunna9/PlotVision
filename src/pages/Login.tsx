import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Mail, Lock, UserRound, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // make sure you have a supabase client
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
  const [role, setRole] = useState<'admin' | 'agent' | 'manager'>('agent'); // default
  // const [imageUrl, setImageUrl] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:8080/auth/dashboard", // or 8080 if that's your port
        },
      });
      if (error) throw error;
      // Supabase handles redirect, user will be logged in after callback
    } catch (err: any) {
      console.error("Google login error:", err.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const name = formData.get("name") as string;
  
      // 1. Signup
      const { data:signUpData, error:signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (signUpData.user) {
        console.log({ email, password, name, phone });
        const user = signUpData.user;
      
        // Upsert to profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            name: name,             // from form
            phone: phone,    // from form
                       // from form dropdown
          }, { onConflict: "id" });
      
        if (profileError) throw profileError;
  
        // 3. Auto login (optional)
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
  
        // 4. Navigate inside app
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Error in handleSignUp:", err.message);
      alert(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      alert(error.message);
    } else {
      navigate("/dashboard");
      alert("Login successful!");
      
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
                    <div className="space-y-2">
                      <Label htmlFor="role">Select Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'agent' | 'manager')}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
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
                  {isLoading
                    ? 'Processing...'
                    : isLogin
                    ? 'Sign In'
                    : 'Sign Up'}
                </Button>
                <Button onClick={handleGoogleSignIn} className='flex items-center bg-transparent text-black border-2 ml-10 hover:bg-gray-200'>
                  <img src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/w_1604,h_802,c_limit/google-logo.jpg" className="h-6"/> {isLogin ? "Sign in with Google" : "Sign up with Google"}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
