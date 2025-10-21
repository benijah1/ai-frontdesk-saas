"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thermometer } from "lucide-react"

export default function HVACPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-primary" />
            <CardTitle>HVAC Services</CardTitle>
          </div>
          <Badge variant="secondary">Available</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Heating or cooling issues? Our certified HVAC technicians provide diagnostics, tune-ups, repairs, and
            full system installs. Book through your AI Front Desk and get priority scheduling.
          </p>

          <Button className="mt-2" asChild>
            <a href="/support">Request HVAC Service</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
