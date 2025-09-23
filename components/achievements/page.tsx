"use client";

import { Container } from "@/components/ui/Container";
import { SubContainer } from "@/components/ui/SubContainer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";
import AchievementList from "@/components/student/AchievementList";

export default function AchievementsPage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <Container className="grid gap-2 grid-cols-1">
      <SubContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Todas as Conquistas</h1>
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonLoader
                variant="text"
                lines={1}
                className="h-10 w-1/3 mb-6"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="border rounded-2xl p-5 bg-container border-gray-200 dark:bg-subcontainer dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <SkeletonLoader
                        variant="rect"
                        className="w-14 h-14 rounded-lg"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <SkeletonLoader
                          variant="text"
                          lines={1}
                          className="h-5 w-3/4"
                        />
                        <SkeletonLoader
                          variant="text"
                          lines={1}
                          className="h-4 w-full"
                        />
                        <SkeletonLoader
                          variant="text"
                          lines={1}
                          className="h-3 w-1/2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <AchievementList userId={user?.id} />
          )}
        </div>
      </SubContainer>
    </Container>
  );
}
