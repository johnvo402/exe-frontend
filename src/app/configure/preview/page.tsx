import { db } from '@/db';
import { notFound } from 'next/navigation';
import DesignPreview from './DesignPreview';

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { configId } = searchParams;

  if (!configId || typeof configId !== 'string') {
    return notFound();
  }

  const configuration = await db.configuration.findUnique({
    where: { id: configId },
    include: { croppedImages: true },
  });

  if (!configuration) {
    return notFound();
  }

  return <DesignPreview configuration={configuration} />;
};

export default Page;
