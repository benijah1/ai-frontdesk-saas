"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"

export default function BathroomPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            <CardTitle>Bathroom Services</CardTitle>
          </div>
          <Badge variant="secondary">Available</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Our certified technicians handle everything from leaky faucets and clogged drains to full bathroom
            remodeling projects. Schedule service quickly and easily with your AI Front Desk assistant.
          </p>

          <Button className="mt-2" asChild>
            <a href="/support">Request Service</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
