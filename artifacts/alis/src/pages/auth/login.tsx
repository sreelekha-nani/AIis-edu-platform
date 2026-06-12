import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BrainCircuit } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError("");
      const loggedInUser = await login(values);
      setLocation(`/${loggedInUser.role}`);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">Welcome Back to ALIS</h1>
          <p className="text-muted-foreground mt-2">Sign in to your learning portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm font-semibold text-foreground mb-3">Demo Credentials:</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-2.5 bg-muted/50 rounded-lg border border-border text-[11px] leading-relaxed">
              <span className="font-bold text-primary block mb-0.5">Administrator</span>
              <code className="text-muted-foreground">admin@alis.com / admin123</code>
            </div>
            <div className="p-2.5 bg-muted/50 rounded-lg border border-border text-[11px] leading-relaxed">
              <span className="font-bold text-primary block mb-0.5">Student / Teacher / Parent</span>
              <code className="text-muted-foreground">student@alis.com / password123</code><br/>
              <code className="text-muted-foreground">teacher@alis.com / password123</code><br/>
              <code className="text-muted-foreground">parent@alis.com / password123</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
