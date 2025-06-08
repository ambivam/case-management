
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  Building2, 
  TrendingUp, 
  UserPlus, 
  FileText, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Play,
  BookOpen,
  Settings
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function GetStartedPage() {
  const router = useRouter();

  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up with your email and choose your role",
      icon: UserPlus,
      color: "text-blue-600"
    },
    {
      number: 2,
      title: "Complete Your Profile",
      description: "Add your details and verify your account",
      icon: Settings,
      color: "text-green-600"
    },
    {
      number: 3,
      title: "Create Your First Case",
      description: "Start managing cases with our intuitive interface",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      number: 4,
      title: "Explore Features",
      description: "Discover all the tools available for your role",
      icon: BookOpen,
      color: "text-orange-600"
    }
  ];

  const roleGuides = [
    {
      role: "Customer",
      icon: Users,
      color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600",
      description: "Perfect for individuals and small businesses needing support",
      features: [
        "Submit support tickets and cases",
        "Track case progress in real-time",
        "Upload documents and evidence",
        "Communicate directly with support team",
        "Access knowledge base and FAQs"
      ],
      gettingStarted: [
        "Register with your email address",
        "Verify your account via email",
        "Complete your profile information",
        "Create your first support case",
        "Explore the customer dashboard"
      ]
    },
    {
      role: "Merchant",
      icon: Building2,
      color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      iconColor: "text-green-600",
      description: "Designed for businesses managing multiple customer cases",
      features: [
        "Handle bulk case management",
        "Access dispute resolution tools",
        "Monitor performance metrics",
        "Submit evidence and documentation",
        "Manage escalation workflows"
      ],
      gettingStarted: [
        "Register with business email",
        "Provide business verification details",
        "Set up your merchant profile",
        "Import existing cases (if any)",
        "Configure notification preferences"
      ]
    },
    {
      role: "Commercial",
      icon: TrendingUp,
      color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-600",
      description: "Enterprise-level oversight and strategic case management",
      features: [
        "Multi-tier case oversight",
        "SLA monitoring and reporting",
        "Strategic escalation management",
        "Comprehensive analytics dashboards",
        "Compliance and audit tracking"
      ],
      gettingStarted: [
        "Contact sales for enterprise setup",
        "Complete organization verification",
        "Configure team access levels",
        "Set up reporting preferences",
        "Train your team on the platform"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">CaseFlow</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Play className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Get Started with CaseFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Follow our step-by-step guide to set up your account and start managing cases efficiently. 
            Choose your role and we'll guide you through the process.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => router.push('/register')}>
              Start Your Journey
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/learn-more')}>
              Learn More First
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Quick Start in 4 Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <IconComponent className={`h-8 w-8 ${step.color}`} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.number}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Specific Guides */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Choose Your Path
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Select the guide that matches your role to get personalized onboarding instructions
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {roleGuides.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Card key={index} className={`${guide.color} hover:shadow-lg transition-all duration-200`}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-8 w-8 ${guide.iconColor}`} />
                      <div>
                        <CardTitle className="text-xl">{guide.role}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {guide.role} Role
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {guide.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Getting Started:</h4>
                        <ol className="space-y-2">
                          {guide.gettingStarted.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {stepIndex + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => router.push('/register')}
                      >
                        Start as {guide.role}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Makes CaseFlow Special
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <CardTitle>Real-time Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Instant messaging, live updates, and seamless collaboration between all parties involved in case resolution.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <CardTitle>Role-based Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced access controls ensure users only see what they need to, maintaining privacy and security.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <CardTitle>Document Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Secure file uploads, version control, and organized document libraries for all your case materials.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <CardTitle>Analytics & Reporting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive dashboards and reports to track performance, identify trends, and optimize processes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Case Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using CaseFlow to streamline their operations and improve customer satisfaction.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" onClick={() => router.push('/learn-more')}>
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">CaseFlow</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500">
            © 2025 CaseFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
