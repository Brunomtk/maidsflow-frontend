"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, Calendar, CreditCard, BarChart3, Shield, Clock, Star, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        } ${scrollY > 50 ? "bg-slate-900/95 shadow-2xl" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maids%20Flow%20%281%29-iwGGBAvJFCYKXI4CVTafdWy2BFNpLk.png"
                  alt="Maids Flow Logo"
                  className="h-10 w-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                Maids Flow
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#about", label: "About" },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-slate-300 hover:text-white transition-all duration-300 hover:scale-110 relative group font-medium"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/25 border-0">
                  Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"} overflow-hidden bg-slate-900/95 backdrop-blur-lg`}
        >
          <div className="px-4 py-4 space-y-4">
            {[
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "#about", label: "About" },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block text-slate-300 hover:text-white transition-all duration-300 py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-spin-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          <div
            className={`mb-8 transition-all duration-1500 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
          >
            <div className="relative inline-block mb-8 group">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maids%20Flow%20%281%29-iwGGBAvJFCYKXI4CVTafdWy2BFNpLk.png"
                alt="Maids Flow Logo"
                className="h-32 w-32 mx-auto transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
              <div className="absolute inset-0 animate-ping bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"></div>
            </div>

            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-1500 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
            >
              Streamline Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                Cleaning Business
              </span>
            </h1>

            <p
              className={`text-lg sm:text-xl lg:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed transition-all duration-1500 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
            >
              The complete management platform for cleaning service companies. Manage appointments, track professionals,
              handle payments, and grow your business with ease.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1500 delay-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 group border-0 animate-gradient-x"
                >
                  <span className="group-hover:animate-pulse font-semibold">Get Started Today</span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800/50 px-12 py-4 text-lg bg-transparent transition-all duration-500 hover:scale-110 hover:border-blue-400 hover:text-blue-400 hover:shadow-xl backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From scheduling to payments, Maids Flow provides all the tools you need to run a successful cleaning
              service business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Manage appointments, recurring services, and professional schedules with our intuitive calendar system.",
                color: "text-blue-400",
                bgGradient: "from-blue-500/10 to-blue-600/10",
                delay: "delay-100",
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Track your cleaning professionals, manage teams, and monitor performance with detailed analytics.",
                color: "text-green-400",
                bgGradient: "from-green-500/10 to-green-600/10",
                delay: "delay-200",
              },
              {
                icon: CreditCard,
                title: "Payment Processing",
                desc: "Handle invoicing, track payments, and manage billing with integrated payment processing.",
                color: "text-purple-400",
                bgGradient: "from-purple-500/10 to-purple-600/10",
                delay: "delay-300",
              },
              {
                icon: BarChart3,
                title: "Business Analytics",
                desc: "Get insights into your business performance with comprehensive reports and analytics.",
                color: "text-orange-400",
                bgGradient: "from-orange-500/10 to-orange-600/10",
                delay: "delay-400",
              },
              {
                icon: Clock,
                title: "Time Tracking",
                desc: "Track check-ins, check-outs, and service duration for accurate billing and performance monitoring.",
                color: "text-red-400",
                bgGradient: "from-red-500/10 to-red-600/10",
                delay: "delay-500",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security with reliable cloud infrastructure to keep your data safe.",
                color: "text-cyan-400",
                bgGradient: "from-cyan-500/10 to-cyan-600/10",
                delay: "delay-600",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${feature.bgGradient} border-slate-700/50 backdrop-blur-sm transition-all duration-700 hover:scale-105 hover:bg-slate-900/70 hover:border-slate-600 hover:shadow-2xl group ${feature.delay} animate-fade-in-up`}
              >
                <CardHeader className="pb-4">
                  <div className="relative mb-4">
                    <feature.icon
                      className={`h-12 w-12 ${feature.color} transition-all duration-500 group-hover:scale-125 group-hover:animate-bounce`}
                    />
                    <div
                      className={`absolute inset-0 ${feature.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`}
                    ></div>
                  </div>
                  <CardTitle className="text-white group-hover:text-blue-400 transition-colors duration-300 text-xl">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Flexible pricing plans designed to grow with your cleaning business. Start small and scale as you expand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-sm relative transition-all duration-700 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl group-hover:text-blue-400 transition-colors duration-300">
                  Starter
                </CardTitle>
                <CardDescription className="text-slate-300">Perfect for small cleaning businesses</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl lg:text-5xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    $199
                  </span>
                  <span className="text-slate-300 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Up to 5 professionals",
                    "100 appointments/month",
                    "Basic scheduling",
                    "Payment tracking",
                    "Email support",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors duration-300"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 group-hover:animate-pulse flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-8">
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 hover:scale-105 py-3">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 backdrop-blur-sm relative transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 group transform scale-105">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl group-hover:text-blue-400 transition-colors duration-300">
                  Professional
                </CardTitle>
                <CardDescription className="text-slate-300">Ideal for growing cleaning companies</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl lg:text-5xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    $399
                  </span>
                  <span className="text-slate-300 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Up to 25 professionals",
                    "Unlimited appointments",
                    "Advanced scheduling",
                    "Payment processing",
                    "Analytics & reports",
                    "Priority support",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors duration-300"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 group-hover:animate-pulse flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-8">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg py-3">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-sm relative transition-all duration-700 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl group-hover:text-purple-400 transition-colors duration-300">
                  Enterprise
                </CardTitle>
                <CardDescription className="text-slate-300">For large cleaning service operations</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl lg:text-5xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                    $799
                  </span>
                  <span className="text-slate-300 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Unlimited professionals",
                    "Unlimited appointments",
                    "Multi-location support",
                    "Advanced integrations",
                    "Custom reporting",
                    "24/7 dedicated support",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors duration-300"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 group-hover:animate-pulse flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-8">
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 hover:scale-105 py-3">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 relative">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="transition-all duration-1000 hover:translate-x-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Why Choose Maids Flow?</h2>
              <p className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed">
                Built specifically for cleaning service businesses, Maids Flow understands the unique challenges you
                face. Our platform combines powerful features with an intuitive interface to help you manage your
                operations efficiently.
              </p>
              <div className="space-y-6">
                {["Trusted by 500+ cleaning companies", "99.9% uptime guarantee", "24/7 customer support"].map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center group transition-all duration-500 hover:translate-x-4"
                    >
                      <Star className="h-6 w-6 text-yellow-400 mr-4 group-hover:animate-spin transition-all duration-300 flex-shrink-0" />
                      <span className="text-slate-300 group-hover:text-white transition-colors duration-300 text-lg">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="relative group inline-block">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maids%20Flow%20%281%29-iwGGBAvJFCYKXI4CVTafdWy2BFNpLk.png"
                  alt="Maids Flow Platform"
                  className="h-64 w-64 lg:h-80 lg:w-80 mx-auto opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="absolute inset-0 animate-ping bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 animate-pulse">
            Ready to Transform Your Cleaning Business?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-12 leading-relaxed max-w-4xl mx-auto">
            Join hundreds of cleaning companies already using Maids Flow to streamline their operations and grow their
            business.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25 group border-0 animate-gradient-x"
              >
                <span className="group-hover:animate-pulse font-semibold">Start Your Free Trial</span>
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800/50 px-12 py-4 text-lg bg-transparent transition-all duration-500 hover:scale-110 hover:border-blue-400 hover:text-blue-400 hover:shadow-xl backdrop-blur-sm"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0 group">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maids%20Flow%20%281%29-iwGGBAvJFCYKXI4CVTafdWy2BFNpLk.png"
                alt="Maids Flow Logo"
                className="h-10 w-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Maids Flow
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {["Privacy Policy", "Terms of Service", "Contact"].map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 relative group"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400">© 2025 Maids Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
      `}</style>
    </div>
  )
}
