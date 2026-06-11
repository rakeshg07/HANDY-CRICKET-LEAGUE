import { GameRouter } from '@/components/GameRouter';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <GameRouter />
    </ProtectedRoute>
  );
}
