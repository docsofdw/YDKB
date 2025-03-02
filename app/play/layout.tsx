import ClientGameProvider from "@/app/components/ClientGameProvider";

export const metadata = {
  title: 'Play | You Don\'t Know Ball',
  description: 'Test your NFL knowledge with daily challenges and on-demand quizzes.',
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-deep-slate flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-10 flex flex-col">
        <ClientGameProvider>{children}</ClientGameProvider>
      </div>
    </div>
  )
} 