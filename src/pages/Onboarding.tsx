import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const [selectedRole, setSelectedRole] = useState<'agent'>('agent');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelection = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome!",
        description: "Your account has been set up successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to RealtyPro</CardTitle>
          {/* <CardDescription>
            Please select your role to complete your registration
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'agent')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agent" id="agent" />
              <Label htmlFor="agent" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Real Estate Agent</div>
                  <div className="text-sm text-muted-foreground">Manage properties and clients</div>
                </div>
              </Label>
            </div>
          </RadioGroup> */}
          <p className='text-center'> Hope you have a good experience</p>
          
          <Button 
            onClick={handleRoleSelection} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Thank you...' : 'Enter'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;