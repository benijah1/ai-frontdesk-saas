"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"

export default function PlumbingPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle>Plumbing Services</CardTitle>
          </div>
          <Badge variant="secondary">Available</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            From leaks and clogs to water-heater installs, our licensed plumbers handle it all. Submit a request and
            your AI Front Desk will confirm timing and details.
          </p>

          <Button className="mt-2" asChild>
            <a href="/support">Request Plumbing Service</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
