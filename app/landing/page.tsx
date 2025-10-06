"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Shield,
  Clock,
  Star,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Languages,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getTranslation, type Language } from "@/lib/translations/landing"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [language, setLanguage] = useState<Language>("en")
  const t = getTranslation(language)

  const whatsappNumber = "+18134698765"
  const whatsappMessage = "Hello! I'm interested in Maids Flow."
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt-BR" : "en"))
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <nav
        className={`fixed top-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur-lg transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Maids Flow Logo"
                  className="h-10 w-10 transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-foreground transition-all duration-300">Maids Flow</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { href: "#features", label: t.nav.features },
                { href: "#benefits", label: t.nav.benefits },
                { href: "#pricing", label: t.nav.pricing },
              ].map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 relative group font-medium"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-muted-foreground hover:text-foreground"
                title={language === "en" ? "Mudar para Português" : "Switch to English"}
              >
                <Languages className="h-5 w-5 mr-2" />
                {language === "en" ? "PT" : "EN"}
              </Button>
              <Link href="/login">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200">
                  {t.nav.signIn}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-foreground"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"} overflow-hidden bg-background/95 backdrop-blur-lg border-t border-border`}
        >
          <div className="px-4 py-4 space-y-4">
            {[
              { href: "#features", label: t.nav.features },
              { href: "#benefits", label: t.nav.benefits },
              { href: "#pricing", label: t.nav.pricing },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-all duration-200 py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Languages className="h-5 w-5 mr-2" />
              {language === "en" ? "Português (BR)" : "English"}
            </Button>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">{t.nav.signIn}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div
              className={`transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
            >
              <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                <Sparkles className="h-3 w-3 mr-1" />
                {t.hero.badge}
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t.hero.title} <span className="text-accent">{t.hero.titleAccent}</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{t.hero.description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground group">
                    {t.hero.getStarted}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary bg-transparent">
                  {t.hero.watchDemo}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
                {[
                  { value: "500+", label: t.hero.stats.companies },
                  { value: "50K+", label: t.hero.stats.appointments },
                  { value: "99.9%", label: t.hero.stats.uptime },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
            >
              <div className="relative">
                <Card className="bg-card border-border overflow-hidden">
                  <CardHeader className="border-b border-border bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground">{t.dashboard.title}</CardTitle>
                        <CardDescription>{t.dashboard.subtitle}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t.dashboard.active}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: t.dashboard.totalCustomers, value: "248", icon: Users, color: "text-blue-400" },
                        { label: t.dashboard.appointments, value: "1,234", icon: Calendar, color: "text-cyan-400" },
                        { label: t.dashboard.activeTeams, value: "12", icon: Users, color: "text-green-400" },
                        { label: t.dashboard.revenue, value: "$45.2K", icon: TrendingUp, color: "text-purple-400" },
                      ].map((stat, index) => (
                        <div key={index} className="bg-secondary/50 rounded-lg p-4 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Status Indicators */}
                    <div className="space-y-3">
                      {[
                        { label: t.dashboard.scheduled, count: 45, color: "bg-blue-500" },
                        { label: t.dashboard.confirmed, count: 32, color: "bg-green-500" },
                        { label: t.dashboard.inProgress, count: 8, color: "bg-cyan-500" },
                      ].map((status, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                            <span className="text-sm text-muted-foreground">{status.label}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Floating accent elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <Zap className="h-3 w-3 mr-1" />
              {t.features.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.features.title}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t.features.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: t.features.smartScheduling.title,
                desc: t.features.smartScheduling.desc,
                color: "text-blue-400",
                bgColor: "bg-blue-500/10",
              },
              {
                icon: Users,
                title: t.features.teamManagement.title,
                desc: t.features.teamManagement.desc,
                color: "text-green-400",
                bgColor: "bg-green-500/10",
              },
              {
                icon: CreditCard,
                title: t.features.paymentProcessing.title,
                desc: t.features.paymentProcessing.desc,
                color: "text-purple-400",
                bgColor: "bg-purple-500/10",
              },
              {
                icon: BarChart3,
                title: t.features.businessAnalytics.title,
                desc: t.features.businessAnalytics.desc,
                color: "text-cyan-400",
                bgColor: "bg-cyan-500/10",
              },
              {
                icon: Clock,
                title: t.features.timeTracking.title,
                desc: t.features.timeTracking.desc,
                color: "text-orange-400",
                bgColor: "bg-orange-500/10",
              },
              {
                icon: Shield,
                title: t.features.secureReliable.title,
                desc: t.features.secureReliable.desc,
                color: "text-red-400",
                bgColor: "bg-red-500/10",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-accent/50 transition-all duration-300 group hover:shadow-lg"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-foreground group-hover:text-accent transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Target className="h-3 w-3 mr-1" />
                {t.benefits.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{t.benefits.title}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t.benefits.subtitle}</p>

              <div className="space-y-6">
                {[
                  {
                    metric: "40%",
                    label: t.benefits.efficiency,
                    icon: TrendingUp,
                    color: "text-green-400",
                  },
                  {
                    metric: "60%",
                    label: t.benefits.conflicts,
                    icon: Calendar,
                    color: "text-blue-400",
                  },
                  {
                    metric: "3x",
                    label: t.benefits.payment,
                    icon: Zap,
                    color: "text-cyan-400",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0`}>
                      <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground mb-1">{benefit.metric}</div>
                      <div className="text-muted-foreground">{benefit.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: t.benefits.stats.appointmentsManaged, value: "1.2M+", icon: Calendar },
                { title: t.benefits.stats.activeUsers, value: "15K+", icon: Users },
                { title: t.benefits.stats.satisfaction, value: "98%", icon: Star },
                { title: t.benefits.stats.timeSaved, value: "20hrs/week", icon: Clock },
              ].map((stat, index) => (
                <Card key={index} className="bg-card border-border hover:border-accent/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-accent mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">{t.pricing.badge}</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">{t.pricing.starter.title}</CardTitle>
                <CardDescription>{t.pricing.starter.subtitle}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$49</span>
                  <span className="text-muted-foreground">{t.pricing.month}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {t.pricing.starter.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-transparent" variant="outline">
                    {t.pricing.getStarted}
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-card border-accent relative hover:shadow-xl transition-all duration-300 scale-105">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                {t.pricing.professional.badge}
              </Badge>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">{t.pricing.professional.title}</CardTitle>
                <CardDescription>{t.pricing.professional.subtitle}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$149</span>
                  <span className="text-muted-foreground">{t.pricing.month}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {t.pricing.professional.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {t.pricing.getStarted}
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">{t.pricing.enterprise.title}</CardTitle>
                <CardDescription>{t.pricing.enterprise.subtitle}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$399</span>
                  <span className="text-muted-foreground">{t.pricing.month}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-6">
                  {t.pricing.enterprise.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-transparent" variant="outline">
                    {t.pricing.contactSales}
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
            <CardContent className="p-12 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.cta.title}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t.cta.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground group">
                    {t.cta.startTrial}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary bg-transparent">
                  {t.cta.scheduleDemo}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Maids Flow Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Maids Flow</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {t.footer.links.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
