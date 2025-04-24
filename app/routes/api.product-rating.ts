import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";

import prisma from "app/db.server";
import { ratingsSchema } from "app/schemas";
import { cors } from "remix-utils/cors";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId)
      return await cors(
        request,
        new Response(JSON.stringify({ message: "Produtc id is required" })),
        {
          origin: "*",
        },
      );

    const avgrating = await prisma.ratings.aggregate({
      where: {
        productId: +productId,
      },
      _avg: {
        rateValue: true,
      },
    });

    return await cors(
      request,
      new Response(JSON.stringify(avgrating._avg.rateValue)),
      {
        origin: "*",
      },
    );
  } catch (error) {
    console.log(error);
    return await cors(
      request,
      new Response(
        JSON.stringify({
          message: "Something went wrong. Please try again",
          error: error,
        }),
      ),
      {
        origin: "*",
      },
    );
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { productId, rateValue, shopId, shopDomain, userId } =
      ratingsSchema.parse(body);

    const userRatingExists = await prisma.ratings.findFirst({
      where: {
        userId: userId,
        productId: productId,
        shopId: shopId,
      },
    });
    let dbresp;
    if (userRatingExists) {
      dbresp = await prisma.ratings.update({
        where: {
          id: userRatingExists.id,
          shopId: shopId,
          userId: userId,
          productId: productId,
        },
        data: {
          rateValue,
        },
      });
    } else {
      dbresp = await prisma.ratings.create({
        data: {
          productId,
          rateValue,
          shopDomain,
          shopId,
          userId,
        },
      });
    }
    return await cors(
      request,
      new Response(
        JSON.stringify({
          message: "Rating added successfully",
          data: dbresp,
        }),
      ),
      {
        origin: "*",
      },
    );
  } catch (error) {
    console.log(error);
    return cors(
      request,
      new Response(
        JSON.stringify({
          message: "Something went wrong. Please try again",
          error: error,
        }),
      ),

      {
        origin: "*",
      },
    );
  }
}
