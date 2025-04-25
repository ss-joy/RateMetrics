import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DataTable, Page } from "@shopify/polaris";
import prisma from "app/db.server";
import { authenticate } from "app/shopify.server";

function convertBigIntsToStrings(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntsToStrings(value),
      ]),
    );
  } else if (typeof obj === "bigint") {
    return obj.toString();
  } else {
    return obj;
  }
}

type Products = {
  id: number;
  userId: bigint;
  productId: bigint;
  shopId: bigint;
  shopDomain: string;
  rateValue: number;
}[];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const productRatings = await prisma.ratings.findMany();
    const safeProductRatings: Products =
      convertBigIntsToStrings(productRatings);

    const promises = safeProductRatings.map(async (product) => {
      const response = await admin.graphql(`
        query{
          product(id:"gid://shopify/Product/${product.productId}"){
              id
              title
            }
          }
      `);
      const { data } = await response.json();
      return {
        ...product,
        productGid: data.product.id,
        title: data.product.title,
      };
    });
    const finaldata = await Promise.all(promises);
    return finaldata;
  } catch (error) {
    console.error(error);
    return null;
  }
}
const ViewProductsRatingPage = () => {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  if (!data) return;
  const rows = data.map((item) => [
    item.title,
    item.rateValue,
    item.productId,
    item.shopId,
  ]);

  return (
    <Page title="View ratings">
      <DataTable
        columnContentTypes={["text", "numeric", "numeric", "numeric"]}
        headings={["Product Title", "Rating", "Product Id", "Shop Id"]}
        rows={rows}
      />
    </Page>
  );
};

export default ViewProductsRatingPage;
