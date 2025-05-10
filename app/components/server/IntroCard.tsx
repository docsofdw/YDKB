'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { Play, History } from "lucide-react";

interface IntroCardProps {
  title: string;
  description: string;
  startBtnHref: string;
  archiveBtnHref?: string;
}

export default function IntroCard({ 
  title, 
  description, 
  startBtnHref,
  archiveBtnHref = "/archive" 
}: IntroCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg bg-surface/80 border-gray-700/50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <p className="text-gray-300">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-1 pb-4 px-6">
        <Link href={startBtnHref} className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto px-5 py-2 h-auto"
            variant="default"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Now
          </Button>
        </Link>
        
        {archiveBtnHref && (
          <Link href={archiveBtnHref} className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-4 py-2 h-auto"
            >
              <History className="w-4 h-4 mr-2" />
              View Archive
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
} 