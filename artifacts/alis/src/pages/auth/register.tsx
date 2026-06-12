import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit } from "lucide-react";
import { RegisterInputRole } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([RegisterInputRole.student, RegisterInputRole.teacher, RegisterInputRole.parent]),
  parentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

export default function RegisterPage() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", role: RegisterInputRole.student, parentEmail: "" },
  });

  const watchRole = form.watch("role");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError("");
      const registeredUser = await register({
        ...values,
        parentEmail: values.role === RegisterInputRole.student && values.parentEmail ? values.parentEmail : undefined
      });
      setLocation(`/${registeredUser.role}`);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">Join ALIS</h1>
          <p className="text-muted-foreground mt-2">Create your account to start learning</p>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a...</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={RegisterInputRole.student}>Student</SelectItem>
                      <SelectItem value={RegisterInputRole.teacher}>Teacher</SelectItem>
                      <SelectItem value={RegisterInputRole.parent}>Parent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchRole === RegisterInputRole.student && (
              <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="parent@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
