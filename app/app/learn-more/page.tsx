
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
  FileText, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Clock,
  BarChart3,
  Lock,
  Zap,
  Globe,
  Star,
  Quote
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

export default function LearnMorePage() {
  const router = useRouter();

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce case resolution time by up to 60% with automated workflows and intelligent routing.",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Improve Efficiency",
      description: "Streamlined processes and real-time analytics help teams work smarter, not harder.",
      color: "text-green-600"
    },
    {
      icon: Lock,
      title: "Enhanced Security",
      description: "Enterprise-grade security with role-based access controls and data encryption.",
      color: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Faster Resolution",
      description: "Intelligent case prioritization and automated escalation ensure critical issues get immediate attention.",
      color: "text-orange-600"
    },
    {
      icon: Globe,
      title: "Scalable Solution",
      description: "Grows with your business from startup to enterprise with flexible pricing and features.",
      color: "text-indigo-600"
    },
    {
      icon: Star,
      title: "Better Experience",
      description: "Improved customer satisfaction through transparent communication and faster resolutions.",
      color: "text-pink-600"
    }
  ];

  const useCases = [
    {
      title: "Customer Support",
      description: "Handle support tickets, track customer issues, and maintain service level agreements.",
      features: ["Ticket management", "SLA tracking", "Customer communication", "Knowledge base integration"],
      icon: Users,
      color: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Dispute Resolution",
      description: "Manage payment disputes, chargebacks, and merchant conflicts with structured workflows.",
      features: ["Evidence collection", "Timeline tracking", "Multi-party communication", "Decision documentation"],
      icon: Building2,
      color: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Compliance Management",
      description: "Track regulatory compliance, audit trails, and ensure adherence to industry standards.",
      features: ["Audit trails", "Compliance reporting", "Risk assessment", "Documentation management"],
      icon: TrendingUp,
      color: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Project Management",
      description: "Coordinate complex projects with multiple stakeholders and track progress to completion.",
      features: ["Task assignment", "Progress tracking", "Stakeholder communication", "Milestone management"],
      icon: FileText,
      color: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Customer Success Manager",
      company: "TechCorp Inc.",
      content: "CaseFlow transformed our customer support process. We've seen a 40% reduction in resolution time and our customer satisfaction scores have never been higher.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      company: "Global Merchants Ltd.",
      content: "The merchant dashboard gives us complete visibility into our dispute management process. The analytics help us identify trends and improve our operations.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Compliance Officer",
      company: "Financial Services Co.",
      content: "The audit trails and compliance reporting features are exactly what we needed. CaseFlow helps us stay compliant while improving efficiency.",
      rating: 5
    }
  ];

  const features = [
    {
      category: "Core Features",
      items: [
        "Multi-role dashboard system",
        "Real-time case tracking",
        "Document management",
        "Automated workflows",
        "Communication tools",
        "Reporting & analytics"
      ]
    },
    {
      category: "Customer Features",
      items: [
        "Self-service portal",
        "Case status tracking",
        "File uploads",
        "Direct messaging",
        "FAQ integration",
        "Mobile responsive"
      ]
    },
    {
      category: "Merchant Features",
      items: [
        "Bulk case management",
        "Dispute resolution",
        "Performance metrics",
        "Evidence submission",
        "Escalation workflows",
        "API integration"
      ]
    },
    {
      category: "Commercial Features",
      items: [
        "Multi-tier oversight",
        "SLA monitoring",
        "Strategic escalations",
        "Advanced analytics",
        "Compliance tracking",
        "Custom reporting"
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
              <Button onClick={() => router.push('/get-started')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to Know About CaseFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover how our comprehensive case management system can transform your business operations 
            and improve customer satisfaction across all touchpoints.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => router.push('/get-started')}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/register')}>
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Why Choose CaseFlow?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Our platform delivers measurable results that transform how you handle cases and serve customers
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <IconComponent className={`h-8 w-8 ${benefit.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Perfect for Every Use Case
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            From customer support to compliance management, CaseFlow adapts to your specific needs
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className={`${useCase.color} hover:shadow-lg transition-all duration-200`}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-3">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Capabilities:</h4>
                    <ul className="space-y-2">
                      {useCase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Complete Feature Overview
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg text-center">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            See CaseFlow in Action
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Explore our intuitive interface designed for efficiency and ease of use
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://i.pinimg.com/originals/8b/53/26/8b5326c8432ddb4e418fef684792f05d.png"
                  alt="CaseFlow Dashboard Interface"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Intuitive Dashboard</CardTitle>
                <CardDescription>
                  Clean, organized interface that puts all essential information at your fingertips
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://i.pinimg.com/originals/76/02/a2/7602a27aa118be53f020373856b5c52d.jpg"
                  alt="Case Management Details"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Detailed Case View</CardTitle>
                <CardDescription>
                  Comprehensive case information with timeline, documents, and communication history
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://www.kyubit.com/Images/kpi-dashboard/kpi-dashboard-final.png"
                  alt="Analytics and Reporting"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Powerful reporting tools to track performance and identify improvement opportunities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://i.pinimg.com/originals/13/b3/c4/13b3c41541d7ad1008a45d5ec2d71dbd.png"
                  alt="Mobile Interface"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>
                  Full functionality on any device, ensuring you can manage cases anywhere, anytime
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Our Customers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-gray-400 mb-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience CaseFlow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have transformed their case management with CaseFlow. 
            Start your free trial today and see the difference for yourself.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary" onClick={() => router.push('/get-started')}>
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" onClick={() => router.push('/register')}>
              Create Account
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
