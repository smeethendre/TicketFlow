import { MovieDetailClient } from "@/components/movie-detail-client";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MovieDetailClient movieId={id} />;
}
