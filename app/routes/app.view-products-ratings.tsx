import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Badge,
  DataTable,
  Link,
  Page,
  type TableData,
  Thumbnail,
} from "@shopify/polaris";
import prisma from "app/db.server";
import { authenticate } from "app/shopify.server";
import { useCallback, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(`

        query{
          products(first:100){
            nodes{
                id
                title
                publishedAt
                status
                handle
                media(first: 100){
                  nodes{
                    preview{
                      image{
                        url
                      }
                    }
                  }
                }
            }
          }
        }

      `);
    const { data } = await response.json();

    const promises = data?.products?.nodes.map(async (prod: any) => {
      const productId = prod.id?.split("/").pop();
      const avgRating = await prisma.ratings.aggregate({
        _avg: {
          rateValue: true,
        },
        where: {
          productId,
        },
      });
      return {
        ...prod,
        ratingValue: avgRating._avg.rateValue,
      };
    });

    const dataa = await Promise.all(promises);

    return dataa;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const ViewProductsRatingPage = () => {
  const data = useLoaderData<typeof loader>();

  const initialRows: TableData[][] = data!.map((product: any) => {
    const productId = product.id?.split("/").pop();
    const imageUrl =
      product.media?.nodes?.[0]?.preview?.image?.url ||
      "https://via.placeholder.com/100";

    return [
      <Thumbnail source={imageUrl} alt={product.title} key={productId} />,
      <Link
        removeUnderline
        url={`https://my-super-cool-test-store-yo.myshopify.com/products/${product.handle}`}
        key="navy-merino-wool"
        target="_blank"
      >
        {product.title}
      </Link>,
      product.ratingValue !== null && product.ratingValue !== undefined
        ? `${product.ratingValue.toFixed(2)}⭐`
        : "0⭐", // rating column (as string for sorting)
      <>
        <Badge tone="magic" children={`${product.status}`} />
      </>,
      product.publishedAt
        ? new Date(product.publishedAt).toLocaleDateString()
        : "Unpublished",
    ];
  });

  const [rows, setRows] = useState<TableData[][]>(initialRows);

  const handleSort = useCallback(
    (index: number, direction: "ascending" | "descending") => {
      const sorted = [...rows].sort((a, b) => {
        const valA = parseFloat((a[index] || "0").toString());
        const valB = parseFloat((b[index] || "0").toString());
        return direction === "descending" ? valB - valA : valA - valB;
      });
      setRows(sorted);
    },
    [rows],
  );

  if (!data) return null;

  return (
    <Page title="View ratings">
      <DataTable
        columnContentTypes={[
          "text", // image
          "text", // title
          "numeric", // rating
          "text", // status
          "text", // publishedAt
        ]}
        headings={[
          "Image",
          "Product Title",
          "Avg Rating",
          "Status",
          "Published At",
        ]}
        rows={rows}
        footerContent={`Showing ${rows.length} of ${rows.length} results`}
        sortable={[false, false, true, false, false]}
        defaultSortDirection="descending"
        initialSortColumnIndex={2}
        onSort={handleSort}
      />
    </Page>
  );
};

export default ViewProductsRatingPage;
