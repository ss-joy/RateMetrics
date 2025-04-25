import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Divider, Page } from "@shopify/polaris";
import prisma from "app/db.server";
import { authenticate } from "app/shopify.server";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const shopifyColors = [
  "#5c6ac4", // Indigo
  "#50b83c", // Green
  "#47c1bf", // Teal
  "#007ace", // Blue
  "#9c6ade", // Purple
  "#eec200", // Yellow
  "#de3618", // Red
];

function ProductRatingsChart({ data }: { data: any[] }) {
  const labels = data.map((prod) => prod.title);
  const ratings = data.map((prod) => prod.ratingValue ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Average Rating",
        data: ratings,
        backgroundColor: labels.map(
          (_, i) => shopifyColors[i % shopifyColors.length], // rotate colors
        ),
        borderColor: labels.map(
          (_, i) => shopifyColors[i % shopifyColors.length],
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#6d7175", // Shopify gray
        },
      },
      title: {
        display: true,
        text: "Product Ratings",
        color: "#202223", // Shopify black
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          color: "#6d7175", // gray text
        },
      },
      x: {
        ticks: {
          color: "#6d7175",
          maxRotation: 45,
          minRotation: 30,
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
}

type Props = {
  data: any[]; // same data from the loader
};
function ProductRatingsPieChart({ data }: Props) {
  const filtered = data.filter((prod) => typeof prod.ratingValue === "number");

  const labels = filtered.map((prod) => prod.title);
  const values = filtered.map((prod) => prod.ratingValue);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Average Rating by Product",
        data: values,
        backgroundColor: labels.map(
          (_, i) => shopifyColors[i % shopifyColors.length],
        ),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#6d7175",
        },
      },
      title: {
        display: true,
        text: "Average Rating Distribution",
        color: "#202223",
        font: {
          size: 18,
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}

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
const ViewAppAnalytics = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <Page title="Analytics">
      <BlockStack gap="600">
        <Card>
          <ProductRatingsChart data={data as any[]}></ProductRatingsChart>
        </Card>
        <Divider />
        <Card>
          <ProductRatingsPieChart data={data as any[]} />
        </Card>
      </BlockStack>
    </Page>
  );
};

export default ViewAppAnalytics;
