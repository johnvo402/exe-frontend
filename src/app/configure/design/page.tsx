import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

// interface PageProps {
//   searchParams: {
//     [key: string]: string | string[] | undefined;
//   };
// }

const Page = async () => {
  // const { id } = searchParams;

  // if (!id || typeof id !== "string") {
  //   return notFound();
  // }

  // const configuration = await db.configuration.findUnique({
  //   where: { id },
  //   include: { ConfigurationImage: { include: { imageUrl: true } } },
  // });

  // if (!configuration) {
  //   return notFound();
  // }
  // configure/design

  return <DesignConfigurator />;
};

export default Page;
